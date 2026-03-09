import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import KitchenDashboard from "./pages/KitchenDashboard";
import FloatingCart from "./components/FloatingCart";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import { useAdminAuth } from "./context/useAdminAuth";
import {
  getActiveTableId,
  getOrCreateActiveVisitToken,
  syncTableVisitFromSearch,
} from "./utils/tableRouting";

function isCustomerPath(pathname) {
  return (
    pathname === "/" ||
    pathname === "/categories" ||
    pathname === "/menu" ||
    pathname.startsWith("/menu/") ||
    pathname === "/cart" ||
    pathname === "/order"
  );
}

function AppRoutes() {
  const { isAdminLoggedIn } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    syncTableVisitFromSearch(location.search);

    if (!isCustomerPath(location.pathname)) {
      return;
    }

    const tableId = getActiveTableId(location.search);
    if (!tableId) {
      return;
    }

    const tableToken = getOrCreateActiveVisitToken(location.search, tableId);
    if (!tableToken) {
      return;
    }

    const params = new URLSearchParams(location.search || "");
    const currentTable = String(params.get("table") || "").trim();
    const currentToken = String(params.get("tableToken") || "").trim();

    if (currentTable === tableId && currentToken === tableToken) {
      return;
    }

    params.set("table", tableId);
    params.set("tableToken", tableToken);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  return (
    <>
      <FloatingCart />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/menu" element={<CategoriesPage />} />
        <Route path="/menu/:category" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />   {/* ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ */}
        <Route path="/order" element={<OrderPage />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route
          path="/admin/login"
          element={isAdminLoggedIn ? <Navigate to="/admin" replace /> : <AdminLoginPage />}
        />
        <Route
          path="/admin"
          element={isAdminLoggedIn ? <AdminPanelPage /> : <Navigate to="/admin/login" replace />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
