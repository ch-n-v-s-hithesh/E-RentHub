import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import SalesPortal from "./pages/SalesPortal";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RoleRoute from "./pages/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer & Admin Views: Home, Orders, Sales Portal, Profile, Cart */}
        <Route
          path="/home"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <Home />
            </RoleRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <Orders />
            </RoleRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <SalesPortal />
            </RoleRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <Profile />
            </RoleRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <Cart />
            </RoleRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <Checkout />
            </RoleRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <ProductDetail />
            </RoleRoute>
          }
        />
        <Route
          path="/rent-item"
          element={
            <RoleRoute allowedRoles={["customer", "admin"]}>
              <Profile />
            </RoleRoute>
          }
        />

        {/* Delivery Partner Desk (Delivery person sees only this page) */}
        <Route
          path="/delivery"
          element={
            <RoleRoute allowedRoles={["delivery", "admin"]}>
              <DeliveryDashboard />
            </RoleRoute>
          }
        />

        {/* Admin Dashboard (Admin sees Customer view & Admin dashboard) */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* Legal & Compliance Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
