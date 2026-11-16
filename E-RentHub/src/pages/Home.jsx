import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import "./Home.css";

// 4 Categories matching the 16 products (4 Laptops, 4 Projectors, 4 Cameras, 4 Sound Boxes)
const CATEGORIES = [
    {
        id: "laptops",
        name: "Laptops",
        count: 4,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80",
    },
    {
        id: "projectors",
        name: "Projectors",
        count: 4,
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80",
    },
    {
        id: "cameras",
        name: "Cameras",
        count: 4,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80",
    },
    {
        id: "sound-boxes",
        name: "Sound Boxes",
        count: 4,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80",
    },
];

// Exactly 6 products: 2 Projectors, 2 Cameras, 2 Sound Boxes (Mapped to Place / City)
export const ALL_PRODUCTS = [
    // 2 Projectors
    {
        id: 1,
        name: "Epson 4K Ultra HD Home Cinema Projector",
        category: "Projectors",
        ownerName: "K. Satyanarayana",
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
        id: 2,
        name: "BenQ Full HD Conference & Event Projector",
        category: "Projectors",
        ownerName: "Ramesh V",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 119,
        monthlyPrice: 3570,
        badge: "Best Value",
        cpu: "1080p FHD Native",
        ram: "3600 ANSI Lumens",
        storage: "VGA / HDMI / USB",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "High-lumen projector for clear business presentations, outdoor screenings, workshops, and sports screenings in ambient light.",
    },

    // 2 Cameras
    {
        id: 3,
        name: "Canon EOS 200D II DSLR Camera (18-55mm Lens Kit)",
        category: "Cameras",
        ownerName: "Suresh Babu",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 149,
        monthlyPrice: 4470,
        badge: "Featured",
        cpu: "24.1MP Dual Pixel CMOS",
        ram: "4K Video Recording",
        storage: "64GB SD Card Included",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Lightweight DSLR camera with Eye Detection AF, 4K video recording, and 18-55mm lens kit ideal for photography, vlogging, and events.",
    },
    {
        id: 4,
        name: "Sony Alpha A6400 Mirrorless 4K Camera (16-50mm Lens)",
        category: "Cameras",
        ownerName: "Priya Sharma",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 179,
        monthlyPrice: 5370,
        badge: "Top Rated",
        cpu: "24.2MP Exmor CMOS",
        ram: "Real-time Eye AF & 4K HDR",
        storage: "128GB High-Speed SD",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Flagship mirrorless camera with lightning-fast 0.02s autofocus, 4K HDR movie recording, and compact body for professional video shoots and portraits.",
    },

    // 2 Sound Boxes
    {
        id: 5,
        name: "JBL PartyBox 310 High-Power Portable Speaker",
        category: "Sound Boxes",
        ownerName: "Hithesh Chaluvadi",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 169,
        monthlyPrice: 5070,
        badge: "Popular",
        cpu: "240W RMS Pro Sound",
        ram: "Dynamic Sync Lightshow",
        storage: "18hr Battery & Mic In",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "High-power 240W Bluetooth party sound box with deep bass, synchronized beat lighting, dual mic/guitar inputs, and built-in wheels.",
    },
    {
        id: 6,
        name: "Sony MHC-V13 Wireless High Power Audio System",
        category: "Sound Boxes",
        ownerName: "Subba Rao Chaluvadi",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 129,
        monthlyPrice: 3870,
        badge: "High Bass",
        cpu: "JET BASS BOOSTER",
        ram: "Multi-Color Speaker Light",
        storage: "Bluetooth / USB / CD / Mic",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "All-in-one wireless party sound box with Jet Bass Booster, upward-facing high-efficiency tweeters, and karaoke microphone input.",
    },

    // 3 Laptops
    {
        id: 7,
        name: "Apple MacBook Pro 14\" M2 Pro (16GB / 512GB SSD)",
        category: "Laptops",
        ownerName: "Hithesh Chaluvadi",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 249,
        monthlyPrice: 6490,
        badge: "Popular",
        cpu: "Apple M2 Pro 10-Core CPU",
        ram: "16GB Unified RAM",
        storage: "512GB Fast NVMe SSD",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Pro-grade powerhouse laptop with Liquid Retina XDR display, incredible battery life, and high GPU performance for coding, video rendering, and editing on rent.",
    },
    {
        id: 8,
        name: "Dell XPS 15 OLED Touch Laptop (Core i7 / 32GB RAM)",
        category: "Laptops",
        ownerName: "K. Satyanarayana",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 219,
        monthlyPrice: 5890,
        badge: "Featured",
        cpu: "Intel Core i7 13th Gen",
        ram: "32GB DDR5 Dual Channel",
        storage: "1TB NVMe / RTX 4050",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Ultra-slim 3.5K OLED touchscreen display with discrete NVIDIA RTX graphics for creative professionals, AutoCAD, architecture design, and presentations.",
    },
    {
        id: 9,
        name: "ASUS ROG Strix G16 240Hz Esports Gaming Laptop",
        category: "Laptops",
        ownerName: "Ramesh V",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 199,
        monthlyPrice: 5290,
        badge: "Top Rated",
        cpu: "Intel Core i7-13650HX",
        ram: "16GB DDR5 4800MHz",
        storage: "RTX 4060 8GB / 1TB SSD",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "High-performance esports gaming machine featuring NVIDIA GeForce RTX 4060 graphics and lightning 240Hz display for competitive tournaments and AAA titles.",
    },

    // 1 Additional Camera (Drone)
    {
        id: 10,
        name: "DJI Mini 4 Pro 4K Drone with RC 2 Smart Controller",
        category: "Cameras",
        ownerName: "Suresh Babu",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 219,
        monthlyPrice: 5990,
        badge: "Hot Item",
        cpu: "4K/60fps HDR True Vertical",
        ram: "Omnidirectional Obstacle Sensing",
        storage: "20km Video / 64GB MicroSD",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Compact foldable 4K aerial camera drone with smart tracking, obstacle sensing, and RC 2 screen controller for wedding cinematography, YouTube, and travel shoots.",
    },

    // 1 Additional Projector
    {
        id: 11,
        name: "ViewSonic X2-4K HDR Short Throw Home Projector",
        category: "Projectors",
        ownerName: "Priya Sharma",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 229,
        monthlyPrice: 6190,
        badge: "4K Cinema",
        cpu: "4K UHD 2150 ANSI Lumens",
        ram: "Harman Kardon Dual Speakers",
        storage: "0.69-0.83 Short Throw Ratio",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "True 4K projector built for gaming and cinematic home theaters with short-throw projection from just a few feet away and built-in Harman Kardon acoustics.",
    },

    // 1 Additional Sound Box
    {
        id: 12,
        name: "Marshall Woburn III Wireless Bluetooth Speaker",
        category: "Sound Boxes",
        ownerName: "Subba Rao Chaluvadi",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 179,
        monthlyPrice: 4890,
        badge: "Premium Audio",
        cpu: "150W RMS Class D Amplifier",
        ram: "HDMI ARC / Bluetooth 5.2",
        storage: "Three-Way Driver System",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Iconic vintage brass-accented Marshall flagship room-filling speaker delivering deep low-end bass and pristine highs for cocktail events, parties, and studio listening.",
    },

    // 1 Additional Laptop (HP Spectre)
    {
        id: 13,
        name: "HP Spectre x360 2-in-1 Touch Convertible Laptop",
        category: "Laptops",
        ownerName: "Hithesh Chaluvadi",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 209,
        monthlyPrice: 5590,
        badge: "Touchscreen",
        cpu: "Intel Core i7 13th Gen",
        ram: "16GB LPDDR5x RAM",
        storage: "1TB PCIe NVMe SSD / Stylus",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1544731612-de292439cc4b?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Versatile 360-degree flip touchscreen ultrabook with rechargeable tilt stylus pen, Bang & Olufsen quad speakers, and privacy camera shutter for presentations and sketching.",
    },

    // 1 Additional Camera (GoPro Action Camera)
    {
        id: 14,
        name: "GoPro HERO12 Black 5.3K Waterproof Action Camera",
        category: "Cameras",
        ownerName: "Priya Sharma",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 129,
        monthlyPrice: 3490,
        badge: "Waterproof",
        cpu: "5.3K60 + 4K120 HDR Video",
        ram: "HyperSmooth 6.0 + Horizon Lock",
        storage: "128GB Extreme SD + 2 Batteries",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Rugged waterproof action camera with unbeatable HyperSmooth stabilization, dual LCD screens, and accessory mount kit for adventure trips, bike rides, and vlogging.",
    },

    // 1 Additional Projector (Epson Business & Classroom)
    {
        id: 15,
        name: "Epson EB-E01 3300 Lumens Portable Classroom Projector",
        category: "Projectors",
        ownerName: "K. Satyanarayana",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 99,
        monthlyPrice: 2790,
        badge: "Budget Friendly",
        cpu: "3300 Lumens 3LCD Technology",
        ram: "HDMI / VGA / USB-B",
        storage: "12,000 hrs Long-life Lamp",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "High-brightness portable 3LCD projector with crisp text readability, vivid colors, and rapid setup for tuition centers, corporate meetings, and family functions.",
    },

    // 1 Additional Sound Box (Bose S1 Pro+)
    {
        id: 16,
        name: "Bose S1 Pro+ Wireless Bluetooth Portable PA System",
        category: "Sound Boxes",
        ownerName: "Ramesh V",
        city: "Eluru",
        place: "Eluru (Local Hub)",
        dailyPrice: 189,
        monthlyPrice: 5190,
        badge: "Studio Sound",
        cpu: "Bose ToneMatch Multi-Position EQ",
        ram: "3-Channel Mixer & OLED Displays",
        storage: "11hr Battery / Dual Mic Inputs",
        delivery: "Local Delivery (24-48 hrs)",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
        inStock: true,
        description: "Ultra-portable all-in-one wireless PA sound system with world-class Bose sound clarity, integrated wireless RF receivers, and rechargeable battery for musical performances and events.",
    },
];

export default function Home() {
    const navigate = useNavigate();

    // Search query
    const [search, setSearch] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get("search") || "";
        } catch (e) {
            return "";
        }
    });

    // Place selection: Show items according to place (Default: "Eluru")
    const [selectedPlace, setSelectedPlace] = useState("Eluru");

    // Filter 1: Items (Category)
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Filter 2: Price ('all', 'under-100', '100-200', 'above-200')
    const [priceFilter, setPriceFilter] = useState("all");

    // Quick filter dropdown in search bar
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Rate mode: "daily"
    const [rateMode, setRateMode] = useState("daily");
    const [sortOption, setSortOption] = useState("Recommended");

    // Initial Cart synced with localStorage (deduplicated by product ID & specification)
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_cart");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const seen = new Set();
                    const deduplicated = [];
                    for (const item of parsed) {
                        const key = String(item.id || item.name);
                        if (!seen.has(key)) {
                            seen.add(key);
                            deduplicated.push(item);
                        }
                    }
                    return deduplicated;
                }
            }
        } catch (e) { }
        return [];
    });

    useEffect(() => {
        try {
            localStorage.setItem("erenthub_cart", JSON.stringify(cart));
        } catch (e) { }
    }, [cart]);

    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [rentalDays, setRentalDays] = useState(3);
    const [toastMessage, setToastMessage] = useState("");

    // Community user listings from localStorage (listed via Sales Portal)
    const [userRentalsList, setUserRentalsList] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_user_rentals");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) { }
        return [];
    });

    // Booked items tracking (stored in localStorage)
    const [bookedItemIds, setBookedItemIds] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_booked_ids");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) { }
        return [];
    });

    // Combined catalog: Customers should NOT see their own products on the Home page
    // (excludes items listed by the customer, owned by the customer, or currently rented by the customer)
    const catalogProducts = useMemo(() => {
        // 1. Customer's active rented order names from localStorage
        let customerActiveOrderNames = [];
        try {
            const savedOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            if (Array.isArray(savedOrders)) {
                customerActiveOrderNames = savedOrders
                    .filter((o) => o.status !== "Cancelled" && o.status !== "Returned" && o.status !== "Completed")
                    .map((o) => (o.name || "").toLowerCase().trim());
            }
        } catch (e) { }

        // 2. Customer's own listed product titles & IDs from user rentals (Sales Portal)
        const customerListedTitles = userRentalsList.map((item) => (item.title || "").toLowerCase().trim());
        const customerListedIds = new Set(userRentalsList.map((item) => String(item.id)));

        // 3. Customer owner name identifiers
        const customerOwnerNames = ["chaluvadi", "hithesh", "subba rao"];

        // 4. Deleted products list from Admin / Backend
        let deletedProductIds = [];
        try {
            deletedProductIds = JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]").map((x) => String(x).toLowerCase().trim());
        } catch (e) { }

        // Filter the available stock from ALL_PRODUCTS:
        // Do NOT include userRentalsList (customer's own listings) on Home page.
        // Exclude products owned by the customer, booked, or deleted by admin.
        const availableStock = ALL_PRODUCTS.filter((prod) => {
            const strId = String(prod.id);
            const nameLower = (prod.name || "").toLowerCase().trim();
            const ownerLower = (prod.ownerName || "").toLowerCase().trim();

            // Product deleted by admin
            if (deletedProductIds.includes(strId.toLowerCase()) || deletedProductIds.includes(nameLower)) return false;

            // Customer already booked this item
            if (bookedItemIds.includes(strId)) return false;

            // Customer has an active order for this item
            if (customerActiveOrderNames.includes(nameLower)) return false;

            // Customer listed this item in Sales Portal
            if (customerListedIds.has(strId)) return false;
            if (customerListedTitles.includes(nameLower)) return false;

            // Customer owns this item
            if (customerOwnerNames.some((n) => ownerLower.includes(n))) return false;

            return true;
        });

        // 5. Merge any custom items added by Admin that aren't deleted
        let customAdminStock = [];
        try {
            const adminEquipment = JSON.parse(localStorage.getItem("erenthub_equipment") || "[]");
            if (Array.isArray(adminEquipment)) {
                adminEquipment.forEach((eq) => {
                    const eqName = (eq.name || "").toLowerCase().trim();
                    const eqId = String(eq.id || "").toLowerCase().trim();
                    if (!deletedProductIds.includes(eqId) && !deletedProductIds.includes(eqName)) {
                        const existsInStock = availableStock.some(
                            (p) => (p.name || "").toLowerCase().trim() === eqName || String(p.id).toLowerCase() === eqId
                        );
                        if (!existsInStock) {
                            customAdminStock.push({
                                id: eq.id,
                                name: eq.name,
                                category: eq.category,
                                image: eq.image || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
                                dailyPrice: Number(eq.dailyRate) || 150,
                                monthlyPrice: (Number(eq.dailyRate) || 150) * 25,
                                city: "Eluru",
                                place: "Eluru (Main Hub)",
                                cpu: "Standard",
                                ram: "Configured",
                                storage: "Included",
                                screen: "FHD Display",
                                description: eq.specs || "Professional verified equipment.",
                            });
                        }
                    }
                });
            }
        } catch (e) { }

        return [...availableStock, ...customAdminStock];
    }, [userRentalsList, bookedItemIds]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3500);
    };

    // When customer books an item, it immediately disappears from Home page and marks as booked in Sales Portal
    const handleBookNow = (product, e) => {
        if (e) e.stopPropagation();
        const strId = String(product.id);
        const newBooked = [...bookedItemIds, strId];
        setBookedItemIds(newBooked);

        try {
            localStorage.setItem("erenthub_booked_ids", JSON.stringify(newBooked));

            // Update user rentals list in storage
            const saved = localStorage.getItem("erenthub_user_rentals");
            if (saved) {
                const parsed = JSON.parse(saved);
                const updated = parsed.map((item) => {
                    if (String(item.id) === strId) {
                        return { ...item, status: "booked", bookedBy: "Customer (Home Page Booking)" };
                    }
                    return item;
                });
                localStorage.setItem("erenthub_user_rentals", JSON.stringify(updated));
                setUserRentalsList(updated);
            }

            // Also record in orders
            const savedOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            const endStr = new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const returnOtp = Math.floor(1000 + Math.random() * 9000).toString();

            const newOrder = {
                id: `ERH-${Math.floor(100000 + Math.random() * 900000)}`,
                name: product.name,
                category: product.category,
                image: product.image,
                bookingDate: todayStr,
                bookingTimestamp: Date.now(),
                startDate: todayStr,
                endDate: endStr,
                rentalStartDate: todayStr,
                returnDate: endStr,
                durationDays: 3,
                days: 3,
                rentalPrice: product.dailyPrice * 3,
                baseAmount: product.dailyPrice * 3,
                gstAmount: Math.round(product.dailyPrice * 3 * 0.18),
                securityDeposit: Number(product.deposit) || 1000,
                depositStatus: "Refundable on Return",
                totalAmount: product.dailyPrice * 3 + Math.round(product.dailyPrice * 3 * 0.18),
                paymentStatus: "Cash on Delivery",
                status: "Pending", // In Store
                trackingStage: 1, // 1: In Store, 2: Packing In Store, 3: Out of Store, 4: Active, 5: Returned
                trackingStatus: "Order Confirmed • Preparing at Store Hub",
                statusNote: "Item in Store Hub • Eligible for free cancellation",
                canCancel: true,
                startOtp: deliveryOtp,
                endOtp: returnOtp,
                otp: deliveryOtp,
                returnOtp: returnOtp,
                specs: product.description || "Verified gadget rental",
                deliveryAddress: product.place || "Eluru, Andhra Pradesh",
                customerName: "Subba Rao",
                customerPhone: "+91 73963 48793",
            };
            localStorage.setItem("erenthub_orders", JSON.stringify([newOrder, ...savedOrders]));
        } catch (err) { }

        showToast(`Booked "${product.name.slice(0, 22)}..."! It has been reserved and removed from the Home catalog.`);
    };

    const handleAddToCart = (product, daysCount = rentalDays, e) => {
        if (e) e.stopPropagation();
        const isAlreadyInCart = cart.some(
            (item) => String(item.id) === String(product.id) || (item.name.toLowerCase() === product.name.toLowerCase() && item.category === product.category)
        );
        if (isAlreadyInCart) {
            showToast(`"${product.name.slice(0, 22)}..." is already in your Cart. Each device can only be rented once.`);
            return;
        }
        setCart((prev) => [
            ...prev,
            { ...product, cartItemId: Date.now() + Math.random(), days: daysCount },
        ]);
        showToast(`Added "${product.name.slice(0, 22)}..." to Cart.`);
    };

    // Filter products: Place + Items (category) + Price
    const visibleProducts = useMemo(() => {
        let list = catalogProducts.filter((product) => {
            // Place / Location Filter: items show according to place
            if (selectedPlace && selectedPlace !== "All Places") {
                const prodCity = (product.city || product.place || "Eluru").toLowerCase();
                const filterPlace = selectedPlace.toLowerCase();
                if (!prodCity.includes(filterPlace) && !filterPlace.includes(prodCity)) {
                    return false;
                }
            }

            // Filter 1: Items (Category)
            if (selectedCategory && selectedCategory !== "All" && product.category !== selectedCategory) {
                return false;
            }

            // Search query filter
            if (search.trim()) {
                const query = search.trim().toLowerCase();
                const matchName = product.name.toLowerCase().includes(query);
                const matchCategory = product.category.toLowerCase().includes(query);
                const matchCity = (product.city || "").toLowerCase().includes(query);
                const matchSpecs = ((product.cpu || "") + (product.ram || "") + (product.storage || "")).toLowerCase().includes(query);
                if (!matchName && !matchCategory && !matchSpecs && !matchCity) return false;
            }

            // Filter 2: Price (Daily / Monthly)
            const price = rateMode === "daily" ? product.dailyPrice : product.monthlyPrice;
            if (rateMode === "daily") {
                if (priceFilter === "under-100" && price >= 100) return false;
                if (priceFilter === "100-200" && (price < 100 || price > 200)) return false;
                if (priceFilter === "above-200" && price <= 200) return false;
            } else {
                if (priceFilter === "under-100" && price >= 3000) return false;
                if (priceFilter === "100-200" && (price < 3000 || price > 6000)) return false;
                if (priceFilter === "above-200" && price <= 6000) return false;
            }

            return true;
        });

        // Sorting
        if (sortOption === "Price: Low to High") {
            list = [...list].sort((a, b) => {
                const priceA = rateMode === "daily" ? a.dailyPrice : a.monthlyPrice;
                const priceB = rateMode === "daily" ? b.dailyPrice : b.monthlyPrice;
                return priceA - priceB;
            });
        } else if (sortOption === "Price: High to Low") {
            list = [...list].sort((a, b) => {
                const priceA = rateMode === "daily" ? a.dailyPrice : a.monthlyPrice;
                const priceB = rateMode === "daily" ? b.dailyPrice : b.monthlyPrice;
                return priceB - priceA;
            });
        }

        return list;
    }, [catalogProducts, search, selectedPlace, selectedCategory, priceFilter, sortOption, rateMode]);

    const resetFilters = () => {
        setSearch("");
        setSelectedPlace("Eluru");
        setSelectedCategory("All");
        setPriceFilter("all");
        setSortOption("Recommended");
        setShowFilterDropdown(false);
    };

    return (
        <div className="erenthub-home">
            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="erenthub-toast">
                    <i className="ri-check-line"></i>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Official E-RentHub Sticky Navbar matching User Screenshot */}
            <header className="orders-navbar">
                <div className="orders-nav-container">
                    <Link to="/home" className="orders-brand-link" onClick={resetFilters}>
                        <img src={logo} alt="E-RentHub Logo" className="orders-brand-logo" />
                        <span className="orders-brand-name">
                            E-<span>RentHub</span>
                        </span>
                    </Link>

                    <nav className="orders-nav-links">
                        <Link to="/home" className="orders-nav-link active">
                            Home
                        </Link>
                        <Link to="/orders" className="orders-nav-link">
                            My Orders
                        </Link>
                        <Link to="/sales" className="orders-nav-link sales-portal-link">
                            Sales Portal
                        </Link>
                        <Link to="/profile" className="orders-nav-link">
                            Profile
                        </Link>
                    </nav>

                    <div className="orders-nav-right">
                        <button
                            type="button"
                            className="navbar-cart-btn"
                            onClick={() => navigate("/cart")}
                            title="View Cart"
                        >
                            <i className="ri-shopping-cart-2-fill"></i>
                            <span>Cart</span>
                            {cart.length > 0 && (
                                <span className="erenthub-counter-badge">{cart.length}</span>
                            )}
                        </button>
                        <ProfileDropdown />
                    </div>
                </div>
            </header>

            {/* Products Page Heading with Search Bar & Filter on Right Side */}
            <section className="products-heading">
                <div className="search-filter-main-bar">
                    <div className="products-search-box">
                        <i className="ri-search-line"></i>
                        <input
                            type="text"
                            placeholder="Search laptops, cameras, projectors, sound boxes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search electronics"
                        />
                        {search && (
                            <button
                                type="button"
                                className="products-search-clear"
                                onClick={() => setSearch("")}
                                title="Clear search"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        )}
                        <button type="button" className="products-search-submit">
                            Search
                        </button>
                    </div>

                    {/* Filter Button directly on Right Side of Search Bar */}
                    <div className="search-bar-filter-wrap">
                        <button
                            type="button"
                            className={`search-bar-filter-btn ${selectedCategory !== "All" || priceFilter !== "all" || selectedPlace !== "Eluru" ? "active" : ""}`}
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            title="Filter Products"
                        >
                            <i className="ri-equalizer-line"></i>
                            <span>Filters</span>
                            {(selectedCategory !== "All" || priceFilter !== "all" || selectedPlace !== "Eluru") && (
                                <span className="search-filter-active-pill">●</span>
                            )}
                            <i className={`ri-arrow-${showFilterDropdown ? "up" : "down"}-s-line`}></i>
                        </button>

                        {showFilterDropdown && (
                            <div className="search-filter-dropdown-menu">
                                <div className="search-filter-dropdown-header">
                                    <h4>Quick Filters</h4>
                                    <button
                                        type="button"
                                        className="search-filter-dropdown-close"
                                        onClick={() => setShowFilterDropdown(false)}
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                <div className="search-filter-pills-group">
                                    <span className="search-filter-pills-label">Category</span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {["All", "Laptops", "Projectors", "Cameras", "Sound Boxes"].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={`search-filter-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                                                onClick={() => setSelectedCategory(cat)}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="search-filter-pills-group">
                                    <span className="search-filter-pills-label">Delivery Place</span>
                                    <select
                                        value={selectedPlace}
                                        onChange={(e) => setSelectedPlace(e.target.value)}
                                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                    >
                                        <option value="Eluru">Eluru (Local Hub)</option>
                                        <option value="Vijayawada">Vijayawada</option>
                                        <option value="Guntur">Guntur</option>
                                        <option value="Rajahmundry">Rajahmundry</option>
                                    </select>
                                </div>

                                <div className="search-filter-pills-group">
                                    <span className="search-filter-pills-label">Daily Price</span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {[
                                            { key: "all", label: "Any Price" },
                                            { key: "under-150", label: "Under ₹150" },
                                            { key: "150-200", label: "₹150 - ₹200" },
                                            { key: "above-200", label: "Above ₹200" },
                                        ].map((p) => (
                                            <button
                                                key={p.key}
                                                type="button"
                                                className={`search-filter-pill-btn ${priceFilter === p.key ? "active" : ""}`}
                                                onClick={() => setPriceFilter(p.key)}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilterDropdown(false)}
                                        style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "4px", padding: "5px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <p className="products-eyebrow">
                    <i className="ri-map-pin-fill" style={{ marginRight: "4px" }}></i>
                    RENTALS IN {selectedPlace.toUpperCase()}
                </p>
                <h1>Rent Laptops, Projectors, Cameras & Sound Boxes in {selectedPlace}</h1>
                <p className="products-subtitle">
                    Showing electronics available in <strong>{selectedPlace}</strong> with doorstep Cash on Delivery and Local to Local Delivery!
                </p>
            </section>

            {/* Main Content Layout (Products Grid) */}
            <div className="products-layout">
                {/* Products Collection Section */}
                <section className="products-collection" id="explore">
                    <div className="products-collection-header">
                        <div>
                            <h2>Available in {selectedPlace} ({visibleProducts.length} devices)</h2>
                            <p>Cash on Delivery • Local to Local Delivery (₹0 advance)</p>
                        </div>

                        <div className="products-collection-actions">
                            {/* Day-Wise / Monthly Rate Switcher */}
                            <div className="erenthub-rate-toggle-wrap">
                                <button
                                    type="button"
                                    className={`erenthub-rate-btn ${rateMode === "daily" ? "active" : ""}`}
                                    onClick={() => setRateMode("daily")}
                                    title="View day-wise rental rates"
                                >
                                    Day-Wise
                                </button>
                                <button
                                    type="button"
                                    className={`erenthub-rate-btn ${rateMode === "monthly" ? "active" : ""}`}
                                    onClick={() => setRateMode("monthly")}
                                    title="View monthly rental rates"
                                >
                                    Monthly
                                </button>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="products-sort">
                                <label htmlFor="sort-products">Sort by:</label>
                                <select
                                    id="sort-products"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="Recommended">Recommended</option>
                                    <option value="Price: Low to High">Price: Low to High</option>
                                    <option value="Price: High to Low">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid: Shows items according to place */}
                    {visibleProducts.length > 0 ? (
                        <div className="products-grid">
                            {visibleProducts.map((product) => {
                                const displayedPrice = rateMode === "daily" ? product.dailyPrice : product.monthlyPrice;
                                const displayedUnit = rateMode === "daily" ? "/ day" : "/ mo";

                                return (
                                    <article key={product.id} className="product-card">
                                        {/* Product Image Area */}
                                        <div
                                            className="product-image"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            {product.badge && (
                                                <span className="product-badge">{product.badge}</span>
                                            )}

                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="product-main-img"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="product-info">
                                            <div className="product-meta-row">
                                                <p className="product-category">{product.category}</p>
                                                <span className="product-city-badge">
                                                    <i className="ri-map-pin-line"></i> {product.city || "Eluru"}
                                                </span>
                                            </div>

                                            <h3
                                                className="product-title"
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                title={product.name}
                                            >
                                                {product.name}
                                            </h3>
                                            <p className="product-description" title={product.description}>
                                                {product.description}
                                            </p>

                                            <div className="product-specs-row">
                                                <span><i className="ri-cpu-line"></i> {product.cpu}</span>
                                                <span><i className="ri-database-2-line"></i> {product.ram}</span>
                                                <span><i className="ri-hard-drive-2-line"></i> {product.storage}</span>
                                            </div>

                                            <div className="product-footer-section">
                                                <div className="product-price">
                                                    <strong>₹{displayedPrice}</strong>
                                                    <span>{displayedUnit}</span>
                                                </div>

                                                <div className="product-card-actions">
                                                    <button
                                                        type="button"
                                                        className="view-product-btn"
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                    >
                                                        <i className="ri-eye-line"></i> View
                                                    </button>
                                                    {(() => {
                                                        const isInCart = cart.some(
                                                            (c) => String(c.id) === String(product.id) || (c.name.toLowerCase() === product.name.toLowerCase() && c.category === product.category)
                                                        );
                                                        return (
                                                            <button
                                                                type="button"
                                                                className={`rent-now-btn ${isInCart ? "item-in-cart" : ""}`}
                                                                style={isInCart ? { backgroundColor: "#059669", borderColor: "#059669", color: "#ffffff" } : {}}
                                                                onClick={(e) => {
                                                                    if (isInCart) {
                                                                        if (e) e.stopPropagation();
                                                                        navigate("/cart");
                                                                    } else {
                                                                        handleAddToCart(product, rentalDays, e);
                                                                    }
                                                                }}
                                                                title={isInCart ? "Already in Cart - Click to open Cart" : "Add to rental bag"}
                                                            >
                                                                <i className={isInCart ? "ri-check-line" : "ri-shopping-cart-line"}></i> {isInCart ? "In Cart" : "+ Cart"}
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="erenthub-empty-state">
                            <i className="ri-map-pin-user-line" style={{ fontSize: "42px", color: "#94a3b8", display: "block", marginBottom: "12px" }}></i>
                            <h3 className="erenthub-empty-title">No items found in {selectedPlace}</h3>
                            <p className="erenthub-empty-desc">
                                We currently don't have electronics listed for {selectedPlace}. Switch to <strong>Eluru</strong> or click <strong>All Places</strong> to see all available devices!
                            </p>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px" }}>
                                <button
                                    type="button"
                                    className="clear-filters-btn"
                                    style={{ maxWidth: "160px", margin: 0 }}
                                    onClick={() => setSelectedPlace("Eluru")}
                                >
                                    Show Eluru Items
                                </button>
                                <button
                                    type="button"
                                    className="clear-filters-btn"
                                    style={{ maxWidth: "160px", margin: 0, background: "#2563eb", color: "#ffffff" }}
                                    onClick={() => setSelectedPlace("All Places")}
                                >
                                    View All Places
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Quick View Modal (Day-Wise Rental Selector) */}
            {quickViewProduct && (
                <div
                    className="erenthub-modal-backdrop"
                    onClick={() => setQuickViewProduct(null)}
                >
                    <div
                        className="erenthub-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="erenthub-modal-head">
                            <div>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>
                                    {quickViewProduct.category}
                                </span>
                                <h3 style={{ margin: "2px 0 0", fontSize: "17px", color: "#0f172a" }}>
                                    {quickViewProduct.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                className="erenthub-modal-close"
                                onClick={() => setQuickViewProduct(null)}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="erenthub-modal-body">
                            <div>
                                <img
                                    src={quickViewProduct.image}
                                    alt={quickViewProduct.name}
                                    className="erenthub-modal-img"
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "13px" }}>
                                    <span style={{ color: "#2563eb", fontWeight: "600" }}><i className="ri-map-pin-line"></i> {quickViewProduct.city || "Eluru"} Hub</span>
                                    <span style={{ color: "#10b981", fontWeight: "700" }}>In Stock</span>
                                </div>
                            </div>

                            <div className="erenthub-modal-details">
                                <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: "0 0 14px" }}>
                                    {quickViewProduct.description}
                                </p>

                                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                                        <span style={{ color: "#64748b" }}>Daily Rental Rate:</span>
                                        <strong style={{ fontSize: "17px", color: "#2563eb" }}>₹{quickViewProduct.dailyPrice} / day</strong>
                                    </div>

                                    <div style={{ marginTop: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                                                Select Number of Days:
                                            </span>
                                            <div className="erenthub-day-counter">
                                                <button
                                                    type="button"
                                                    className="erenthub-day-counter-btn"
                                                    onClick={() => setRentalDays((d) => Math.max(1, d - 1))}
                                                >
                                                    -
                                                </button>
                                                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", minWidth: "55px", textAlign: "center" }}>
                                                    {rentalDays} {rentalDays === 1 ? "Day" : "Days"}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="erenthub-day-counter-btn"
                                                    onClick={() => setRentalDays((d) => d + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="erenthub-tenure-selector" style={{ marginTop: "8px" }}>
                                            {[1, 3, 7, 14, 30].map((daysCount) => (
                                                <button
                                                    key={daysCount}
                                                    type="button"
                                                    className={`erenthub-tenure-btn ${rentalDays === daysCount ? "active" : ""}`}
                                                    onClick={() => setRentalDays(daysCount)}
                                                >
                                                    {daysCount} {daysCount === 1 ? "Day" : "Days"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "10px", fontSize: "14px" }}>
                                        <span style={{ fontWeight: "600" }}>Total Rental Cost ({rentalDays} {rentalDays === 1 ? "day" : "days"}):</span>
                                        <strong style={{ fontSize: "18px", color: "#2563eb" }}>
                                            ₹{quickViewProduct.dailyPrice * rentalDays}
                                        </strong>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                                    <button
                                        type="button"
                                        className="erenthub-btn-quickview"
                                        style={{ flex: 1, padding: "12px", fontSize: "13px" }}
                                        onClick={() => {
                                            handleAddToCart(quickViewProduct, rentalDays);
                                            setQuickViewProduct(null);
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        type="button"
                                        className="erenthub-btn-addcart"
                                        style={{ flex: 1.3, padding: "12px", fontSize: "13px" }}
                                        onClick={() => {
                                            handleAddToCart(quickViewProduct, rentalDays);
                                            setQuickViewProduct(null);
                                            navigate("/checkout");
                                        }}
                                    >
                                        Proceed to Checkout →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Page Footer */}
            <footer className="products-footer">
                <div className="products-footer-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <img src={logo} alt="E-RentHub Logo" style={{ height: "32px", width: "auto" }} />
                    <span>E-Rent<span style={{ color: "#3b82f6" }}>Hub</span></span>
                </div>
                <p>Your trusted local platform for renting laptops, cameras, and projectors with doorstep Cash on Delivery in Eluru.</p>
                <div className="products-footer-links">
                    <a href="/home" onClick={(e) => { e.preventDefault(); navigate("/home"); resetFilters(); }}>All Electronics</a>
                    <a href="/cart" onClick={(e) => { e.preventDefault(); navigate("/cart"); }}>Cart</a>
                    <a href="/orders" onClick={(e) => { e.preventDefault(); navigate("/orders"); }}>Orders</a>
                    <a href="/profile" onClick={(e) => { e.preventDefault(); navigate("/profile"); }}>Profile</a>
                    <Link to="/terms">Terms & Conditions</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>
                <p className="products-copyright">© 2026 E-RentHub. All rights reserved.</p>
            </footer>
        </div>
    );
}
