import { useContext } from "react";
import { CartContext } from "../context/CartContextObject";
import { Link, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import { getActiveTableId, withTable } from "../utils/tableRouting";

function CartPage() {
  const { cart, clearCart, removeFromCart } = useContext(CartContext);
  const location = useLocation();
  const tableId = getActiveTableId(location.search);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ padding: 20 }}>
      <BackButton />
      <h2>Το Καλάθι σου</h2>

      {cart.length === 0 && <p>Το καλάθι είναι άδειο.</p>}

      {cart.map((item, i) => (
        <div
          key={item.cartItemId || i}
          style={{
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            maxWidth: 420,
          }}
        >
          <div>
            <strong>
              {item.name} — {item.price} €
            </strong>
            {item.note && item.note !== "Χωρίς σημείωση" && (
              <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#555" }}>
                Σημείωση: {item.note}
              </p>
            )}
          </div>
          <button onClick={() => removeFromCart(i)}>Αφαίρεση</button>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <h3>Σύνολο: {total.toFixed(2)} €</h3>

          <Link to={withTable("/order", tableId)}>
            <button style={{ marginRight: 10 }}>Ολοκλήρωση Παραγγελίας</button>
          </Link>

          <button onClick={clearCart}>Άδειασμα Καλαθιού</button>
        </>
      )}
    </div>
  );
}

export default CartPage;
