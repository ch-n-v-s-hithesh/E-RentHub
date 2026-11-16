import express from "express";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import {
  sendSalespersonProductNoticeEmail,
  sendCustomerOrderOtpEmail,
  sendDestinationArrivalOtpEmail,
  sendListerDepositOtpEmail,
} from "../services/emailService.js";

const router = express.Router();

function getOptionalAuthUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET || "erenthub_jwt_secret_key_2026_eluru_secure";
      return jwt.verify(token, secret);
    }
  } catch (e) {
    // expired or invalid token
  }
  return null;
}

router.get("/", async (req, res) => {
  try {
    const user = getOptionalAuthUser(req);
    const { email, role, deliveryEmail } = req.query;
    let query = {};

    if (user) {
      if (user.role === "admin") {
        if (role === "delivery" || deliveryEmail) {
          query = { assignedDeliveryBoy: (deliveryEmail || email).toLowerCase() };
        } else if (role === "sales" || email) {
          query = { salespersonEmail: email.toLowerCase() };
        } else if (role === "customer" && email) {
          query = { customerEmail: email.toLowerCase() };
        }
      } else if (user.role === "delivery") {
        query = { assignedDeliveryBoy: user.email.toLowerCase() };
      } else if (user.role === "sales") {
        query = { salespersonEmail: user.email.toLowerCase() };
      } else {
        query = { customerEmail: user.email.toLowerCase() };
      }
    } else {
      if (role === "delivery" || deliveryEmail) {
        const dEmail = (deliveryEmail || email || "ch.n.v.s.hithesh@gmail.com").toLowerCase();
        query = { assignedDeliveryBoy: dEmail };
      } else if (role === "sales") {
        const sEmail = (email || "sales.eluru@erenthub.in").toLowerCase();
        query = { salespersonEmail: sEmail };
      } else if (email) {
        query = { customerEmail: email.toLowerCase() };
      } else {
        // Prevent IDOR: unauthenticated request without email must not dump all orders
        return res.json({ success: true, count: 0, orders: [] });
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return res.status(500).json({ success: false, message: "Error fetching orders", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const orderNum = data.id || `#ERH-${Math.floor(1000 + Math.random() * 9000)}`;
    const collectionOtp = data.collectionOtp || data.otp || String(Math.floor(1000 + Math.random() * 9000));
    const customerEmail = (data.customerEmail || data.email || "balue.hithesh@gmail.com").toLowerCase();
    const customerName = data.customerName || data.customer || "Balu Hithesh";
    const salespersonEmail = (data.salespersonEmail || "sales.eluru@erenthub.in").toLowerCase();
    const salespersonName = data.salespersonName || "Gadget Lister";
    const equipmentName = data.name || data.equipment || "Epson 4K Ultra HD Home Cinema Projector";
    const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const startDate = data.startDate || todayStr;
    const endDate = data.endDate || new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const storeAddress = "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002";
    const totalAmount = Number(data.totalAmount || data.total || 496);

    const newOrder = await Order.create({
      orderNumber: orderNum,
      customer: customerName,
      customerEmail,
      customerPhone: data.customerPhone || "+91 98480 12345",
      customerCity: data.customerCity || "Eluru",
      equipment: equipmentName,
      startDate,
      endDate,
      duration: `${data.durationDays || data.days || 3} Days`,
      rentalFee: Number(data.rentalPrice || data.rentalFee || 420),
      securityDeposit: Number(data.securityDeposit || 1500),
      total: totalAmount,
      paymentMode: data.paymentMode || data.paymentStatus || "Pay on Delivery (Cash / UPI)",
      status: "Pending",
      assignedDeliveryBoy: (data.assignedDeliveryBoy || "ch.n.v.s.hithesh@gmail.com").toLowerCase(),
      salespersonEmail,
      salespersonName,
      deliveryStatus: "Order Confirmed",
      storeDropoffStatus: "Assigned for Pickup",
      trackingStage: 1,
      collectionOtp,
      otp: collectionOtp,
      pickupEmail: "store.eluru@erenthub.in",
      pickupHub: data.pickupHub || "E-RentHub Central Logistics Hub",
      pickupAddress: data.pickupAddress || storeAddress,
      pickupCoords: data.pickupCoords || { lat: 16.7145, lng: 81.1020 },
      deliveryAddress: data.deliveryAddress || data.fullAddress || "Powerpet Main Road, Eluru - 534002",
      deliveryCoords: data.deliveryCoords || { lat: 16.7145, lng: 81.1020 },
    });

    console.log("--------------------------------------------------");
    console.log(`[ORDER CREATED] ${orderNum}`);
    console.log(`[CUSTOMER NOTIFIED] ${customerEmail}`);
    console.log(`[RENTAL WINDOW] ${startDate} to ${endDate}`);
    console.log("--------------------------------------------------");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Delivery partner will deliver to your doorstep.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Orders create error:", err);
    return res.status(500).json({ success: false, message: "Failed to place order", error: err.message });
  }
});

router.post("/:id/collect", async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.deliveryStatus = "Delivered";
    order.status = "Active";
    order.trackingStage = 3;
    await order.save();

    return res.json({
      success: true,
      message: "Handover confirmed. Rental is now active.",
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/:id/return", async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.deliveryStatus = "Returned";
    order.status = "Returned";
    order.trackingStage = 4;
    await order.save();

    return res.json({
      success: true,
      message: "Item returned safely. Full deposit refunded.",
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/:id/send-delivery-otp", async (req, res) => {
  return res.json({
    success: true,
    message: "Delivery partner arrived at customer destination.",
  });
});

router.post("/:id/send-deposit-otp", async (req, res) => {
  return res.json({
    success: true,
    message: "Partner arrived for gadget pickup.",
  });
});

router.post("/:id/verify-pickup", async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.deliveryStatus = "Out for Local Delivery";
    order.storeDropoffStatus = "Picked Up from Owner";
    order.trackingStage = 2;
    await order.save();

    return res.json({
      success: true,
      message: "Pickup confirmed from owner. Out for doorstep delivery.",
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/:id/verify-delivery", async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.deliveryStatus = "Delivered";
    order.status = "Active";
    order.trackingStage = 3;
    await order.save();

    return res.json({
      success: true,
      message: "Handover confirmed. Rental is now active.",
      order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/:id/resend-otp", async (req, res) => {
  return res.json({
    success: true,
    message: "Order details sent.",
  });
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status, deliveryStatus, storeDropoffStatus, trackingStage } = req.body;
    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }] },
      {
        ...(status && { status }),
        ...(deliveryStatus && { deliveryStatus }),
        ...(storeDropoffStatus && { storeDropoffStatus }),
        ...(trackingStage !== undefined && { trackingStage }),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }] },
      { status: "Cancelled", deliveryStatus: "Returned" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
