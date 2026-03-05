import "./HomePage.css";
import { Link, useLocation } from "react-router-dom";
import { getActiveTableId, withTable } from "../utils/tableRouting";

function HomePage() {
  const location = useLocation();
  const tableId = getActiveTableId(location.search);

  return (
    <div className="home-container">
      <div className="overlay">
        <h1 className="title">Καλώς Ήρθατε</h1>
        <p className="subtitle">Σκανάρετε, επιλέξτε, παραγγείλτε.</p>

        <Link to={withTable("/categories", tableId)} className="menu-button">
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
