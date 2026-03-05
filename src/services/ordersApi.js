import { supabase } from "../lib/supabaseClient";

export async function createOrder({ tableId, cart, total }) {
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            table_id: tableId,
            total,
            status: "new",
        })
        .select("id")
        .single();

    if (orderError) throw orderError;

    const itemsPayload = cart.map((item) => ({
        order_id: order.id,
        product_id: String(item.id),
        name: item.name,
        price: item.price,
        qty: 1,
        note: item.note || "",
    }));

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

    if (itemsError) throw itemsError;

    return order.id;
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