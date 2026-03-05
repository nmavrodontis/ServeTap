import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { fetchOrders } from "../services/ordersApi";

const toMoney = (value) => Number(value || 0).toFixed(2);

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
  const load = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  load();
}, []);

  return (
    <div style={{ padding: 20 }}>
      <BackButton />
      <h2>Kitchen Dashboard</h2>

      {orders.length === 0 && <p>Δεν υπάρχουν νέες παραγγελίες.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            marginBottom: 16,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <h3 style={{ margin: "0 0 8px" }}>Τραπέζι: {order.table_id}</h3>
          <p style={{ margin: "0 0 8px" }}>
            Ώρα: {new Date(order.created_at).toLocaleString()}
          </p>

          {(order.order_items || []).map((item, index) => (
            <div key={item.cartItemId || `${order.id}-${index}`} style={{ margin: "0 0 6px" }}>
              <p style={{ margin: 0 }}>
                {item.name} — {toMoney(item.price)} €
              </p>
              {item.note && item.note !== "Χωρίς σημείωση" && (
                <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: "#555" }}>
                  Σημείωση: {item.note}
                </p>
              )}
            </div>
          ))}

          <strong>Σύνολο: {toMoney(order.total)} €</strong>
        </div>
      ))}
    </div>
  );
}

export default KitchenDashboard;
