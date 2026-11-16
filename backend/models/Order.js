import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "balue.hithesh@gmail.com",
    },
    customerPhone: {
      type: String,
      default: "+91 73963 48793",
    },
    customerCity: {
      type: String,
      default: "Eluru",
    },
    equipment: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "3 Days",
    },
    rentalFee: {
      type: Number,
      required: true,
      default: 420,
    },
    securityDeposit: {
      type: Number,
      required: true,
      default: 1500,
    },
    total: {
      type: Number,
      required: true,
      default: 496,
    },
    paymentMode: {
      type: String,
      enum: ["Pay at Store", "Cash on Delivery", "Online UPI", "Net Banking", "Debit Card", "Credit Card", "Cancelled"],
      default: "Pay at Store",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Completed", "Returned", "Cancelled", "Ready for Pickup at Store"],
      default: "Pending",
    },
    assignedDeliveryBoy: {
      type: String,
      default: "store.eluru@erenthub.in",
    },
    salespersonEmail: {
      type: String,
      default: "sales.eluru@erenthub.in",
    },
    salespersonName: {
      type: String,
      default: "Equipment Lister / Store Partner",
    },
    deliveryStatus: {
      type: String,
      enum: ["Assigned", "Sent to Store", "Ready for Pickup", "Collected", "Picked Up", "Out for Delivery", "Delivered", "Pickup Pending", "Returned"],
      default: "Sent to Store",
    },
    storeDropoffStatus: {
      type: String,
      enum: ["Pending Store Dropoff", "Received in Store", "Ready for Pickup"],
      default: "Pending Store Dropoff",
    },
    trackingStage: {
      type: Number,
      default: 1,
    },
    collectionOtp: {
      type: String,
      default: "",
    },
    depositOtp: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      default: "",
    },
    pickupEmail: {
      type: String,
      default: "store.eluru@erenthub.in",
    },
    pickupHub: {
      type: String,
      default: "E-RentHub Experience & Store Hub (Powerpet Road)",
    },
    pickupAddress: {
      type: String,
      default: "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
    },
    pickupCoords: {
      lat: { type: Number, default: 16.7145 },
      lng: { type: Number, default: 81.1020 },
    },
    deliveryAddress: {
      type: String,
      default: "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
    },
    deliveryCoords: {
      lat: { type: Number, default: 16.7145 },
      lng: { type: Number, default: 81.1020 },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ salespersonEmail: 1, createdAt: -1 });
orderSchema.index({ status: 1, trackingStage: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
