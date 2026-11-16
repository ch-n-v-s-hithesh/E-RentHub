import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// ==========================================
// 1. ADMIN CREDENTIALS CONFIGURATION
// ==========================================
export const ADMIN_CREDENTIALS = {
    email: "ch.n.v.s.hithesh@gmail.com",
    password: "ch.n.v.s.hithesh@511",
    name: "CH.N.V.S. Hithesh",
    role: "admin",
    phone: "7396348793",
    hub: "Eluru Main Hub",
};

// ==========================================
// 2. DEFAULT SEED DATABASE
// Exactly 6 products: 2 Laptops, 1 Camera, 3 Projectors
// ==========================================
const DEFAULT_PRODUCTS = [
    // 2 Laptops
    {
        id: 1,
        name: "Gaming i5-11thGen 6GB-4GB Graphics Laptop",
        category: "Laptops",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 179,
        monthlyPrice: 5360,
        badge: "Popular",
        cpu: "Intel Core i5 11th Gen",
        ram: "8GB RAM",
        storage: "512GB SSD",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "High-performance gaming laptop with 11th Gen Core i5 processor and dedicated graphics for immersive gaming, coding, and heavy rendering.",
    },
    {
        id: 2,
        name: "Windows i5 8thGen-8GB Laptop",
        category: "Laptops",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 79,
        monthlyPrice: 2287,
        badge: "Best Value",
        cpu: "Intel Core i5 8th Gen",
        ram: "8GB RAM",
        storage: "256GB SSD",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Reliable and fast Windows laptop optimized for productivity, online classes, everyday office computing, and smooth multi-tasking.",
    },

    // 1 Camera
    {
        id: 3,
        name: "Canon EOS 200D II DSLR Camera (18-55mm Lens Kit)",
        category: "Cameras",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 149,
        monthlyPrice: 4470,
        badge: "Featured",
        cpu: "24.1MP Dual Pixel CMOS",
        ram: "4K Video Recording",
        storage: "64GB SD Card Included",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Lightweight DSLR camera with Eye Detection AF, 4K video recording, and 18-55mm lens kit ideal for photography, vlogging, and events.",
    },

    // 3 Projectors
    {
        id: 4,
        name: "Epson 4K Ultra HD Home Cinema Projector",
        category: "Projectors",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 189,
        monthlyPrice: 5670,
        badge: "Popular",
        cpu: "4K PRO-UHD 3000 Lumens",
        ram: "HDR10 / 3LCD Tech",
        storage: "Dual HDMI / WiFi",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Cinema-grade 4K projection with brilliant color brightness, HDR10 support, and screen size up to 300 inches for movie nights and presentations.",
    },
    {
        id: 5,
        name: "BenQ Full HD Conference & Event Projector",
        category: "Projectors",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 119,
        monthlyPrice: 3570,
        badge: "Featured",
        cpu: "1080p FHD Native",
        ram: "3600 ANSI Lumens",
        storage: "VGA / HDMI / USB",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "High-lumen projector for clear business presentations, outdoor screenings, workshops, and sports screenings in ambient light.",
    },
    {
        id: 6,
        name: "Portable Smart Mini LED Projector (Android TV)",
        category: "Projectors",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 79,
        monthlyPrice: 2370,
        badge: "Compact",
        cpu: "DLP Smart Engine",
        ram: "Built-in Battery",
        storage: "WiFi / Bluetooth",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Pocket-sized wireless smart projector with built-in battery, automatic keystone correction, and streaming apps for camping and travel.",
    },
];

// Initial Customer Profile (Chaluvadi Subbalakshmi, Eluru)
const DEFAULT_PROFILE = {
    fullName: "Chaluvadi Subbalakshmi",
    phone: "7396348793",
    email: "subbalakshmi.chaluvadi@gmail.com",
    addressType: "HOME",
    address: "D.No: 4B-12-8, GNT Road, Near Fire Station, Powerpet",
    city: "Eluru",
    state: "Andhra Pradesh",
    pincode: "534002",
};

// Initial Orders with Tracking & Delivery Details
const DEFAULT_ORDERS = [
    {
        id: "ERH-8921",
        name: "Gaming i5-11thGen 6GB-4GB Graphics Laptop",
        category: "Laptops",
        city: "Eluru",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        startDate: "25 Apr 2025",
        endDate: "02 May 2025",
        days: 7,
        baseAmount: 1062,
        gstAmount: 191,
        totalAmount: 1253,
        paymentStatus: "Cash on Delivery",
        paymentMode: "Cash on Delivery (Pay at Doorstep • ₹0 advance)",
        deliveryType: "Local Doorstep Delivery (Local to Local Only)",
        status: "Out for Local Delivery",
        statusColor: "#16a34a",
        isCancelled: false,
        deliveryDetails: {
            recipientName: "Chaluvadi Subbalakshmi",
            phone: "+91 7396348793",
            address: "D.No: 4B-12-8, GNT Road, Near Fire Station, Powerpet, Eluru - 534002, Andhra Pradesh",
            addressType: "HOME",
            deliveryHub: "E-RentHub Local Delivery Hub #2 (Eluru Powerpet Branch)",
            deliveryAgent: "Ramesh Kumar (Local Delivery Partner)",
            estimatedDelivery: "Today by 6:00 PM",
            trackingSteps: [
                { title: "Order Placed", desc: "Local booking verified", completed: true, time: "25 Apr, 09:30 AM" },
                { title: "Dispatched from Local Hub", desc: "Packed & verified at Eluru Hub", completed: true, time: "25 Apr, 01:15 PM" },
                { title: "Out for Local Delivery", desc: "Agent out for doorstep delivery", current: true, completed: true, time: "25 Apr, 03:45 PM" },
                { title: "Delivered at Doorstep", desc: "Doorstep OTP verification", completed: false, time: "Pending" },
            ],
        },
    },
    {
        id: "ERH-7814",
        name: "Canon EOS 200D II DSLR Camera (18-55mm)",
        category: "Cameras",
        city: "Eluru",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        startDate: "18 Apr 2025",
        endDate: "22 Apr 2025",
        days: 4,
        baseAmount: 1014,
        gstAmount: 182,
        totalAmount: 1196,
        paymentStatus: "Cash on Delivery (Paid)",
        paymentMode: "Cash on Delivery (Paid at Doorstep)",
        deliveryType: "Local Doorstep Delivery (Local to Local Only)",
        status: "Completed / Returned",
        statusColor: "#64748b",
        isCancelled: false,
        deliveryDetails: {
            recipientName: "Chaluvadi Subbalakshmi",
            phone: "+91 7396348793",
            address: "D.No: 4B-12-8, GNT Road, Near Fire Station, Powerpet, Eluru - 534002, Andhra Pradesh",
            addressType: "HOME",
            deliveryHub: "E-RentHub Local Delivery Hub #2 (Eluru Powerpet Branch)",
            deliveryAgent: "Suresh Varma (Local Partner)",
            estimatedDelivery: "Completed on 18 Apr 2025",
            trackingSteps: [
                { title: "Order Placed", desc: "Booking confirmed", completed: true, time: "18 Apr, 10:00 AM" },
                { title: "Dispatched from Local Hub", desc: "Dispatched from Powerpet Hub", completed: true, time: "18 Apr, 12:30 PM" },
                { title: "Out for Local Delivery", desc: "Agent arrived at location", completed: true, time: "18 Apr, 02:15 PM" },
                { title: "Delivered at Doorstep", desc: "Handover & OTP verified", completed: true, time: "18 Apr, 03:00 PM" },
            ],
        },
    },
];

// Initial User Listed Devices (/rent-item)
const DEFAULT_USER_RENTALS = [
    {
        id: 991,
        title: "Dell Latitude Business Laptop Core i5",
        category: "Laptops",
        dailyRate: 99,
        monthlyRate: 2800,
        city: "Eluru",
        area: "Powerpet",
        status: "Available for Rent",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        ownerName: "Chaluvadi Subbalakshmi",
        ownerPhone: "7396348793",
        createdAt: "24 Apr 2025",
    },
];

// ==========================================
// 3. PERSISTENT STORAGE MANAGER (JSON FILE)
// ==========================================
let DB = {
    products: DEFAULT_PRODUCTS,
    orders: DEFAULT_ORDERS,
    profile: DEFAULT_PROFILE,
    userRentals: DEFAULT_USER_RENTALS,
    users: [
        {
            email: ADMIN_CREDENTIALS.email,
            password: ADMIN_CREDENTIALS.password,
            name: ADMIN_CREDENTIALS.name,
            role: "admin",
            phone: ADMIN_CREDENTIALS.phone,
        },
    ],
};

function loadDatabase() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const fileData = fs.readFileSync(DATA_FILE, "utf-8");
            const parsed = JSON.parse(fileData);
            DB = {
                ...DB,
                ...parsed,
                products: parsed.products?.length ? parsed.products : DEFAULT_PRODUCTS,
                orders: parsed.orders?.length ? parsed.orders : DEFAULT_ORDERS,
                profile: parsed.profile || DEFAULT_PROFILE,
                userRentals: parsed.userRentals || DEFAULT_USER_RENTALS,
            };
            console.log(`[E-RentHub DB] Loaded data from ${DATA_FILE}`);
        } else {
            saveDatabase();
        }
    } catch (e) {
        console.warn("[E-RentHub DB] Error loading data.json, using defaults:", e.message);
    }
}

function saveDatabase() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2), "utf-8");
    } catch (e) {
        console.warn("[E-RentHub DB] Error saving data.json:", e.message);
    }
}

// Load DB on startup
loadDatabase();

// ==========================================
// 4. AUTHENTICATION & ADMIN ENDPOINTS
// ==========================================

// Login endpoint with exact Admin credentials verification
app.post(["/api/auth/login", "/api/login"], (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const adminEmail = ADMIN_CREDENTIALS.email.toLowerCase();

    // Check Admin Credentials
    if (trimmedEmail === adminEmail && password === ADMIN_CREDENTIALS.password) {
        return res.json({
            success: true,
            role: "admin",
            token: "erenthub_jwt_admin_511",
            user: {
                name: ADMIN_CREDENTIALS.name,
                email: ADMIN_CREDENTIALS.email,
                role: "admin",
                phone: ADMIN_CREDENTIALS.phone,
                hub: ADMIN_CREDENTIALS.hub,
                permissions: ["manage_orders", "manage_products", "cancel_orders", "view_analytics"],
            },
            message: `Welcome Admin ${ADMIN_CREDENTIALS.name}! Access granted to E-RentHub Admin Portal.`,
        });
    }

    // Check normal users
    const existingUser = DB.users.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (existingUser) {
        return res.json({
            success: true,
            role: existingUser.role || "customer",
            token: "erenthub_user_session_token",
            user: {
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role || "customer",
            },
            message: "Login successful!",
        });
    }

    // Default Customer Login fallback
    if (trimmedEmail && password.length >= 4) {
        const customerUser = {
            name: trimmedEmail.split("@")[0],
            email: trimmedEmail,
            role: "customer",
        };
        return res.json({
            success: true,
            role: "customer",
            token: "erenthub_user_session_token",
            user: customerUser,
            message: "Welcome to E-RentHub!",
        });
    }

    return res.status(401).json({ error: "Invalid email or password." });
});

// Register endpoint
app.post(["/api/auth/register", "/api/register"], (req, res) => {
    const { fullName, email, password, phone } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const newUser = {
        name: fullName || "Customer",
        email: email.trim().toLowerCase(),
        password,
        phone: phone || "",
        role: "customer",
        createdAt: new Date().toISOString(),
    };

    DB.users.push(newUser);
    saveDatabase();

    res.status(201).json({
        success: true,
        message: "Registration successful! You can now log in.",
        user: { name: newUser.name, email: newUser.email, role: "customer" },
    });
});

// Admin verify status
app.get("/api/auth/admin-info", (req, res) => {
    res.json({
        adminConfigured: true,
        adminEmail: ADMIN_CREDENTIALS.email,
        adminName: ADMIN_CREDENTIALS.name,
        role: "admin",
        instructions: "Use ch.n.v.s.hithesh@gmail.com and password ch.n.v.s.hithesh@511 to log in as Admin.",
    });
});

// ==========================================
// 5. PRODUCTS API (2 Laptops, 1 Camera, 3 Projectors + Place Filtering)
// ==========================================

// GET all products
app.get("/api/products", (req, res) => {
    const { category, search, minPrice, maxPrice, place, city } = req.query;
    let list = [...DB.products];

    // Filter by Place/City
    const placeQuery = place || city;
    if (placeQuery && placeQuery !== "All Places") {
        list = list.filter(
            (p) =>
                (p.city && p.city.toLowerCase() === placeQuery.toLowerCase()) ||
                (p.place && p.place.toLowerCase().includes(placeQuery.toLowerCase()))
        );
    }

    // Filter by Category (Laptops, Cameras, Projectors)
    if (category && category !== "All") {
        list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Search term
    if (search) {
        const q = search.toLowerCase();
        list = list.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.city && p.city.toLowerCase().includes(q)) ||
                (p.cpu && p.cpu.toLowerCase().includes(q))
        );
    }

    // Price filtering
    if (minPrice) {
        list = list.filter((p) => p.dailyPrice >= Number(minPrice));
    }
    if (maxPrice) {
        list = list.filter((p) => p.dailyPrice <= Number(maxPrice));
    }

    res.json({
        total: list.length,
        products: list,
    });
});

// GET single product
app.get("/api/products/:id", (req, res) => {
    const product = DB.products.find((p) => String(p.id) === String(req.params.id));
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
});

// POST add product (Admin)
app.post("/api/products", (req, res) => {
    const { name, category, dailyPrice, city, specs, image, description } = req.body;
    if (!name || !dailyPrice) {
        return res.status(400).json({ error: "Product name and daily price are required." });
    }

    const newProd = {
        id: DB.products.length + 1,
        name,
        category: category || "Laptops",
        city: city || "Eluru",
        place: `${city || "Eluru"} (Local Hub)`,
        dailyPrice: Number(dailyPrice),
        monthlyPrice: Number(dailyPrice) * 30,
        badge: "New Arrival",
        cpu: specs || "Verified",
        ram: "Standard",
        storage: "Verified",
        delivery: "Local Delivery (24-48 hrs)",
        image: image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: description || "Quality tested electronics for rent.",
    };

    DB.products.push(newProd);
    saveDatabase();

    res.status(201).json({ message: "Product added successfully", product: newProd });
});

// DELETE product (Admin)
app.delete("/api/products/:id", (req, res) => {
    const idx = DB.products.findIndex((p) => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    DB.products.splice(idx, 1);
    saveDatabase();
    res.json({ message: "Product deleted successfully" });
});

// ==========================================
// 6. ORDERS API (Cash on Delivery + Cancellation + Delivery Details)
// ==========================================

// GET all orders
app.get("/api/orders", (req, res) => {
    const { status, search } = req.query;
    let list = [...DB.orders];

    if (status === "active") {
        list = list.filter((o) => !o.isCancelled && !o.status.includes("Completed"));
    } else if (status === "completed") {
        list = list.filter((o) => o.status.includes("Completed"));
    } else if (status === "cancelled") {
        list = list.filter((o) => o.isCancelled || o.status.includes("Cancelled"));
    }

    if (search) {
        const q = search.toLowerCase();
        list = list.filter((o) => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q));
    }

    res.json({
        total: list.length,
        orders: list,
    });
});

// GET single order
app.get("/api/orders/:id", (req, res) => {
    const order = DB.orders.find((o) => o.id === req.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
});

// POST create order (Cash on Delivery & Local to Local Doorstep)
app.post("/api/orders", (req, res) => {
    const {
        name,
        category,
        image,
        dailyPrice,
        days = 3,
        startDate,
        endDate,
        customerName,
        phone,
        address,
        totalAmount,
    } = req.body;

    const baseAmount = dailyPrice ? dailyPrice * days : Math.round((totalAmount || 1000) / 1.18);
    const gstAmount = Math.round(baseAmount * 0.18);
    const finalTotal = totalAmount || baseAmount + gstAmount;

    const newId = `ERH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
        id: newId,
        name: name || "Electronics Device Rental",
        category: category || "Electronics",
        city: "Eluru",
        image: image || "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        startDate: startDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        endDate: endDate || new Date(Date.now() + days * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        days: Number(days),
        baseAmount,
        gstAmount,
        totalAmount: finalTotal,
        paymentStatus: "Cash on Delivery",
        paymentMode: "Cash on Delivery (Pay at Doorstep • ₹0 advance)",
        deliveryType: "Local Doorstep Delivery (Local to Local Only)",
        status: "Order Confirmed & Local Dispatch Scheduled",
        statusColor: "#2563eb",
        isCancelled: false,
        createdAt: new Date().toISOString(),
        deliveryDetails: {
            recipientName: customerName || DB.profile.fullName,
            phone: phone || DB.profile.phone,
            address: address || `${DB.profile.address}, ${DB.profile.city} - ${DB.profile.pincode}, ${DB.profile.state}`,
            addressType: "HOME",
            deliveryHub: "E-RentHub Local Delivery Hub #2 (Eluru Powerpet Branch)",
            deliveryAgent: "Local Partner Assigned Upon Dispatch",
            estimatedDelivery: "Within 24-48 Hours",
            trackingSteps: [
                { title: "Order Placed", desc: "Local booking verified", completed: true, time: "Just now" },
                { title: "Dispatched from Local Hub", desc: "Packed & verified at Eluru Hub", completed: false, time: "Pending" },
                { title: "Out for Local Delivery", desc: "Local delivery agent assignment", completed: false, time: "Pending" },
                { title: "Delivered at Doorstep", desc: "Cash on Delivery handover & OTP", completed: false, time: "Pending" },
            ],
        },
    };

    DB.orders.unshift(newOrder);
    saveDatabase();

    res.status(201).json({
        message: "Order placed successfully! Cash on Delivery confirmed.",
        order: newOrder,
    });
});

// PUT cancel order (₹0 Cancellation fee, status becomes Cancelled by Customer)
app.put(["/api/orders/:id/cancel", "/api/orders/cancel/:id"], (req, res) => {
    const orderIndex = DB.orders.findIndex((o) => o.id === req.params.id);
    if (orderIndex === -1) {
        return res.status(404).json({ error: "Order not found" });
    }

    const order = DB.orders[orderIndex];
    if (order.isCancelled) {
        return res.status(400).json({ error: "Order is already cancelled" });
    }

    order.status = "Cancelled by Customer";
    order.statusColor = "#ef4444";
    order.isCancelled = true;
    order.cancelledAt = new Date().toISOString();
    order.paymentStatus = "Cancelled (₹0 Due)";

    if (order.deliveryDetails && order.deliveryDetails.trackingSteps) {
        order.deliveryDetails.trackingSteps.push({
            title: "Order Cancelled",
            desc: "Cancelled by customer request. ₹0 charged.",
            completed: true,
            isCancelled: true,
            time: "Just now",
        });
        order.deliveryDetails.estimatedDelivery = "Cancelled by Customer (₹0 Due)";
    }

    saveDatabase();

    res.json({
        message: `Order #${order.id} has been cancelled successfully. No charges applied.`,
        order,
    });
});

// PUT update order status (Admin)
app.put("/api/orders/:id/status", (req, res) => {
    const { status, statusColor } = req.body;
    const order = DB.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status || order.status;
    if (statusColor) order.statusColor = statusColor;
    saveDatabase();

    res.json({ message: "Order status updated", order });
});

// ==========================================
// 7. RENT ITEM API (Dedicated /rent-item page backend)
// ==========================================

// GET all user rentals
app.get("/api/rent-item", (req, res) => {
    res.json({ total: DB.userRentals.length, items: DB.userRentals });
});

// POST submit device for rent
app.post("/api/rent-item", (req, res) => {
    const { title, category, dailyRate, city, area, ownerName, ownerPhone, condition, specs, image } = req.body;
    if (!title || !dailyRate) {
        return res.status(400).json({ error: "Device title and daily rental rate are required." });
    }

    const newListing = {
        id: Date.now(),
        title: title.trim(),
        category: category || "Laptops",
        dailyRate: Number(dailyRate),
        monthlyRate: Number(dailyRate) * 30,
        city: city || "Eluru",
        area: area || "Powerpet",
        ownerName: ownerName || DB.profile.fullName,
        ownerPhone: ownerPhone || DB.profile.phone,
        condition: condition || "Like New",
        specs: specs || "Tested and verified",
        status: "Available for Rent",
        image: image || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };

    DB.userRentals.unshift(newListing);
    saveDatabase();

    res.status(201).json({
        message: `"${newListing.title}" successfully listed for rent in ${newListing.city}!`,
        item: newListing,
    });
});

// DELETE user rental listing
app.delete("/api/rent-item/:id", (req, res) => {
    const idx = DB.userRentals.findIndex((item) => String(item.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Listing not found" });
    DB.userRentals.splice(idx, 1);
    saveDatabase();
    res.json({ message: "Rental listing removed successfully" });
});

// ==========================================
// 8. PROFILE API (Chaluvadi Subbalakshmi, Eluru)
// ==========================================

app.get("/api/profile", (req, res) => {
    res.json(DB.profile);
});

app.put("/api/profile", (req, res) => {
    DB.profile = { ...DB.profile, ...req.body };
    saveDatabase();
    res.json({
        message: "Profile updated successfully",
        profile: DB.profile,
    });
});

// ==========================================
// 9. ADMIN ANALYTICS / STATS API
// ==========================================

app.get("/api/admin/stats", (req, res) => {
    const totalOrders = DB.orders.length;
    const activeOrders = DB.orders.filter((o) => !o.isCancelled && !o.status.includes("Completed")).length;
    const completedOrders = DB.orders.filter((o) => o.status.includes("Completed")).length;
    const cancelledOrders = DB.orders.filter((o) => o.isCancelled || o.status.includes("Cancelled")).length;
    const totalRevenue = DB.orders
        .filter((o) => !o.isCancelled)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
        admin: {
            name: ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            hub: ADMIN_CREDENTIALS.hub,
        },
        stats: {
            totalProducts: DB.products.length,
            userListedItems: DB.userRentals.length,
            totalOrders,
            activeOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            deliveryMode: "Local to Local Doorstep Delivery (Eluru)",
            paymentMode: "Cash on Delivery",
        },
    });
});

// ==========================================
// 10. HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "E-RentHub Complete Backend API",
        adminEmail: ADMIN_CREDENTIALS.email,
        productsCount: DB.products.length,
        ordersCount: DB.orders.length,
        timestamp: new Date().toISOString(),
    });
});

// ==========================================
// 11. START SERVER
// ==========================================

const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[E-RentHub Backend] Server running on http://localhost:${PORT}`);
    console.log(`[Admin Account] Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`[Admin Account] Password: ${ADMIN_CREDENTIALS.password}`);
    console.log(`[Catalog] Exactly 6 Products (2 Laptops, 1 Camera, 3 Projectors)`);
    console.log(`[Location] Eluru Local Hub (Cash on Delivery • Local to Local)`);
    console.log(`====================================================`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        const ALT_PORT = 5001;
        console.log(`Port ${PORT} in use, trying port ${ALT_PORT}...`);
        app.listen(ALT_PORT, () => {
            console.log(`[E-RentHub Backend] Server running on http://localhost:${ALT_PORT}`);
        });
    } else {
        console.error("Server error:", err);
    }
});
