import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WAITER_LIMITS = {
  submitCooldownSeconds: 8,
  submitWindowSeconds: 20,
  maxSubmitsPerWindow: 2,
  maxNoteLength: 180,
};

const ALLOWED_REQUEST_TYPES = new Set(["assistance", "payment"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CallWaiterPayload = {
  tableId: string;
  requestType: string;
  note?: string;
  idempotencyKey?: string;
  fingerprint?: string;
  tableToken?: string;
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function sanitizeNote(value: unknown) {
  return String(value || "").trim().slice(0, WAITER_LIMITS.maxNoteLength);
}

function validatePayload(payload: CallWaiterPayload) {
  const tableId = String(payload?.tableId || "").trim();
  if (!tableId) {
    return { ok: false, code: "TABLE_REQUIRED", message: "Δεν εντοπίστηκε τραπέζι." };
  }

  const requestType = String(payload?.requestType || "").trim().toLowerCase();
  if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
    return {
      ok: false,
      code: "INVALID_REQUEST_TYPE",
      message: "Μη έγκυρος τύπος κλήσης σερβιτόρου.",
    };
  }

  const note = sanitizeNote(payload?.note);

  return {
    ok: true,
    tableId,
    requestType,
    note,
  };
}

async function checkRateLimit(
  admin: ReturnType<typeof createClient>,
  tableId: string,
) {
  const nowMs = Date.now();
  const cooldownMs = WAITER_LIMITS.submitCooldownSeconds * 1000;
  const windowMs = WAITER_LIMITS.submitWindowSeconds * 1000;
  const windowIso = new Date(nowMs - windowMs).toISOString();

  const { data, error } = await admin
    .from("waiter_calls")
    .select("created_at")
    .eq("table_id", tableId)
    .gte("created_at", windowIso)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("waiter_calls read skipped:", error.message);
    return { ok: true };
  }

  const attempts = Array.isArray(data) ? data : [];
  const latest = attempts[0]?.created_at ? Date.parse(attempts[0].created_at) : 0;

  if (latest && Number.isFinite(latest) && nowMs - latest < cooldownMs) {
    return {
      ok: false,
      code: "WAITER_CALL_COOLDOWN",
      message: "Μόλις έστειλες κλήση. Περίμενε λίγα δευτερόλεπτα.",
    };
  }

  if (attempts.length >= WAITER_LIMITS.maxSubmitsPerWindow) {
    return {
      ok: false,
      code: "WAITER_CALL_WINDOW_LIMIT",
      message: "Πολλές κλήσεις σε λίγο χρόνο. Δοκίμασε ξανά σε λίγο.",
    };
  }

  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond(405, {
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed.",
    });
  }

  let payload: CallWaiterPayload;
  try {
    payload = await req.json();
  } catch {
    return respond(400, {
      ok: false,
      code: "INVALID_JSON",
      message: "Μη έγκυρο request body.",
    });
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

  const rateLimit = await checkRateLimit(admin, validation.tableId);
  if (!rateLimit.ok) {
    return respond(429, rateLimit);
  }

  const { data: callRow, error } = await admin
    .from("waiter_calls")
    .insert({
      table_id: validation.tableId,
      request_type: validation.requestType,
      note: validation.note,
      status: "pending",
      fingerprint: String(payload?.fingerprint || "").trim() || null,
      idempotency_key: String(payload?.idempotencyKey || "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !callRow?.id) {
    return respond(500, {
      ok: false,
      code: "WAITER_CALL_INSERT_FAILED",
      message: error?.message || "Αποτυχία αποστολής κλήσης σερβιτόρου.",
    });
  }

  return respond(200, {
    ok: true,
    callId: callRow.id,
  });
});
