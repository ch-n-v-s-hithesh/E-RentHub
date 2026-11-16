import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendRegistrationOtpEmail } from "../services/emailService.js";

const router = express.Router();

const registrationOtpStore = new Map();

function generateToken(user) {
  const secret = process.env.JWT_SECRET || "erenthub_jwt_secret_key_2026";
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    secret,
    { expiresIn: "7d" }
  );
}

router.post("/send-register-otp", async (req, res) => {
  return res.json({
    success: true,
    message: "OTP verification not required. Direct registration active.",
  });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, city, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: phone || "+91 73963 48793",
      role: role || "customer",
      city: city || "Eluru",
      address: address || "Powerpet Main Road, Eluru - 534002",
      hub: role === "delivery" ? "Eluru Powerpet Hub" : "Eluru Main Hub",
      assignedVehicle: role === "delivery" ? "EV Scooter (AP-37)" : undefined,
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: "Registration complete! Account created successfully.",
      token,
      role: newUser.role,
      redirect: newUser.role === "admin" ? "/admin" : (newUser.role === "delivery" ? "/delivery" : "/home"),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        city: newUser.city,
        address: newUser.address,
        hub: newUser.hub,
        assignedVehicle: newUser.assignedVehicle,
      },
    });
  } catch (err) {
    console.error("Auth register error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      if (cleanEmail === "chhithesh511@gmail.com" && cleanPass === "Ch.N.V.S.Hithesh@511") {
        user = await User.create({
          name: "Hithesh Chaluvadi (Admin)",
          email: cleanEmail,
          password: cleanPass,
          role: "admin",
          hub: "Eluru Main Hub",
        });
      } else if ((cleanEmail === "balue.hithesh@gmail.com" || cleanEmail === "balu.hithesh@gmail.com") && cleanPass === "Chhithesh@511") {
        user = await User.create({
          name: "Balu Hithesh (Customer)",
          email: cleanEmail,
          password: cleanPass,
          role: "customer",
          hub: "Eluru Powerpet Hub",
        });
      } else if (cleanEmail === "ch.n.v.s.hithesh@gmail.com" && cleanPass === "Chhithesh@511") {
        user = await User.create({
          name: "CH.N.V.S. Hithesh (Delivery Partner)",
          email: cleanEmail,
          password: cleanPass,
          role: "delivery",
          hub: "Eluru Powerpet Hub #2 (Powerpet Branch)",
          assignedVehicle: "EV Scooter (AP-37)",
        });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(cleanPass);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
      user.password = cleanPass;
      await user.save();
    }

    const token = generateToken(user);

    let redirect = "/home";
    if (user.role === "admin") {
      redirect = "/admin";
    } else if (user.role === "delivery") {
      redirect = "/delivery";
    } else if (user.role === "customer") {
      redirect = "/home";
    }

    return res.json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
      redirect,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        hub: user.hub,
        assignedVehicle: user.assignedVehicle,
      },
    });
  } catch (err) {
    console.error("Auth login error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "erenthub_jwt_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const { email, name, phone, address, city } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required to update profile" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const updated = await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(address && { address: address.trim() }),
          ...(city && { city: city.trim() }),
        },
      },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully!",
      user: updated,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, message: "Failed to update profile", error: err.message });
  }
});

export default router;
