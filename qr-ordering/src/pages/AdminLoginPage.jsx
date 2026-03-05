import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/useAdminAuth";
import BackButton from "../components/BackButton";
import "./AdminLoginPage.css";

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAdminLoggedIn } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAdminLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const success = login(username.trim(), password);

    if (!success) {
      setError("Λάθος στοιχεία. Δοκίμασε ξανά.");
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="admin-login-container">
      <BackButton />
      <div className="admin-login-overlay">
        <form className="admin-login-card" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          <p>Σύνδεση για διαχείριση προϊόντων.</p>

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit">Σύνδεση</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
