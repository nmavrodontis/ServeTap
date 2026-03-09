import { useContext, useState } from "react";
import { CartContext } from "../context/CartContextObject";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./OrderPage.css";
import { getActiveTableId } from "../utils/tableRouting";
import { createOrder } from "../services/ordersApi";
import {
  canSubmitOrderNow,
  registerSuccessfulSubmit,
  validateCartForSubmit,
} from "../utils/orderGuards";
import {
  canUsePlatformVerification,
  getVerificationFallbackMessage,
  generateVerificationCode,
  verifyWithBiometrics,
} from "../utils/phoneVerification";

function OrderPage() {
  const { cart, clearCart, removeFromCart, updateCartItemNote } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const tableToken = new URLSearchParams(location.search).get("tableToken") || "";
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const verifyPhysicalPresence = async () => {
    const biometricAvailability = await canUsePlatformVerification();

    if (biometricAvailability.ok) {
      try {
        await verifyWithBiometrics();
        return true;
      } catch {
        window.alert("Biometric step failed or was canceled. Using code verification.");
      }
    } else {
      const detail = biometricAvailability.details ? `\n\nDetails: ${biometricAvailability.details}` : "";
      window.alert(`${getVerificationFallbackMessage(biometricAvailability.reason)}${detail}`);
    }

    const code = generateVerificationCode();
    const typed = window.prompt(
      `Επιβεβαίωση συσκευής. Πληκτρολόγησε τον κωδικό: ${code}`
    );

    if (!typed) {
      return false;
    }

    if (typed.trim() !== code) {
      window.alert("Λάθος κωδικός επιβεβαίωσης.");
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (isSubmitting) {
      return;
    }

    const tableValidation = canSubmitOrderNow(tableId);
    if (!tableValidation.ok) {
      window.alert(tableValidation.message);
      return;
    }

    const cartValidation = validateCartForSubmit(cart, total);
    if (!cartValidation.ok) {
      window.alert(cartValidation.message);
      return;
    }

    if (!tableId) {
      window.alert("Δεν εντοπίστηκε τραπέζι. Σκάναρε ξανά το QR.");
      return;
    }

    const isVerified = await verifyPhysicalPresence();
    if (!isVerified) {
      window.alert("Η επιβεβαίωση συσκευής ακυρώθηκε.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({ tableId, cart, total, tableToken });
      registerSuccessfulSubmit(tableId);
      clearCart();
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      window.alert(err?.message || "Αποτυχία αποστολής παραγγελίας.");
    } finally {
      setIsSubmitting(false);
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
            <button
              className="order-submit-button"
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Αποστολή..." : "Υποβολή Παραγγελίας στο Bar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
