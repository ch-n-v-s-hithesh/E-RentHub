import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/delivery/summary
router.get("/summary", async (req, res) => {
  try {
    const deliveryEmail = (req.query.email || "ch.n.v.s.hithesh@gmail.com").toLowerCase();

    // Find delivery partner
    const deliveryPartner = await User.findOne({ email: deliveryEmail, role: "delivery" });

    // Find orders assigned to this delivery partner
    const assignedOrders = await Order.find({
      assignedDeliveryBoy: deliveryEmail,
    }).sort({ createdAt: -1 });

    const activeOrders = assignedOrders.filter(
      (o) => o.status === "Active" || o.status === "Pending" || o.deliveryStatus === "Assigned" || o.deliveryStatus === "Out for Delivery"
    );

    const completedOrders = assignedOrders.filter(
      (o) => o.status === "Completed" || o.deliveryStatus === "Delivered" || o.deliveryStatus === "Returned"
    );

    // Calculate Cash on Delivery collected
    const codCollected = assignedOrders
      .filter((o) => o.paymentMode === "Cash on Delivery" && (o.deliveryStatus === "Delivered" || o.status === "Completed" || o.status === "Active"))
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Earnings per delivery (e.g., ₹75 per completed fulfillment)
    const deliveryCommission = completedOrders.length * 75;

    return res.json({
      success: true,
      partner: {
        name: deliveryPartner?.name || "CH.N.V.S. Hithesh",
        email: deliveryEmail,
        role: "delivery",
        hub: deliveryPartner?.hub || "Eluru Powerpet Hub #2",
        assignedVehicle: deliveryPartner?.assignedVehicle || "EV Scooter (AP-37)",
        batteryStatus: "85% • Local Eluru Range",
      },
      income: {
        cashOnDeliveryCollected: codCollected,
        deliveryEarnings: deliveryCommission,
        totalDeliveriesDone: completedOrders.length,
        onTimeRate: "100%",
      },
      counts: {
        activeCount: activeOrders.length,
        completedCount: completedOrders.length,
        totalAssigned: assignedOrders.length,
      },
      orders: assignedOrders.map((o) => ({
        id: o.orderNumber,
        customerName: o.customer,
        // Mask customer phone for privacy as requested by user
        customerPhoneMasked: o.customerPhone ? o.customerPhone.replace(/(\+?\d{2})\s?(\d{2})\d{4}(\d{4})/, "$1 $2•••• $3") : "+91 73•••• 8793",
        customerRawPhone: o.customerPhone, // used only for tel: call intent
        city: o.customerCity,
        equipment: o.equipment,
        duration: o.duration,
        amount: o.total,
        paymentMode: o.paymentMode,
        status: o.status,
        deliveryStatus: o.deliveryStatus,
        trackingStage: o.trackingStage,
        otp: o.otp,
        pickupHub: o.pickupHub || "E-RentHub Central Logistics Hub (Powerpet Road)",
        pickupAddress: o.pickupAddress || "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
        pickupCoords: o.pickupCoords || { lat: 16.7145, lng: 81.1020 },
        deliveryAddress: o.deliveryAddress || "Powerpet Main Road, Eluru - 534002",
        deliveryCoords: o.deliveryCoords || { lat: 16.7107, lng: 81.0952 },
      })),
    });
  } catch (err) {
    console.error("[Delivery API Summary Error]", err);
    return res.status(500).json({ success: false, message: "Error fetching delivery summary", error: err.message });
  }
});

export default router;

