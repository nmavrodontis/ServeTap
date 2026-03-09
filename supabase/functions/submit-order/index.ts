import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ORDER_LIMITS = {
  maxTotalItems: 25,
  maxDistinctProducts: 15,
  maxPerProduct: 8,
  maxOrderTotal: 120,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OrderItemInput = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
};

type SubmitOrderPayload = {
  tableId: string;
  total: number;
  items: OrderItemInput[];
  idempotencyKey?: string;
  fingerprint?: string;
  tableToken?: string;
};

function toSafePrice(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function validatePayload(payload: SubmitOrderPayload) {
  const tableId = String(payload?.tableId || "").trim();
  if (!tableId) {
    return { ok: false, code: "TABLE_REQUIRED", message: "Δεν εντοπίστηκε τραπέζι." };
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (items.length === 0) {
    return { ok: false, code: "EMPTY_CART", message: "Το καλάθι είναι άδειο." };
  }

  if (items.length > ORDER_LIMITS.maxTotalItems) {
    return {
      ok: false,
      code: "MAX_ITEMS_EXCEEDED",
      message: `Υπέρβαση ορίου: έως ${ORDER_LIMITS.maxTotalItems} τεμάχια ανά παραγγελία.`,
    };
  }

  const distinctProducts = new Set(items.map((item) => String(item.productId || "")));
  if (distinctProducts.size > ORDER_LIMITS.maxDistinctProducts) {
    return {
      ok: false,
      code: "MAX_DISTINCT_EXCEEDED",
      message: `Υπέρβαση ορίου: έως ${ORDER_LIMITS.maxDistinctProducts} διαφορετικά είδη.`,
    };
  }

  const perProductCounts = new Map<string, number>();
  let computedTotal = 0;

  for (const item of items) {
    const productId = String(item?.productId || "");
    const qty = Number(item?.qty) || 1;
    const price = toSafePrice(item?.price);

    if (!productId || !item?.name) {
      return { ok: false, code: "INVALID_ITEM", message: "Μη έγκυρα στοιχεία προϊόντος." };
    }

    if (qty < 1) {
      return { ok: false, code: "INVALID_QTY", message: "Μη έγκυρη ποσότητα προϊόντος." };
    }

    const nextCount = (perProductCounts.get(productId) || 0) + qty;
    perProductCounts.set(productId, nextCount);

    if (nextCount > ORDER_LIMITS.maxPerProduct) {
      return {
        ok: false,
        code: "MAX_PER_PRODUCT_EXCEEDED",
        message: `Υπέρβαση ορίου: έως ${ORDER_LIMITS.maxPerProduct} τεμάχια ανά προϊόν.`,
      };
    }

    computedTotal += price * qty;
  }

  computedTotal = Number(computedTotal.toFixed(2));
  if (computedTotal > ORDER_LIMITS.maxOrderTotal) {
    return {
      ok: false,
      code: "MAX_TOTAL_EXCEEDED",
      message: `Υπέρβαση ορίου: μέγιστο σύνολο ${ORDER_LIMITS.maxOrderTotal.toFixed(2)} €.`,
    };
  }

  const payloadTotal = Number(Number(payload?.total || 0).toFixed(2));
  if (Math.abs(payloadTotal - computedTotal) > 0.01) {
    return {
      ok: false,
      code: "TOTAL_MISMATCH",
      message: "Ασυμφωνία συνόλου παραγγελίας.",
    };
  }

  return { ok: true, tableId, items, computedTotal };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond(405, { ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed." });
  }

  let payload: SubmitOrderPayload;
  try {
    payload = await req.json();
  } catch {
    return respond(400, { ok: false, code: "INVALID_JSON", message: "Μη έγκυρο request body." });
  }

  const validation = validatePayload(payload);
  if (!validation.ok) {
    return respond(400, validation);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return respond(500, {
      ok: false,
      code: "SERVER_MISCONFIGURED",
      message: "Server misconfiguration: missing Supabase env vars.",
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: orderRow, error: orderError } = await admin
    .from("orders")
    .insert({
      table_id: validation.tableId,
      total: validation.computedTotal,
      status: "new",
    })
    .select("id")
    .single();

  if (orderError || !orderRow?.id) {
    return respond(500, {
      ok: false,
      code: "ORDER_INSERT_FAILED",
      message: orderError?.message || "Αποτυχία δημιουργίας παραγγελίας.",
    });
  }

  const orderItems = validation.items.map((item) => ({
    order_id: orderRow.id,
    product_id: String(item.productId),
    name: item.name,
    price: toSafePrice(item.price),
    qty: Number(item.qty) || 1,
    note: item.note || "",
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItems);
  if (itemsError) {
    await admin.from("orders").delete().eq("id", orderRow.id);
    return respond(500, {
      ok: false,
      code: "ORDER_ITEMS_INSERT_FAILED",
      message: itemsError.message || "Αποτυχία αποθήκευσης προϊόντων παραγγελίας.",
    });
  }

  return respond(200, {
    ok: true,
    orderId: orderRow.id,
  });
});
