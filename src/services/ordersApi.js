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

function toMessage(error) {
    return String(error?.message || "").toLowerCase();
}

function isEdgeFunctionUnavailable(error) {
    const message = toMessage(error);
    return (
        error?.status === 404 ||
        message.includes("failed to send a request to the edge function") ||
        message.includes("edge function returned a non-2xx")
    );
}

async function createOrderDirectly(payload) {
    const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .insert({
            table_id: String(payload.tableId),
            total: Number(payload.total),
            status: "new",
        })
        .select("id")
        .single();

    if (orderError || !orderRow?.id) {
        throw orderError || new Error("Αποτυχία δημιουργίας παραγγελίας.");
    }

    const orderId = orderRow.id;
    const orderItems = (payload.items || []).map((item) => ({
        order_id: orderId,
        product_id: String(item.productId || ""),
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty) || 1,
        note: item.note || "",
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
        // Keep tables consistent if items insert fails after order creation.
        await supabase.from("orders").delete().eq("id", orderId);
        throw itemsError;
    }

    return orderId;
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

    if (!error && data?.ok && data?.orderId) {
        return data.orderId;
    }

    if (isEdgeFunctionUnavailable(error)) {
        return createOrderDirectly(payload);
    }

    if (error) {
        throw new Error(error.message || "Αποτυχία αποστολής παραγγελίας.");
    }

    if (!data?.ok) {
        const functionError = new Error(data?.message || "Αποτυχία αποστολής παραγγελίας.");
        functionError.code = data?.code || "ORDER_SUBMIT_FAILED";
        throw functionError;
    }

    throw new Error("Η παραγγελία ολοκληρώθηκε χωρίς αναγνωριστικό.");
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

function normalizeWaiterRequestType(value) {
    const type = String(value || "").trim().toLowerCase();
    if (type === "payment") {
        return "payment";
    }

    return "assistance";
}

export async function requestWaiter({ tableId, requestType, note, tableToken }) {
    const payload = {
        tableId: String(tableId || "").trim(),
        requestType: normalizeWaiterRequestType(requestType),
        note: String(note || "").trim(),
        idempotencyKey: makeRandomId(),
        fingerprint: getClientFingerprint(),
    };

    if (tableToken) {
        payload.tableToken = tableToken;
    }

    const { data, error } = await supabase.functions.invoke("call-waiter", {
        body: payload,
    });

    if (!error && data?.ok && data?.callId) {
        return data.callId;
    }

    if (isEdgeFunctionUnavailable(error)) {
        const { data: callRow, error: insertError } = await supabase
            .from("waiter_calls")
            .insert({
                table_id: payload.tableId,
                request_type: payload.requestType,
                note: payload.note || "",
                status: "pending",
                fingerprint: payload.fingerprint,
            })
            .select("id")
            .single();

        if (insertError || !callRow?.id) {
            throw new Error(insertError?.message || "Αποτυχία κλήσης σερβιτόρου.");
        }

        return callRow.id;
    }

    if (error) {
        throw new Error(error.message || "Αποτυχία κλήσης σερβιτόρου.");
    }

    if (!data?.ok) {
        const functionError = new Error(data?.message || "Αποτυχία κλήσης σερβιτόρου.");
        functionError.code = data?.code || "WAITER_CALL_FAILED";
        throw functionError;
    }

    throw new Error("Η κλήση σερβιτόρου ολοκληρώθηκε χωρίς αναγνωριστικό.");
}

export async function fetchWaiterCalls() {
    const { data, error } = await supabase
        .from("waiter_calls")
        .select("id, table_id, request_type, note, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return Array.isArray(data) ? data : [];
}

export async function markWaiterCallHandled(callId) {
    const normalizedId = Number(callId);
    if (!Number.isFinite(normalizedId)) {
        throw new Error("Μη έγκυρο αναγνωριστικό κλήσης.");
    }

    const { error } = await supabase
        .from("waiter_calls")
        .update({ status: "handled", handled_at: new Date().toISOString() })
        .eq("id", normalizedId);

    if (error) {
        throw error;
    }
}