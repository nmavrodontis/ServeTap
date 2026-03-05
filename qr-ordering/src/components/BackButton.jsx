import { useNavigate } from "react-router-dom";
import "./BackButton.css";

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <button className="back-button" onClick={handleBack} aria-label="Go back">
      ← Πίσω
    </button>
  );
}

export default BackButton;
