import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = express.Router();

let catalogCache = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateProductCache() {
  catalogCache = null;
  cacheExpiresAt = 0;
}

function escapeRegex(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const isDefaultCatalog = (!category || category === "All") && !search;

    if (isDefaultCatalog && catalogCache && Date.now() < cacheExpiresAt) {
      return res.json({
        success: true,
        count: catalogCache.length,
        products: catalogCache,
        source: "cache",
      });
    }

    let filter = {};

    if (category && typeof category === "string" && category !== "All") {
      filter.category = category.trim();
    }
    if (search && typeof search === "string" && search.trim()) {
      filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    if (isDefaultCatalog) {
      catalogCache = products;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }

    return res.json({ success: true, count: products.length, products, source: "db" });
  } catch (err) {
    console.error("Products fetch error:", err);
    return res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, name, category, dailyRate, securityDeposit, features, specs, image, sellerEmail } = req.body;
    const prodId = id || `EQ-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct = await Product.create({
      id: prodId,
      name,
      category: category || "Electronics",
      dailyRate: Number(dailyRate) || 150,
      securityDeposit: Number(securityDeposit) || 1500,
      image: image || "",
      features: features || [],
      specs: specs || {},
      sellerEmail: sellerEmail || "sales.eluru@erenthub.in",
      available: true,
    });

    invalidateProductCache();
    return res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create product", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let deleted = await Product.findOneAndDelete({ id: id });

    if (!deleted && mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Product.findByIdAndDelete(id);
    }

    if (!deleted) {
      deleted = await Product.findOneAndDelete({
        $or: [
          { id: new RegExp(`^${id}$`, "i") },
          { name: new RegExp(`^${id}$`, "i") }
        ]
      });
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Product "${id}" was not found.`,
      });
    }

    invalidateProductCache();
    return res.json({
      success: true,
      message: `Product "${deleted.name}" (${deleted.id}) deleted successfully.`,
      product: deleted,
    });
  } catch (err) {
    console.error("Product delete error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: err.message,
    });
  }
});

export default router;
