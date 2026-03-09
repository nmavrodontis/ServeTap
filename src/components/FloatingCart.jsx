import { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContextObject";
import { Link, useLocation } from "react-router-dom";
import "./FloatingCart.css";
import { getActiveTableId, getOrCreateActiveVisitToken, withTable } from "../utils/tableRouting";

function FloatingCart() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const tableToken = getOrCreateActiveVisitToken(location.search, tableId);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart]
  );

  return (
    <div className="floating-cart-root">
      <button
        className="floating-cart-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Άνοιγμα καλαθιού"
      >
        🛒
        {cart.length > 0 && <span className="floating-cart-badge">{cart.length}</span>}
      </button>

      {isOpen && (
        <div className="floating-cart-panel">
          <div className="floating-cart-header">
            <h4>Το Καλάθι σου</h4>
            <button
              className="floating-cart-close"
              onClick={() => setIsOpen(false)}
              aria-label="Κλείσιμο καλαθιού"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="floating-cart-empty">Το καλάθι είναι άδειο.</p>
          ) : (
            <>
              <div className="floating-cart-items">
                {cart.map((item, index) => (
                  <div key={item.cartItemId || `${item.id}-${index}`} className="floating-cart-item">
                    <div>
                      <p className="floating-cart-item-name">{item.name}</p>
                      <p className="floating-cart-item-price">{item.price.toFixed(2)} €</p>
                      {item.note && item.note !== "Χωρίς σημείωση" && (
                        <p className="floating-cart-item-note">Σημείωση: {item.note}</p>
                      )}
                    </div>
                    <button
                      className="floating-cart-remove"
                      onClick={() => removeFromCart(index)}
                      aria-label={`Αφαίρεση ${item.name}`}
                    >
                      Αφαίρεση
                    </button>
                  </div>
                ))}
              </div>

              <div className="floating-cart-footer">
                <strong>Σύνολο: {total.toFixed(2)} €</strong>
                <div className="floating-cart-actions">
                  <Link
                    to={withTable("/order", tableId, tableToken)}
                    className="floating-cart-checkout"
                    onClick={() => setIsOpen(false)}
                  >
                    Ολοκλήρωση
                  </Link>
                  <button className="floating-cart-clear" onClick={clearCart}>
                    Άδειασμα
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FloatingCart;
