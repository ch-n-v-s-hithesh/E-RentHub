import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

// ONLY the 3 authorized users specified
export const SEED_USERS = [
  {
    name: "Hithesh Chaluvadi (Admin)",
    email: "chhithesh511@gmail.com",
    password: "Ch.N.V.S.Hithesh@511",
    role: "admin",
    phone: "+91 73963 48793",
    city: "Eluru",
    hub: "Eluru Main Hub",
    assignedVehicle: "N/A",
  },
  {
    name: "Balu Hithesh (Customer)",
    email: "balue.hithesh@gmail.com",
    password: "Chhithesh@511",
    role: "customer",
    phone: "+91 98480 12345",
    city: "Eluru",
    hub: "Eluru Powerpet Hub",
    assignedVehicle: "N/A",
  },
  {
    name: "CH.N.V.S. Hithesh (Delivery Partner)",
    email: "ch.n.v.s.hithesh@gmail.com",
    password: "Chhithesh@511",
    role: "delivery",
    phone: "+91 73963 48793",
    city: "Eluru",
    hub: "Eluru Powerpet Hub #2 (Powerpet Branch)",
    assignedVehicle: "EV Scooter (AP-37)",
  },
];

// Clean catalog products ready to be rented
export const SEED_PRODUCTS = [
  {
    id: "EQ-101",
    name: "Epson 4K Ultra HD Home Cinema Projector",
    category: "Projectors",
    dailyRate: 189,
    securityDeposit: 1500,
    rating: 4.9,
    owner: "E-RentHub Official Hub",
    features: ["4K Enhancement Technology", "3000 Lumens Brightness", "HDMI 2.1 & Wireless Cast", "Built-in Stereo Speaker"],
    available: true,
  },
  {
    id: "EQ-102",
    name: "BenQ Full HD Conference & Event Projector",
    category: "Projectors",
    dailyRate: 119,
    securityDeposit: 1200,
    rating: 4.7,
    owner: "E-RentHub Official Hub",
    features: ["Full HD 1080p Resolution", "4000 ANSI Lumens for Bright Rooms", "Dual HDMI Inputs", "Auto Vertical Keystone"],
    available: true,
  },
  {
    id: "EQ-103",
    name: "Canon EOS 200D II DSLR Camera (18-55mm Lens Kit)",
    category: "Cameras",
    dailyRate: 149,
    securityDeposit: 2000,
    rating: 4.8,
    owner: "E-RentHub Official Hub",
    features: ["24.1 Megapixel CMOS Sensor", "4K Video Recording", "Dual Pixel CMOS AF", "Vari-angle Touch Screen LCD"],
    available: true,
  },
  {
    id: "EQ-104",
    name: "Sony Alpha A6400 Mirrorless 4K Camera (16-50mm Lens)",
    category: "Cameras",
    dailyRate: 179,
    securityDeposit: 2500,
    rating: 4.9,
    owner: "E-RentHub Official Hub",
    features: ["0.02s Ultra-Fast Autofocus", "Real-time Eye AF (Human/Animal)", "4K HDR (HLG) Movie Recording", "180-Degree Tiltable Screen"],
    available: true,
  },
  {
    id: "EQ-105",
    name: "JBL PartyBox 310 High-Power Portable Speaker",
    category: "Sound Boxes",
    dailyRate: 169,
    securityDeposit: 1200,
    rating: 4.9,
    owner: "E-RentHub Official Hub",
    features: ["240W RMS Powerful JBL Pro Sound", "Dynamic Light Shows Synced to Beat", "18-Hour Battery Life", "IPX4 Splashproof Protection"],
    available: true,
  },
  {
    id: "EQ-106",
    name: "Sony MHC-V13 Wireless High Power Audio System",
    category: "Sound Boxes",
    dailyRate: 129,
    securityDeposit: 1000,
    rating: 4.7,
    owner: "E-RentHub Official Hub",
    features: ["Jet Bass Booster for Long-distance Sound", "Speaker Light Effects", "Guitar and Mic Inputs", "Bluetooth & Wireless Party Chain"],
    available: true,
  },
  {
    id: "EQ-107",
    name: "HP Pavilion 15 Core i5 16GB Laptop",
    category: "Laptops",
    dailyRate: 140,
    securityDeposit: 1500,
    rating: 4.8,
    owner: "E-RentHub Official Hub",
    features: ["Intel Core i5 12th Gen", "16GB DDR4 RAM + 512GB NVMe SSD", "15.6-inch Full HD Micro-edge Display", "Backlit Keyboard + Fast Charge"],
    available: true,
  },
];

// All mock orders wiped clean! Orders & Sales start fresh from first.
export const SEED_ORDERS = [];

export async function seedDatabase() {
  try {
    // 1. Wipe old users and insert only the 3 authorized accounts with bcrypt hashed passwords
    await User.deleteMany({});
    for (const u of SEED_USERS) {
      await User.create(u);
    }
    console.log(`[Seed] Initialized ${SEED_USERS.length} accounts in MongoDB Compass with Bcrypt password hashing`);

    // 2. Products Catalog: Seed initial catalog only if collection is empty
    const existingProductCount = await Product.countDocuments();
    if (existingProductCount === 0) {
      await Product.insertMany(SEED_PRODUCTS);
      console.log(`[Seed] Initialized ${SEED_PRODUCTS.length} catalog products in MongoDB Compass`);
    } else {
      console.log(`[Seed] Products collection has ${existingProductCount} products. Preserving admin deletions/updates.`);
    }

    // 3. Clear all old orders - start fresh from first!
    await Order.deleteMany({});
    console.log(`[Seed] Cleared all old order records. Orders & Sales start clean from first order.`);
    console.log(`[MongoDB Compass] Ready at: mongodb://127.0.0.1:27017/erenthub`);
  } catch (err) {
    console.error("[Seed] Error initializing database:", err.message);
  }
}

// If run directly: node seed.js
if (process.argv[1]?.endsWith("seed.js")) {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erenthub";
  mongoose
    .connect(uri)
    .then(async () => {
      console.log("[MongoDB Compass] Connected to", uri);
      await seedDatabase();
      await mongoose.disconnect();
      console.log("[MongoDB Compass] Disconnected cleanly.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[MongoDB Compass] Connection failed:", err.message);
      process.exit(1);
    });
}
