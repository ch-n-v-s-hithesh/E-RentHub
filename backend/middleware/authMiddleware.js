import jwt from "jsonwebtoken";

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "erenthub_jwt_secret_key_2026_eluru_secure";

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
    }
    return res.status(403).json({ success: false, message: "Invalid authentication token." });
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please authenticate first." });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized.`,
      });
    }

    next();
  };
}

export function checkOrderOwnership(order, user) {
  if (!order || !user) return false;
  if (user.role === "admin") return true;
  if (user.role === "delivery" && order.assignedDeliveryBoy?.toLowerCase() === user.email?.toLowerCase()) return true;
  if (user.role === "sales" && order.salespersonEmail?.toLowerCase() === user.email?.toLowerCase()) return true;
  if (user.role === "customer" && order.customerEmail?.toLowerCase() === user.email?.toLowerCase()) return true;
  return false;
}
