import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import { syncTableVisitFromSearch } from "./utils/tableRouting";

function AppRoutes() {
  const { isAdminLoggedIn } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    syncTableVisitFromSearch(location.search);
  }, [location.search]);

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
