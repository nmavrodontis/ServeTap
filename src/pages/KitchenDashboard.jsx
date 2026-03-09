import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import {
  fetchOrders,
  fetchWaiterCalls,
  markWaiterCallHandled,
} from "../services/ordersApi";

const toMoney = (value) => Number(value || 0).toFixed(2);

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [busyCallIds, setBusyCallIds] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersData, callsData] = await Promise.all([
          fetchOrders(),
          fetchWaiterCalls(),
        ]);
        setOrders(ordersData);
        setWaiterCalls(callsData);
      } catch (err) {
        console.error(err);
      }
    };

    load();

    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkWaiterCallHandled = async (callId) => {
    const id = Number(callId);
    if (!Number.isFinite(id)) {
      return;
    }

    setBusyCallIds((prev) => ({ ...prev, [id]: true }));

    try {
      await markWaiterCallHandled(id);
      setWaiterCalls((prev) => prev.filter((call) => Number(call.id) !== id));
    } catch (err) {
      console.error(err);
      window.alert(err?.message || "Αποτυχία ενημέρωσης κλήσης.");
    } finally {
      setBusyCallIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const toWaiterCallLabel = (type) => {
    if (String(type || "").toLowerCase() === "payment") {
      return "Πληρωμή";
    }

    return "Βοήθεια";
  };

  return (
    <div style={{ padding: 20 }}>
      <BackButton />
      <h2>Kitchen Dashboard</h2>

      <h3>Κλήσεις Σερβιτόρου</h3>
      {waiterCalls.length === 0 && <p>Δεν υπάρχουν ενεργές κλήσεις σερβιτόρου.</p>}

      {waiterCalls.map((call) => {
        const isBusy = Boolean(busyCallIds[Number(call.id)]);

        return (
          <div
            key={call.id}
            style={{
              marginBottom: 12,
              padding: 12,
              border: "1px solid #f1deac",
              borderRadius: 10,
              background: "#fff8e8",
            }}
          >
            <h4 style={{ margin: "0 0 8px" }}>Τραπέζι: {call.table_id}</h4>
            <p style={{ margin: "0 0 6px" }}>
              Τύπος: <strong>{toWaiterCallLabel(call.request_type)}</strong>
            </p>
            <p style={{ margin: "0 0 6px" }}>
              Ώρα: {new Date(call.created_at).toLocaleString()}
            </p>
            {call.note && <p style={{ margin: "0 0 8px" }}>Σημείωση: {call.note}</p>}

            <button
              type="button"
              onClick={() => handleMarkWaiterCallHandled(call.id)}
              disabled={isBusy}
              style={{
                border: "none",
                borderRadius: 8,
                background: "#1f6f3d",
                color: "#fff",
                padding: "8px 10px",
                fontWeight: 700,
                cursor: isBusy ? "not-allowed" : "pointer",
                opacity: isBusy ? 0.7 : 1,
              }}
            >
              {isBusy ? "Ενημέρωση..." : "Ολοκληρώθηκε"}
            </button>
          </div>
        );
      })}

      <h3>Παραγγελίες</h3>

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
