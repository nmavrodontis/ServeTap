import "./HomePage.css";
import { Link, useLocation } from "react-router-dom";
import { getActiveTableId, getOrCreateActiveVisitToken, withTable } from "../utils/tableRouting";

function HomePage() {
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const tableToken = getOrCreateActiveVisitToken(location.search, tableId);

  return (
    <div className="home-container">
      <div className="overlay">
        <h1 className="title">Καλώς Ήρθατε</h1>
        <p className="subtitle">Σκανάρετε, επιλέξτε, παραγγείλτε.</p>

        <Link to={withTable("/categories", tableId, tableToken)} className="menu-button">
          Δες το Μενού
        </Link>
        <Link to="/admin/login" className="menu-button" style={{ marginTop: 12 }}>
          Admin Login
        </Link>

      </div>
    </div>
  );
}

export default HomePage;
