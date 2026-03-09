import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContextObject";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./OrderPage.css";
import { getActiveTableId, getOrCreateActiveVisitToken } from "../utils/tableRouting";
import { createOrder, fetchVisitOrders, requestWaiter } from "../services/ordersApi";
import {
  canSubmitOrderNow,
  registerSuccessfulSubmit,
  validateCartForSubmit,
} from "../utils/orderGuards";
import {
  generateVerificationCode,
} from "../utils/phoneVerification";

function OrderPage() {
  const { cart, clearCart, removeFromCart, updateCartItemNote } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const tableToken = getOrCreateActiveVisitToken(location.search, tableId);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterNote, setWaiterNote] = useState("");
  const [waiterFeedback, setWaiterFeedback] = useState("");
  const [visitOrders, setVisitOrders] = useState([]);
  const [isLoadingVisitOrders, setIsLoadingVisitOrders] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    const loadVisitOrders = async () => {
      if (!tableId || !tableToken) {
        setVisitOrders([]);
        return;
      }

      try {
        setIsLoadingVisitOrders(true);
        const data = await fetchVisitOrders({ tableId, tableToken });
        setVisitOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingVisitOrders(false);
      }
    };

    loadVisitOrders();
  }, [tableId, tableToken, isSubmitted]);

  const openVerification = () => {
    const code = generateVerificationCode();
    setVerificationCode(code);
    setVerificationInput("");
    setIsVerificationOpen(true);
  };

  const closeVerification = () => {
    setIsVerificationOpen(false);
    setVerificationInput("");
    setVerificationCode("");
  };

  const verifyCodeInput = () => {
    if (!verificationInput.trim()) {
      return false;
    }

    if (verificationInput.trim() !== verificationCode) {
      window.alert("Λάθος κωδικός επιβεβαίωσης.");
      return false;
    }

    return true;
  };

  const submitOrder = async () => {
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

    openVerification();
  };

  const handleConfirmVerification = async () => {
    if (!verifyCodeInput()) {
      return;
    }

    closeVerification();
    await submitOrder();
  };

  const handleRequestWaiter = async (requestType) => {
    if (isCallingWaiter) {
      return;
    }

    if (!tableId) {
      window.alert("Δεν εντοπίστηκε τραπέζι. Σκάναρε ξανά το QR.");
      return;
    }

    try {
      setIsCallingWaiter(true);
      await requestWaiter({
        tableId,
        requestType,
        note: waiterNote,
        tableToken,
      });

      setWaiterNote("");
      setWaiterFeedback(
        requestType === "payment"
          ? "Ο σερβιτόρος ειδοποιήθηκε για πληρωμή και έρχεται στο τραπέζι σου."
          : "Ο σερβιτόρος ειδοποιήθηκε και έρχεται στο τραπέζι σου."
      );
    } catch (err) {
      console.error(err);
      window.alert(err?.message || "Αποτυχία κλήσης σερβιτόρου.");
    } finally {
      setIsCallingWaiter(false);
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

          {!isSubmitted && (
            <section className="waiter-help-card">
              <h3>Χρειάζεσαι σερβιτόρο;</h3>
              <p>
                Κάλεσε σερβιτόρο για ερώτηση ή για πληρωμή και θα έρθει στο τραπέζι σου.
              </p>

              <textarea
                className="waiter-note-input"
                value={waiterNote}
                onChange={(event) => setWaiterNote(event.target.value.slice(0, 180))}
                placeholder="Προαιρετική σημείωση (π.χ. θέλω λογαριασμό / έχω ερώτηση)"
              />

              <div className="waiter-actions">
                <button
                  type="button"
                  className="waiter-button waiter-button-assistance"
                  onClick={() => handleRequestWaiter("assistance")}
                  disabled={isCallingWaiter}
                >
                  {isCallingWaiter ? "Αποστολή..." : "Κλήση Σερβιτόρου"}
                </button>

                <button
                  type="button"
                  className="waiter-button waiter-button-payment"
                  onClick={() => handleRequestWaiter("payment")}
                  disabled={isCallingWaiter}
                >
                  {isCallingWaiter ? "Αποστολή..." : "Κλήση για Πληρωμή"}
                </button>
              </div>

              {waiterFeedback && <p className="waiter-feedback">{waiterFeedback}</p>}
            </section>
          )}

          <section className="visit-orders-card">
            <h3>Οι Παραγγελίες Μου Σε Αυτό Το Τραπέζι</h3>

            {isLoadingVisitOrders && <p>Φόρτωση ιστορικού...</p>}
            {!isLoadingVisitOrders && visitOrders.length === 0 && (
              <p>Δεν υπάρχει ακόμα ιστορικό για την τρέχουσα επίσκεψη.</p>
            )}

            {!isLoadingVisitOrders && visitOrders.length > 0 && (
              <div className="visit-orders-list">
                {visitOrders.map((order) => (
                  <div key={order.id} className="visit-order-item">
                    <div className="visit-order-top">
                      <strong>Παραγγελία #{order.id}</strong>
                      <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>

                    <div className="visit-order-lines">
                      {(order.order_items || []).map((item) => (
                        <p key={item.id}>
                          {item.qty}x {item.name}
                        </p>
                      ))}
                    </div>

                    <p className="visit-order-total">Σύνολο: {Number(order.total || 0).toFixed(2)} €</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isVerificationOpen && (
        <div className="verification-modal-backdrop" role="dialog" aria-modal="true">
          <div className="verification-modal">
            <h3>Επιβεβαίωση Παραγγελίας</h3>
            <p>Για επιβεβαίωση, πληκτρολόγησε τον παρακάτω κωδικό:</p>
            <div className="verification-code">{verificationCode}</div>

            <input
              className="verification-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              placeholder="Πληκτρολόγησε τον κωδικό"
              value={verificationInput}
              onChange={(event) => setVerificationInput(event.target.value.replace(/\D/g, ""))}
            />

            <div className="verification-actions">
              <button
                type="button"
                className="verification-cancel"
                onClick={closeVerification}
              >
                Ακύρωση
              </button>
              <button
                type="button"
                className="verification-confirm"
                onClick={handleConfirmVerification}
              >
                Επιβεβαίωση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;
