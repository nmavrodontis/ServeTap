import { useMemo, useState } from "react";
import BackButton from "../components/BackButton";
import { useAdminAuth } from "../context/useAdminAuth";
import {
  addProductToCategory,
  deleteProductFromCategory,
  getMenuData,
  menuCategories,
  updateProductInCategory,
} from "../utils/menuCatalog";
import "./AdminPanelPage.css";

const categoryLabels = {
  coffee: "Καφέδες",
  drinks: "Ροφήματα",
  appetizers: "Ορεκτικά Ποτών",
  food: "Φαγητό",
};

function AdminPanelPage() {
  const { logout } = useAdminAuth();
  const [menuData, setMenuData] = useState(() => getMenuData());
  const [category, setCategory] = useState("coffee");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [noteOptionsText, setNoteOptionsText] = useState("Χωρίς σημείωση, Με ζάχαρη, Χωρίς ζάχαρη");
  const [message, setMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  const totalProducts = useMemo(() => {
    return Object.values(menuData).flat().length;
  }, [menuData]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setImage("");
    setNoteOptionsText("Χωρίς σημείωση, Με ζάχαρη, Χωρίς ζάχαρη");
    setEditingProductId(null);
  };

  const handleSaveProduct = (event) => {
    event.preventDefault();

    const notes = noteOptionsText
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (editingProductId === null) {
      const updated = addProductToCategory(category, {
        name,
        price,
        image,
        noteOptions: notes,
      });

      setMenuData(updated);
      resetForm();
      setMessage("Το προϊόν προστέθηκε επιτυχώς.");
      return;
    }

    const updated = updateProductInCategory(category, editingProductId, {
      name,
      price,
      image,
      noteOptions: notes,
    });

    setMenuData(updated);
    resetForm();
    setMessage("Το προϊόν ενημερώθηκε επιτυχώς.");
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setImage(product.image);
    setNoteOptionsText((product.noteOptions || []).join(", "));
    setMessage("");
  };

  const handleDeleteProduct = (productId) => {
    const updated = deleteProductFromCategory(category, productId);
    setMenuData(updated);

    if (editingProductId === productId) {
      resetForm();
    }

    setMessage("Το προϊόν διαγράφηκε επιτυχώς.");
  };

  return (
    <div className="admin-panel-container">
      <BackButton />
      <div className="admin-panel-overlay">
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <h2>Admin Dashboard</h2>
              <p>Σύνολο προϊόντων: {totalProducts}</p>
            </div>
            <button onClick={logout}>Αποσύνδεση</button>
          </div>

          <form className="admin-panel-form" onSubmit={handleSaveProduct}>
            <label>
              Κατηγορία
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {menuCategories.map((key) => (
                  <option key={key} value={key}>
                    {categoryLabels[key]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Όνομα προϊόντος
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label>
              Τιμή (€)
              <input
                type="number"
                min="0"
                step="0.1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label>
              URL εικόνας
              <input
                type="url"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                required
              />
            </label>

            <label>
              Επιλογές σημείωσης (χωρισμένες με κόμμα)
              <input
                type="text"
                value={noteOptionsText}
                onChange={(event) => setNoteOptionsText(event.target.value)}
                required
              />
            </label>

            <div className="admin-panel-form-actions">
              <button type="submit">
                {editingProductId === null ? "Προσθήκη προϊόντος" : "Αποθήκευση αλλαγών"}
              </button>
              {editingProductId !== null && (
                <button type="button" className="admin-panel-cancel" onClick={resetForm}>
                  Ακύρωση
                </button>
              )}
            </div>
            {message && <p className="admin-panel-message">{message}</p>}
          </form>

          <div className="admin-panel-list">
            <h3>Προϊόντα στην κατηγορία {categoryLabels[category]}</h3>
            <ul>
              {(menuData[category] || []).map((item) => (
                <li key={item.id} className="admin-panel-product-row">
                  <span>
                    {item.name} — {item.price} €
                  </span>
                  <div className="admin-panel-product-actions">
                    <button type="button" onClick={() => handleEditProduct(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-panel-delete"
                      onClick={() => handleDeleteProduct(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanelPage;
