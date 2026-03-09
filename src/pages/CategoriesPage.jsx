import { Link, useLocation } from "react-router-dom";
import "./CategoriesPage.css";
import BackButton from "../components/BackButton";
import { getActiveTableId, getOrCreateActiveVisitToken, withTable } from "../utils/tableRouting";

const categories = [
  { id: "coffee", name: "Καφέδες" },
  { id: "drinks", name: "Ροφήματα" },
  { id: "appetizers", name: "Ορεκτικά Ποτών" },
  { id: "food", name: "Φαγητό" },
];

function CategoriesPage() {
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const tableToken = getOrCreateActiveVisitToken(location.search, tableId);

  return (
    <div className="categories-container">
      <BackButton />
      <div className="categories-overlay">
        <h2 className="categories-title">Κατηγορίες Μενού</h2>

        <div className="categories-list">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={withTable(`/menu/${cat.id}`, tableId, tableToken)}
              className="category-card"
            >
              {cat.name}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CategoriesPage;
