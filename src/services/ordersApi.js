import { supabase } from "../lib/supabaseClient";

const CLIENT_SESSION_STORAGE_KEY = "orderClientSessionV1";

function makeRandomId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClientSessionId() {
    try {
        const existing = localStorage.getItem(CLIENT_SESSION_STORAGE_KEY);
        if (existing) {
            return existing;
        }

        const created = makeRandomId();
        localStorage.setItem(CLIENT_SESSION_STORAGE_KEY, created);
        return created;
    } catch {
        return makeRandomId();
    }
}

function getClientFingerprint() {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent || "unknown" : "unknown";
    const sessionId = getClientSessionId();
    return `${userAgent}::${sessionId}`;
}

function normalizeCartItems(cart) {
    return cart.map((item) => ({
        productId: String(item.id),
        name: item.name,
        price: Number(item.price),
        qty: 1,
        note: item.note || "",
    }));
}

export async function createOrder({ tableId, cart, total, tableToken }) {
    const payload = {
        tableId,
        total: Number(total),
        items: normalizeCartItems(cart),
        idempotencyKey: makeRandomId(),
        fingerprint: getClientFingerprint(),
    };

    if (tableToken) {
        payload.tableToken = tableToken;
    }

    const { data, error } = await supabase.functions.invoke("submit-order", {
        body: payload,
    });

    if (error) {
        throw error;
    }

    if (!data?.ok) {
        const functionError = new Error(data?.message || "Αποτυχία αποστολής παραγγελίας.");
        functionError.code = data?.code || "ORDER_SUBMIT_FAILED";
        throw functionError;
    }

    if (!data?.orderId) {
        throw new Error("Η παραγγελία ολοκληρώθηκε χωρίς αναγνωριστικό.");
    }

    return data.orderId;
}

export async function fetchOrders() {
    const { data, error } = await supabase
        .from("orders")
        .select(`
      id,
      table_id,
      total,
      status,
      created_at,
      order_items (
        id,
        name,
        price,
        qty,
        note
      )
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}