import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getActiveTableId, getOrCreateActiveVisitToken, withTable } from "../utils/tableRouting";
import "./BackButton.css";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const tableId = getActiveTableId(location.search);
  const tableToken = getOrCreateActiveVisitToken(location.search, tableId);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(withTable("/", tableId, tableToken));
  };

  return (
    <button className="back-button" onClick={handleBack} aria-label="Go back">
      ← Πίσω
    </button>
  );
}

export default BackButton;
