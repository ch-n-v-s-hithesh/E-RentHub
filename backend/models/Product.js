import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Projectors", "Cameras", "Sound Boxes", "Laptops", "Displays", "Gaming", "Electronics"],
      default: "Electronics",
    },
    dailyRate: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    owner: {
      type: String,
      default: "E-RentHub Official Hub",
    },
    sellerEmail: {
      type: String,
      default: "sales.eluru@erenthub.in",
    },
    image: {
      type: String,
      default: "",
    },
    features: [String],
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ id: 1 });
productSchema.index({ category: 1, available: 1 });
productSchema.index({ name: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
