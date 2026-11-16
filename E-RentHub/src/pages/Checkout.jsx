import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import { createOrder } from "./api";
import GoogleMapsRouteViewer from "../components/GoogleMapsRouteViewer";
import GoogleMapsAddressPicker, { ELURU_PICKUP_HUBS } from "../components/GoogleMapsAddressPicker";
import "./Checkout.css";

const DEFAULT_CHECKOUT_ITEMS = [
    {
        cartItemId: 101,
        id: 1,
        name: "Epson 4K Ultra HD Home Cinema Projector",
        category: "Projectors",
        specs: "4K PRO-UHD • 3000 Lumens • HDR10 • Dual HDMI",
        dailyPrice: 189,
        days: 3,
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    },
    {
        cartItemId: 102,
        id: 3,
        name: "Canon EOS 200D II DSLR Camera (18-55mm Lens Kit)",
        category: "Cameras",
        specs: "24.1MP Dual Pixel • 4K Video • 64GB Extreme SD",
        dailyPrice: 149,
        days: 2,
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
    },
];

export default function Checkout() {
    const navigate = useNavigate();

    // Load cart items from localStorage or fallback
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_cart");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { }
        return DEFAULT_CHECKOUT_ITEMS;
    });

    // 3-Step Checkout Flow: 1: Delivery Address, 2: Order Summary, 3: Payment
    const [activeStep, setActiveStep] = useState(2);

    // Customer Doorstep Delivery Address
    const [address, setAddress] = useState(() => {
        let userName = "Balu Hithesh";
        let userPhone = "7396348793";
        let userEmail = "balue.hithesh@gmail.com";
        let userAddress = "Flat 302, Sri Sai Residency, Powerpet Main Road, Eluru - 534002";
        try {
            const u = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            if (u.name) userName = u.name;
            if (u.phone) userPhone = u.phone.replace(/[^0-9]/g, "").slice(-10) || "7396348793";
            if (u.email) userEmail = u.email;
            if (u.address) userAddress = u.address;
        } catch (e) { }
        return {
            name: userName,
            type: "CUSTOMER",
            city: "Eluru, Andhra Pradesh",
            fullAddress: userAddress,
            phone: userPhone,
            email: userEmail,
            coords: { lat: 16.7107, lng: 81.0952 },
        };
    });

    // Equipment Pickup Hub
    const [pickupLocation, setPickupLocation] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_pickup_hub");
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return {
            id: "hub-powerpet",
            name: "Central Logistics Hub (Powerpet)",
            address: "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
            coords: { lat: 16.7145, lng: 81.1020 },
        };
    });

    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [tempAddress, setTempAddress] = useState(address);
    const [savedNotice, setSavedNotice] = useState("");

    // Payment method: Pay on Delivery (Cash / UPI)
    const [selectedPayment, setSelectedPayment] = useState("pod");

    // Order completion status
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [orderDates, setOrderDates] = useState({ start: "", end: "" });
    const [confirmedItems, setConfirmedItems] = useState([]);

    // Update tenure days
    const handleUpdateDays = (cartItemId, newDays) => {
        if (newDays < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item.cartItemId === cartItemId ? { ...item, days: newDays } : item
            )
        );
    };

    // Calculate base cost, 18% GST charge, and total payable
    const baseCost = cart.reduce((sum, item) => sum + item.dailyPrice * (item.days || 1), 0);
    const gstAmount = Math.round(baseCost * 0.18);
    const totalCost = baseCost + gstAmount;
    const savingsAmount = 1014;

    const handleCopyAddress = (addrText) => {
        navigator.clipboard.writeText(addrText || address.fullAddress);
        setSavedNotice("Address copied! Paste into Google Maps.");
        setTimeout(() => setSavedNotice(""), 3000);
    };

    // Place Order action (Doorstep Delivery with Pay on Handover)
    const handlePlaceOrder = () => {
        const generatedId = "ERH-" + Math.floor(100000 + Math.random() * 900000);
        setOrderId(generatedId);

        try {
            const itemsList = cart.map((item) => {
                const days = item.days || 3;
                const itemBase = item.dailyPrice * days;
                const itemGst = Math.round(itemBase * 0.18);
                const itemTotal = itemBase + itemGst;
                return {
                    id: item.id || item.cartItemId,
                    name: item.name,
                    image: item.image,
                    category: item.category || "Electronics",
                    days: days,
                    dailyRate: item.dailyPrice,
                    baseAmount: itemBase,
                    gstAmount: itemGst,
                    totalAmount: itemTotal,
                    startDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                    endDate: new Date(Date.now() + days * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                };
            });

            setConfirmedItems(itemsList);
            const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            const maxDays = Math.max(...itemsList.map((i) => i.days || 3), 3);
            const totalDeposit = cart.reduce((sum, item) => sum + (Number(item.deposit) || 1000), 0);
            const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const startStr = itemsList[0]?.startDate || todayStr;
            const endStr = itemsList[0]?.endDate || new Date(Date.now() + maxDays * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

            setOrderDates({ start: startStr, end: endStr });
            setOrderSuccess(true);

            // Clear active cart
            localStorage.setItem("erenthub_cart", JSON.stringify([]));
            const existingOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");

            const singleOrderPayload = {
                id: generatedId,
                name: itemsList.length === 1 ? itemsList[0].name : `${itemsList[0].name} + ${itemsList.length - 1} more items`,
                image: itemsList[0]?.image || "",
                category: itemsList[0]?.category || "Electronics",
                items: itemsList,
                itemCount: itemsList.length,
                days: maxDays,
                durationDays: maxDays,
                bookingDate: todayStr,
                bookingTimestamp: Date.now(),
                startDate: startStr,
                endDate: endStr,
                rentalStartDate: startStr,
                returnDate: endStr,
                baseAmount: baseCost,
                rentalPrice: baseCost,
                gstAmount: gstAmount,
                securityDeposit: totalDeposit,
                depositStatus: "Refundable on Return",
                totalAmount: totalCost,
                customerName: address.name,
                customerPhone: address.phone,
                customerEmail: address.email || "balue.hithesh@gmail.com",
                deliveryAddress: address.fullAddress,
                deliveryCoords: address.coords || { lat: 16.7107, lng: 81.0952 },
                pickupHub: pickupLocation.name,
                pickupAddress: pickupLocation.address,
                pickupCoords: pickupLocation.coords || { lat: 16.7145, lng: 81.1020 },
                paymentStatus: "Pay on Delivery (Cash / UPI)",
                deliveryType: "Doorstep Delivery",
                orderType: "Doorstep Delivery",
                status: "Pending",
                trackingStage: 1,
                trackingStatus: "Order Confirmed • Assigned for Delivery",
                statusNote: "Order confirmed. Delivery partner will pick up gadget and deliver to your doorstep.",
                canCancel: true,
                collectionOtp: deliveryOtp,
                deliveryOtp: deliveryOtp,
                otp: deliveryOtp,
                salespersonEmail: "sales.eluru@erenthub.in",
                salespersonName: "Equipment Partner",
                statusColor: "#2563eb",
                badge: "Confirmed",
                isCancelled: false,
                isCompleted: false,
                isReturned: false,
            };

            createOrder(singleOrderPayload).catch(() => { });
            localStorage.setItem("erenthub_orders", JSON.stringify([singleOrderPayload, ...existingOrders]));

            // Mark checked out items as booked
            const bookedList = JSON.parse(localStorage.getItem("erenthub_booked_ids") || "[]");
            const newBookedIds = [...bookedList];
            cart.forEach((cItem) => {
                const sId = String(cItem.id || cItem.cartItemId);
                if (!newBookedIds.includes(sId)) {
                    newBookedIds.push(sId);
                }
            });
            localStorage.setItem("erenthub_booked_ids", JSON.stringify(newBookedIds));

            // Sync user rentals status
            const userRentals = JSON.parse(localStorage.getItem("erenthub_user_rentals") || "[]");
            if (Array.isArray(userRentals) && userRentals.length > 0) {
                const updatedRentals = userRentals.map((rItem) => {
                    if (newBookedIds.includes(String(rItem.id))) {
                        return { ...rItem, status: "booked", bookedBy: address.name || "Customer" };
                    }
                    return rItem;
                });
                localStorage.setItem("erenthub_user_rentals", JSON.stringify(updatedRentals));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a" }}>
            {/* 1. Official E-RentHub Top Navbar */}
            <header className="products-navbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
                <div className="navbar-brand-left">
                    <div
                        onClick={() => navigate("/home")}
                        className="products-logo"
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                        title="E-RentHub Home"
                    >
                        <img src={logo} alt="E-RentHub Logo" className="navbar-logo-img" />
                        <span className="products-logo-text">
                            E-Rent<span>Hub</span>
                        </span>
                    </div>
                </div>

                {/* Navbar Right: Cart & Profile Dropdown */}
                <div className="navbar-actions-right">
                    <button
                        type="button"
                        className="navbar-cart-btn"
                        onClick={() => navigate("/cart")}
                        title="View Cart"
                    >
                        <i className="ri-shopping-cart-2-line"></i>
                        <span>Cart</span>
                        {cart.length > 0 && !orderSuccess && (
                            <span className="erenthub-counter-badge">{cart.length}</span>
                        )}
                    </button>

                    <ProfileDropdown />
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ maxWidth: "1240px", margin: "20px auto 60px", padding: "0 16px" }}>
                {!orderSuccess ? (
                    <div>
                        {/* 2. E-RentHub Checkout Stepper Bar (Address -> Order Summary -> Payment) */}
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: "10px",
                                padding: "16px 24px",
                                marginBottom: "18px",
                                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "16px",
                            }}
                        >
                            {/* Step 1: Address */}
                            <div
                                onClick={() => setActiveStep(1)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    color: activeStep >= 1 ? "#2563eb" : "#64748b",
                                }}
                            >
                                <span
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: activeStep > 1 ? "#2563eb" : activeStep === 1 ? "#2563eb" : "#f1f5f9",
                                        border: activeStep >= 1 ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                                        color: activeStep >= 1 ? "#ffffff" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                    }}
                                >
                                    {activeStep > 1 ? <i className="ri-check-line"></i> : "1"}
                                </span>
                                <span style={{ fontSize: "13px", fontWeight: activeStep === 1 ? "800" : "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Delivery Address
                                </span>
                            </div>

                            {/* Connecting Line 1 */}
                            <div style={{ width: "60px", height: "2px", backgroundColor: activeStep >= 2 ? "#2563eb" : "#e2e8f0" }} />

                            {/* Step 2: Order Summary */}
                            <div
                                onClick={() => setActiveStep(2)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    color: activeStep >= 2 ? "#2563eb" : "#64748b",
                                }}
                            >
                                <span
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: activeStep > 2 ? "#2563eb" : activeStep === 2 ? "#2563eb" : "#f1f5f9",
                                        border: activeStep >= 2 ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                                        color: activeStep >= 2 ? "#ffffff" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                    }}
                                >
                                    {activeStep > 2 ? <i className="ri-check-line"></i> : "2"}
                                </span>
                                <span style={{ fontSize: "13px", fontWeight: activeStep === 2 ? "800" : "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Order Summary
                                </span>
                            </div>

                            {/* Connecting Line 2 */}
                            <div style={{ width: "60px", height: "2px", backgroundColor: activeStep >= 3 ? "#2563eb" : "#e2e8f0" }} />

                            {/* Step 3: Payment */}
                            <div
                                onClick={() => setActiveStep(3)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    color: activeStep === 3 ? "#2563eb" : "#64748b",
                                }}
                            >
                                <span
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: activeStep === 3 ? "#2563eb" : "#f1f5f9",
                                        border: activeStep === 3 ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                                        color: activeStep === 3 ? "#ffffff" : "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                    }}
                                >
                                    3
                                </span>
                                <span style={{ fontSize: "13px", fontWeight: activeStep === 3 ? "800" : "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Payment
                                </span>
                            </div>
                        </div>

                        {/* 2-Column Checkout Layout */}
                        <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", flexWrap: "wrap" }}>
                            {/* Left Column */}
                            <div style={{ flex: "1 1 740px", minWidth: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                {/* Step 1: Customer Doorstep Delivery Address */}
                                <div
                                    style={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: "10px",
                                        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: "18px 24px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            borderBottom: isEditingAddress ? "1px solid #f1f5f9" : "none",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: "260px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                                                    Delivery Address:
                                                </span>
                                                <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "4px" }}>
                                                    <i className="ri-truck-line" style={{ marginRight: "3px" }}></i>
                                                    Doorstep Delivery
                                                </span>
                                                <span style={{ fontSize: "11px", fontWeight: "600", backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px" }}>
                                                    FREE Delivery
                                                </span>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                                <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                                                    {address.name}
                                                </strong>
                                                <span
                                                    style={{
                                                        backgroundColor: "#f1f5f9",
                                                        color: "#475569",
                                                        fontSize: "11px",
                                                        fontWeight: "700",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    {address.city}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: "13.5px", color: "#334155", lineHeight: "1.5", marginBottom: "8px" }}>
                                                <i className="ri-map-pin-2-fill" style={{ color: "#2563eb", marginRight: "4px" }}></i>
                                                {address.fullAddress}
                                            </div>

                                            {/* Equipment Pickup Hub summary */}
                                            <div style={{ fontSize: "12px", color: "#92400e", backgroundColor: "#fffbeb", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fef3c7", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                                <i className="ri-store-2-fill"></i>
                                                <span><strong>Pickup Hub:</strong> {pickupLocation.name}</span>
                                                <span style={{ color: "#b45309" }}>• {pickupLocation.address}</span>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "12.5px", color: "#64748b" }}>
                                                <span><strong style={{ color: "#0f172a" }}>Phone:</strong> +91 {address.phone}</span>
                                                <span><strong style={{ color: "#0f172a" }}>Email:</strong> {address.email}</span>
                                            </div>

                                            {savedNotice && (
                                                <div style={{ marginTop: "8px", color: "#16a34a", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <i className="ri-check-line"></i> {savedNotice}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.fullAddress)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #cbd5e1",
                                                    color: "#475569",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    textDecoration: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <i className="ri-external-link-line"></i>
                                                <span>Google Maps</span>
                                            </a>

                                            <button
                                                type="button"
                                                onClick={() => setIsEditingAddress(!isEditingAddress)}
                                                style={{
                                                    backgroundColor: isEditingAddress ? "#f1f5f9" : "#eff6ff",
                                                    border: "1px solid #bfdbfe",
                                                    color: "#2563eb",
                                                    fontSize: "13px",
                                                    fontWeight: "600",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <i className="ri-map-pin-line"></i>
                                                <span>{isEditingAddress ? "Close Map Picker" : "Select on Google Maps"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Customer Contact & Address Details */}
                                    {isEditingAddress && (
                                        <div style={{ padding: "18px 24px", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tempAddress.name}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                                                        placeholder="Full Name"
                                                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                                                        Mobile Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tempAddress.phone}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                                                        placeholder="10-digit mobile number"
                                                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={tempAddress.email}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, email: e.target.value })}
                                                        placeholder="Email address"
                                                        style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Google Maps Interactive Location Picker for Delivery & Pickup */}
                                            <GoogleMapsAddressPicker
                                                initialDeliveryAddress={tempAddress.fullAddress}
                                                initialPickupHubId={pickupLocation.id || "hub-powerpet"}
                                                onLocationChange={({ deliveryAddress: newDelivery, deliveryCoords: newCoords, pickupAddress: newPickupAddr, pickupCoords: newPickupCoords, pickupHub: newPickupHub }) => {
                                                    setTempAddress((prev) => ({
                                                        ...prev,
                                                        fullAddress: newDelivery,
                                                        coords: newCoords,
                                                    }));
                                                    setPickupLocation({
                                                        id: newPickupHub,
                                                        name: newPickupHub,
                                                        address: newPickupAddr,
                                                        coords: newPickupCoords,
                                                    });
                                                    localStorage.setItem("erenthub_pickup_hub", JSON.stringify({
                                                        id: newPickupHub,
                                                        name: newPickupHub,
                                                        address: newPickupAddr,
                                                        coords: newPickupCoords,
                                                    }));
                                                }}
                                            />

                                            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "16px" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAddress(tempAddress);
                                                        setIsEditingAddress(false);
                                                        setSavedNotice("Delivery and Pickup locations confirmed on Google Maps!");
                                                        setTimeout(() => setSavedNotice(""), 3000);
                                                    }}
                                                    style={{
                                                         backgroundColor: "#2563eb",
                                                         color: "#ffffff",
                                                         border: "none",
                                                         padding: "10px 22px",
                                                         fontSize: "13px",
                                                         fontWeight: "700",
                                                         borderRadius: "6px",
                                                         cursor: "pointer",
                                                         display: "inline-flex",
                                                         alignItems: "center",
                                                         gap: "6px",
                                                    }}
                                                >
                                                     <i className="ri-check-line"></i>
                                                     <span>Save Delivery & Pickup Locations</span>
                                                </button>
                                                <button
                                                     type="button"
                                                     onClick={() => setIsEditingAddress(false)}
                                                     style={{
                                                         backgroundColor: "#ffffff",
                                                         color: "#64748b",
                                                         border: "1px solid #cbd5e1",
                                                         padding: "10px 18px",
                                                         fontSize: "13px",
                                                         fontWeight: "600",
                                                         borderRadius: "6px",
                                                         cursor: "pointer",
                                                     }}
                                                >
                                                     Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary Card (Step 2 - Expanded) */}
                                {activeStep === 2 && (
                                    <div
                                        style={{
                                            backgroundColor: "#ffffff",
                                            borderRadius: "10px",
                                            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                                            border: "1px solid #e2e8f0",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Products List */}
                                        {cart.map((item, idx) => {
                                            const itemDays = item.days || 3;
                                            const itemTotal = item.dailyPrice * itemDays;
                                            const originalPrice = Math.round(itemTotal * 1.85);

                                            return (
                                                <div
                                                    key={item.cartItemId || idx}
                                                    style={{
                                                        padding: "24px",
                                                        borderBottom: "1px solid #f1f5f9",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                                                        {/* Left: Thumbnail & Tenure Stepper */}
                                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                style={{ width: "110px", height: "110px", objectFit: "contain", padding: "4px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                                                            />
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateDays(item.cartItemId, itemDays - 1)}
                                                                    style={{
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        borderRadius: "50%",
                                                                        border: "1px solid #cbd5e1",
                                                                        backgroundColor: "#ffffff",
                                                                        fontWeight: "700",
                                                                        fontSize: "14px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    -
                                                                </button>
                                                                <span
                                                                    style={{
                                                                        padding: "4px 10px",
                                                                        border: "1px solid #e2e8f0",
                                                                        borderRadius: "4px",
                                                                        fontSize: "12px",
                                                                        fontWeight: "700",
                                                                        minWidth: "64px",
                                                                        textAlign: "center",
                                                                        backgroundColor: "#f8fafc",
                                                                    }}
                                                                >
                                                                    {itemDays} Days
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateDays(item.cartItemId, itemDays + 1)}
                                                                    style={{
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        borderRadius: "50%",
                                                                        border: "1px solid #cbd5e1",
                                                                        backgroundColor: "#ffffff",
                                                                        fontWeight: "700",
                                                                        fontSize: "14px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Right: Item details */}
                                                        <div style={{ flex: 1, minWidth: "260px" }}>
                                                            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>
                                                                {item.name}
                                                            </h3>
                                                            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                                                                Specs: {item.specs || item.category || "Standard Electronics"}
                                                            </div>

                                                            {/* Verification Badge */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                                                <span
                                                                    style={{
                                                                        backgroundColor: "#f1f5f9",
                                                                        color: "#334155",
                                                                        fontSize: "11px",
                                                                        fontWeight: "600",
                                                                        padding: "2px 7px",
                                                                        borderRadius: "4px",
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "4px",
                                                                    }}
                                                                >
                                                                    <i className="ri-checkbox-circle-line"></i> Verified Device
                                                                </span>
                                                            </div>

                                                            {/* Price Row */}
                                                            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                                                                <span style={{ color: "#16a34a", fontSize: "13px", fontWeight: "700" }}>
                                                                    ↓45%
                                                                </span>
                                                                <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "14px" }}>
                                                                    ₹{originalPrice.toLocaleString("en-IN")}
                                                                </span>
                                                                <strong style={{ fontSize: "19px", color: "#0f172a" }}>
                                                                    ₹{itemTotal.toLocaleString("en-IN")}
                                                                </strong>
                                                                <span style={{ fontSize: "12px", color: "#64748b" }}>
                                                                    (₹{item.dailyPrice}/day)
                                                                </span>
                                                            </div>

                                                            {/* Delivery Note */}
                                                            <div style={{ fontSize: "13px", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <i className="ri-truck-line" style={{ color: "#2563eb" }}></i>
                                                                <span>Doorstep Delivery: <strong>Delivered by E-RentHub Partner</strong> • <span style={{ color: "#16a34a", fontWeight: "700" }}>FREE</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Handover Notice strip */}
                                                    <div
                                                        style={{
                                                            marginTop: "16px",
                                                            backgroundColor: "#f8fafc",
                                                            border: "1px solid #e2e8f0",
                                                            padding: "10px 14px",
                                                            fontSize: "12px",
                                                            color: "#334155",
                                                            borderRadius: "6px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px",
                                                        }}
                                                    >
                                                        <i className="ri-shield-check-fill" style={{ color: "#2563eb", fontSize: "16px" }}></i>
                                                        <span><strong>Doorstep Handover & Inspection:</strong> Our delivery partner delivers to your doorstep. Inspect & test the equipment upon arrival. No OTP required—simply confirm delivery and pay on delivery with ₹0 advance required.</span>
                                                    </div>

                                                    {/* Cancellation strip */}
                                                    <div
                                                        style={{
                                                            marginTop: "8px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px",
                                                            fontSize: "12px",
                                                            color: "#64748b",
                                                        }}
                                                    >
                                                        <span>↺</span>
                                                        <span>
                                                            Free cancellation allowed anytime before delivery partner picks up the gadget.
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Bottom Bar: Action to proceed to Payment */}
                                        <div
                                            style={{
                                                padding: "16px 24px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                backgroundColor: "#f8fafc",
                                                borderTop: "1px solid #e2e8f0",
                                                flexWrap: "wrap",
                                                gap: "12px",
                                            }}
                                        >
                                            <div style={{ fontSize: "13px", color: "#64748b" }}>
                                                Order confirmation & arrival updates sent to <strong>{address.email}</strong>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setActiveStep(3)}
                                                style={{
                                                    backgroundColor: "#2563eb",
                                                    color: "#ffffff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "13px 32px",
                                                    fontSize: "14px",
                                                    fontWeight: "700",
                                                    textTransform: "uppercase",
                                                    cursor: "pointer",
                                                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                                                }}
                                            >
                                                Continue to Payment →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Collapsed Order Summary Bar */}
                                {activeStep !== 2 && (
                                    <div
                                        style={{
                                            backgroundColor: "#ffffff",
                                            padding: "16px 24px",
                                            borderRadius: "10px",
                                            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <span style={{ color: "#64748b", fontSize: "14px" }}>Order Summary:</span>{" "}
                                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{cart.length} Item(s)</strong>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep(2)}
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "1.5px solid #2563eb",
                                                color: "#2563eb",
                                                fontSize: "13px",
                                                fontWeight: "700",
                                                padding: "6px 16px",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}

                                {/* Step 3: Payment Options (Pay on Delivery) */}
                                {activeStep === 3 && (
                                    <div
                                        style={{
                                            backgroundColor: "#ffffff",
                                            borderRadius: "10px",
                                            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                                            border: "1px solid #e2e8f0",
                                            padding: "24px",
                                        }}
                                    >
                                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px" }}>
                                            Select Rental Payment Option
                                        </h3>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                                            {/* Pay on Delivery */}
                                            <label
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "14px",
                                                    padding: "18px",
                                                    border: "2px solid #2563eb",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#eff6ff",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="erenthub_payment"
                                                    checked={selectedPayment === "pod"}
                                                    onChange={() => setSelectedPayment("pod")}
                                                    style={{ marginTop: "4px" }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                                        <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                                                            Pay on Delivery (Cash or UPI on Handover)
                                                        </strong>
                                                        <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px" }}>
                                                            Doorstep Handover • ₹0 Advance
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                                                        Our delivery partner will bring the equipment to your doorstep ({address.fullAddress}). Inspect and test the device thoroughly with the executive before paying.
                                                    </p>
                                                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#166534", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <i className="ri-check-line"></i> Pay via Cash, Google Pay, PhonePe, or UPI QR upon delivery • ₹0 advance required
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handlePlaceOrder}
                                            style={{
                                                backgroundColor: "#2563eb",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "14px 36px",
                                                fontSize: "15px",
                                                fontWeight: "700",
                                                textTransform: "uppercase",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                                            }}
                                        >
                                            Confirm Rental Booking (Pay on Delivery)
                                        </button>
                                    </div>
                                )}

                                <p style={{ fontSize: "12px", color: "#64748b", margin: "8px 0 0" }}>
                                    By placing this rental booking, you agree to E-RentHub's <span style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}>Terms of Use</span> and <span style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>.
                                </p>
                            </div>

                            {/* Right Column: E-RentHub "Price Details" Card */}
                            <div style={{ flex: "1 1 340px", minWidth: "280px" }}>
                                <div
                                    style={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: "10px",
                                        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                                        border: "1px solid #e2e8f0",
                                        position: "sticky",
                                        top: "80px",
                                    }}
                                >
                                    {/* Card Header */}
                                    <div
                                        style={{
                                            padding: "14px 24px",
                                            borderBottom: "1px solid #f1f5f9",
                                            fontSize: "14px",
                                            fontWeight: "800",
                                            color: "#64748b",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        Price Details
                                    </div>

                                    {/* Line items */}
                                    <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#475569" }}>MRP (incl. of all taxes)</span>
                                            <span style={{ color: "#0f172a" }}>₹{Math.round(baseCost * 1.85).toLocaleString("en-IN")}</span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#475569" }}>Base Rental Total</span>
                                            <span style={{ color: "#0f172a", fontWeight: "600" }}>₹{baseCost.toLocaleString("en-IN")}</span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#2563eb", fontWeight: "600" }}>
                                                Fees (18% GST Charge)
                                            </span>
                                            <span style={{ color: "#2563eb", fontWeight: "700" }}>+₹{gstAmount.toLocaleString("en-IN")}</span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#475569" }}>Discounts</span>
                                            <span style={{ color: "#16a34a", fontWeight: "700" }}>-₹{savingsAmount.toLocaleString("en-IN")}</span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#475569" }}>Doorstep Delivery</span>
                                            <span style={{ color: "#16a34a", fontWeight: "700" }}>FREE</span>
                                        </div>

                                        {/* Divider */}
                                        <div
                                            style={{
                                                borderTop: "1px dashed #cbd5e1",
                                                paddingTop: "14px",
                                                marginTop: "4px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <strong style={{ fontSize: "16px", color: "#0f172a" }}>Total Amount</strong>
                                            <strong style={{ fontSize: "20px", color: "#2563eb", fontWeight: "800" }}>₹{totalCost.toLocaleString("en-IN")}</strong>
                                        </div>
                                    </div>

                                    {/* Green Savings Message */}
                                    <div
                                        style={{
                                            borderTop: "1px solid #f1f5f9",
                                            backgroundColor: "#f0fdf4",
                                            padding: "12px 24px",
                                            color: "#166534",
                                            fontSize: "13px",
                                            fontWeight: "700",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <i className="ri-price-tag-3-line" style={{ color: "#16a34a" }}></i>
                                        <span>You save ₹{savingsAmount.toLocaleString("en-IN")} on this rental order!</span>
                                    </div>

                                    {/* Bottom Continue bar inside Price details */}
                                    <div
                                        style={{
                                            padding: "16px 24px",
                                            borderTop: "1px solid #f1f5f9",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through" }}>
                                                ₹{(totalCost + savingsAmount).toLocaleString("en-IN")}
                                            </div>
                                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                                                ₹{totalCost.toLocaleString("en-IN")}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (activeStep === 2) setActiveStep(3);
                                                else if (activeStep === 3) handlePlaceOrder();
                                                else setActiveStep(2);
                                            }}
                                            style={{
                                                backgroundColor: "#2563eb",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "12px 26px",
                                                fontSize: "14px",
                                                fontWeight: "700",
                                                textTransform: "uppercase",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
                                            }}
                                        >
                                            {activeStep === 3 ? "Place Order" : "Continue"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Human-Designed Order Placed Confirmation Screen */
                    <div
                        style={{
                            maxWidth: "840px",
                            margin: "30px auto",
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
                            overflow: "hidden",
                        }}
                    >
                        {/* Top Header Banner */}
                        <div
                            style={{
                                padding: "36px 30px 28px",
                                textAlign: "center",
                                borderBottom: "1px solid #f1f5f9",
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <div
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    backgroundColor: "#ecfdf5",
                                    color: "#059669",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    border: "2px solid #10b981",
                                    fontSize: "28px",
                                }}
                            >
                                <i className="ri-check-line" style={{ color: "#10b981" }}></i>
                            </div>

                            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>
                                Order Placed Successfully!
                            </h1>
                            <p style={{ color: "#475569", fontSize: "14.5px", margin: "0 0 6px", lineHeight: "1.5" }}>
                                Thank you, <strong>{address.name}</strong>. Your rental booking has been received and confirmed.
                            </p>
                            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                                Confirmation details and handover updates have been sent to <strong>{address.email}</strong>.
                            </p>
                        </div>

                        {/* Order Reference Strip */}
                        <div
                            style={{
                                padding: "14px 28px",
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "13px", color: "#64748b" }}>Order Reference:</span>
                                <strong style={{ fontSize: "15px", color: "#2563eb", letterSpacing: "0.5px" }}>
                                    #{orderId}
                                </strong>
                                <span style={{ fontSize: "12px", backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                                    Pay on Delivery (Cash / UPI)
                                </span>
                            </div>

                            <div style={{ fontSize: "14px", color: "#0f172a" }}>
                                <span style={{ color: "#64748b" }}>Total Payable:</span>{" "}
                                <strong style={{ color: "#0f172a", fontSize: "16px" }}>₹{totalCost.toLocaleString("en-IN")}</strong>
                            </div>
                        </div>

                        {/* Google Maps Delivery & Pickup Hub Logistics View */}
                        <div style={{ padding: "24px 28px 12px" }}>
                            <GoogleMapsRouteViewer
                                pickupAddress={pickupLocation.address}
                                deliveryAddress={address.fullAddress}
                                pickupTitle={pickupLocation.name}
                                deliveryTitle="Customer Delivery Destination"
                                customerName={address.name}
                                customerPhone={`+91 ${address.phone}`}
                                deliveryBoyName="CH.N.V.S. Hithesh"
                                deliveryBoyPhone="+91 73963 48793"
                                deliveryBoyVehicle="EV Scooter (AP-37)"
                                deliveryBoyHub={pickupLocation.name}
                                deliveryBoyRating="4.9 ★ (180+ deliveries)"
                                showDeliveryBoy={true}
                                height="340px"
                                showCards={true}
                                defaultTab="route"
                            />
                        </div>

                        {/* Ordered Gadgets Summary */}
                        {confirmedItems.length > 0 && (
                            <div style={{ padding: "0 28px 20px" }}>
                                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "18px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "12px" }}>
                                        Gadgets Booked ({confirmedItems.length})
                                    </span>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {confirmedItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 14px",
                                                    backgroundColor: "#f8fafc",
                                                    borderRadius: "8px",
                                                    border: "1px solid #e2e8f0",
                                                    gap: "12px",
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "6px", backgroundColor: "#ffffff", padding: "2px", border: "1px solid #cbd5e1" }}
                                                    />
                                                    <div>
                                                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a" }}>
                                                            {item.name}
                                                        </div>
                                                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                            Tenure: {item.days} Days • ₹{item.dailyRate}/day
                                                        </div>
                                                    </div>
                                                </div>
                                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                                                    ₹{item.totalAmount.toLocaleString("en-IN")}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div
                            style={{
                                padding: "20px 28px",
                                backgroundColor: "#f8fafc",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    backgroundColor: "#ffffff",
                                    color: "#334155",
                                    border: "1px solid #cbd5e1",
                                    padding: "11px 22px",
                                    fontSize: "13.5px",
                                    fontWeight: "600",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate("/home")}
                            >
                                Continue Browsing Gadgets
                            </button>

                            <button
                                type="button"
                                style={{
                                    backgroundColor: "#2563eb",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "11px 24px",
                                    fontSize: "13.5px",
                                    fontWeight: "700",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                                }}
                                onClick={() => navigate("/orders")}
                            >
                                <span>Track in Orders Dashboard</span>
                                <i className="ri-arrow-right-line"></i>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Humanized E-Commerce Footer */}
            <footer className="products-footer">
                <div className="products-footer-logo">
                    E-Rent<span>Hub</span>
                </div>
                <p>Your trusted local platform for renting premium laptops, cameras, projectors, and sound systems in Eluru.</p>
                <div className="products-footer-links">
                    <Link to="/home">All Electronics</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/profile">Profile</Link>
                </div>
                <p className="products-copyright">© 2026 E-RentHub. All rights reserved. Powerpet, Eluru, Andhra Pradesh.</p>
            </footer>
        </div>
    );
}
