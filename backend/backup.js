import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

const BACKUP_DIR = path.resolve("./backups");

export async function createBackup() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erenthub";
  await mongoose.connect(uri);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `erenthub_backup_${timestamp}.json`);

  const users = await User.find({}).lean();
  const products = await Product.find({}).lean();
  const orders = await Order.find({}).lean();

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        products: products.length,
        orders: orders.length,
      },
    },
    users,
    products,
    orders,
  };

  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), "utf-8");
  console.log(`[Backup Success] Stored in: ${backupPath}`);
  console.log(`[Stats] ${users.length} Users, ${products.length} Products, ${orders.length} Orders`);

  await mongoose.disconnect();
  return backupPath;
}

export async function restoreBackup(fileTarget) {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erenthub";
  await mongoose.connect(uri);

  let targetPath = fileTarget;
  if (!targetPath) {
    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error("No backup directory exists to restore from.");
    }
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json")).sort().reverse();
    if (files.length === 0) {
      throw new Error("No backup JSON files found in " + BACKUP_DIR);
    }
    targetPath = path.join(BACKUP_DIR, files[0]);
  }

  console.log(`[Restore] Loading from: ${targetPath}`);
  const raw = fs.readFileSync(targetPath, "utf-8");
  const data = JSON.parse(raw);

  if (Array.isArray(data.users) && data.users.length > 0) {
    await User.deleteMany({});
    await User.insertMany(data.users);
    console.log(`[Restore] Restored ${data.users.length} users.`);
  }

  if (Array.isArray(data.products) && data.products.length > 0) {
    await Product.deleteMany({});
    await Product.insertMany(data.products);
    console.log(`[Restore] Restored ${data.products.length} products.`);
  }

  if (Array.isArray(data.orders)) {
    await Order.deleteMany({});
    if (data.orders.length > 0) {
      await Order.insertMany(data.orders);
    }
    console.log(`[Restore] Restored ${data.orders.length} orders.`);
  }

  console.log(`[Restore Complete] Database successfully rolled back to state: ${data.metadata?.timestamp}`);
  await mongoose.disconnect();
}

if (process.argv[1]?.endsWith("backup.js")) {
  const isRestore = process.argv.includes("--restore");
  if (isRestore) {
    restoreBackup()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error("[Restore Failed]", err.message);
        process.exit(1);
      });
  } else {
    createBackup()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error("[Backup Failed]", err.message);
        process.exit(1);
      });
  }
}
