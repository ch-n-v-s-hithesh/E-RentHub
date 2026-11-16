import { Navigate } from "react-router-dom";

/**
 * RoleRoute: Guards routes by user role.
 * - Customer: Can access Home, Orders, Sales, Profile, Cart, Checkout. Cannot access /admin or /delivery.
 * - Delivery: Can ONLY access /delivery (their income & assigned order details).
 * - Admin: Can access /admin and /home (Customer View).
 */
export default function RoleRoute({ allowedRoles, children }) {
  const role = localStorage.getItem("erenthub_user_role") || "customer";

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "delivery") {
      return <Navigate to="/delivery" replace />;
    }
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
}

