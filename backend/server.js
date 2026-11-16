import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./seed.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests. Please try again after a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/send-register-otp", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/delivery", deliveryRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "E-RentHub API",
    database: "Connected to MongoDB",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", service: "erenthub-backend", timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Express Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred.",
    ...(process.env.NODE_ENV === "development" ? { error: err.stack } : {}),
  });
});

async function startServer() {
  const conn = await connectDB();
  if (conn) {
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log("=================================================");
    console.log(`E-RentHub server running at http://localhost:${PORT}`);
    console.log(`MongoDB connected: mongodb://127.0.0.1:27017/erenthub`);
    console.log("=================================================");
  });
}

startServer();
