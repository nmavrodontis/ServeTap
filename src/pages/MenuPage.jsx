import { useParams } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContextObject";
import BackButton from "../components/BackButton";
import { getMenuData } from "../utils/menuCatalog";
import "./MenuPage.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop";

function MenuPage() {
  const { category } = useParams();
  const { cart, addToCart, removeOneByProductId } = useContext(CartContext);
  const [selectedNotesByProduct, setSelectedNotesByProduct] = useState({});
  const menuData = getMenuData();

  const items = menuData[category] || [];

  const getSelectedNote = (item) => {
    return selectedNotesByProduct[item.id] || item.noteOptions?.[0] || "Χωρίς σημείωση";
  };

  const handleNoteChange = (itemId, value) => {
    setSelectedNotesByProduct((prev) => ({ ...prev, [itemId]: value }));
  };

  return (
    <div className="menu-container">
      <BackButton />
      <div className="menu-overlay">
        <h2 className="menu-title">{category.toUpperCase()}</h2>

        <div className="menu-grid">
          {items.map((item) => {
            const selectedNote = getSelectedNote(item);
            const quantityInCart = cart.filter(
              (cartItem) => cartItem.id === item.id && cartItem.note === selectedNote
            ).length;

            return (
              <div key={item.id} className="menu-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-card-image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                />

                <div className="menu-card-content">
                  <h3>{item.name}</h3>
                  <p>{item.price} €</p>
                  <label className="menu-note-label">
                    Σημείωση
                    <select
                      className="menu-note-select"
                      value={selectedNote}
                      onChange={(event) => handleNoteChange(item.id, event.target.value)}
                    >
                      {item.noteOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="menu-stepper">
                    <button
                      className="menu-stepper-btn"
                      onClick={() => removeOneByProductId(item.id, selectedNote)}
                      disabled={quantityInCart === 0}
                    >
                      −
                    </button>
                    <span className="menu-stepper-value">{quantityInCart}</span>
                    <button className="menu-stepper-btn" onClick={() => addToCart(item, selectedNote)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
