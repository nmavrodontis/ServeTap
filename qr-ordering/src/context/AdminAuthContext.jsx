import { useMemo, useState } from "react";
import { AdminAuthContext } from "./AdminAuthContextObject";

const ADMIN_AUTH_STORAGE_KEY = "adminLoggedIn";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

export function AdminAuthProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true"
  );

  const login = (username, password) => {
    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;

    if (!isValid) {
      return false;
    }

    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
    setIsAdminLoggedIn(true);

    return true;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    setIsAdminLoggedIn(false);
  };

  const value = useMemo(
    () => ({ isAdminLoggedIn, login, logout }),
    [isAdminLoggedIn]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
