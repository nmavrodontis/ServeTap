import { useContext, useState } from "react";
import { CartContext } from "../context/CartContextObject";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./OrderPage.css";
import { getActiveTableId } from "../utils/tableRouting";
import { createOrder } from "../services/ordersApi";

function OrderPage() {
  const { cart, clearCart, removeFromCart, updateCartItemNote } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleSubmitOrder = async () => {
  if (cart.length === 0) return;
  if (!tableId) {
    window.alert("Δεν εντοπίστηκε τραπέζι. Σκάναρε ξανά το QR.");
    return;
  }

  try {
    await createOrder({ tableId, cart, total });
    clearCart();
    setIsSubmitted(true);
  } catch (err) {
    console.error(err);
    window.alert("Αποτυχία αποστολής παραγγελίας.");
  }
};

  return (
    <div className="order-container">
      <BackButton />
      <div className="order-overlay">
        <div className={`order-card ${isSubmitted ? "order-card-submitted" : ""}`}>
          <h2>Τελική Παραγγελία</h2>
          <p className="order-table">Τραπέζι: {tableId || "-"}</p>

          {cart.length === 0 && !isSubmitted && (
            <p className="order-empty">Δεν υπάρχουν προϊόντα στο καλάθι.</p>
          )}

          {cart.length > 0 && !isSubmitted && (
            <div className="order-items">
              {cart.map((item, i) => (
                <div key={item.cartItemId || `${item.id}-${i}`} className="order-item-row">
                  <div>
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-price">{item.price.toFixed(2)} €</p>
                    <label className="order-note-label">
                      Σημείωση
                      <select
                        className="order-note-select"
                        value={item.note || "Χωρίς σημείωση"}
                        onChange={(event) =>
                          updateCartItemNote(
                            item.cartItemId,
                            event.target.value
                          )
                        }
                      >
                        {(item.noteOptions || ["Χωρίς σημείωση"]).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    className="order-remove-button"
                    onClick={() => removeFromCart(i)}
                  >
                    Αφαίρεση
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && !isSubmitted && (
            <h3 className="order-total">Σύνολο: {total.toFixed(2)} €</h3>
          )}

          {isSubmitted && (
            <div className="order-success">
              <div className="order-success-icon">✓</div>
              <p>Η παραγγελία στάλθηκε στο bar</p>
              <button onClick={() => navigate("/kitchen")}>Προβολή στο Dashboard</button>
            </div>
          )}

          {!isSubmitted && cart.length > 0 && (
            <button className="order-submit-button" onClick={handleSubmitOrder}>
              Υποβολή Παραγγελίας στο Bar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
