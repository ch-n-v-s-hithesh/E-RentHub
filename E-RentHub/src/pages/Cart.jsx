import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import "./Cart.css";

const DEFAULT_CART_ITEMS = [
    {
        cartItemId: 101,
        id: 1,
        name: "Epson 4K Ultra HD Home Cinema Projector",
        category: "Projectors",
        dailyPrice: 189,
        monthlyPrice: 5670,
        days: 3,
        delivery: "Doorstep Delivery by E-RentHub Partner • FREE",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    },
    {
        cartItemId: 102,
        id: 3,
        name: "Canon EOS 200D II DSLR Camera (18-55mm Lens Kit)",
        category: "Cameras",
        dailyPrice: 149,
        monthlyPrice: 4470,
        days: 2,
        delivery: "Doorstep Delivery by E-RentHub Partner • FREE",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
    },
];

export default function Cart() {
    const navigate = useNavigate();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_cart");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const deletedList = new Set(
                        JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]").map(x => String(x).toLowerCase().trim())
                    );
                    const seen = new Set();
                    const deduplicated = [];
                    for (const item of parsed) {
                        const key = String(item.id || item.name);
                        const idLower = String(item.id || "").toLowerCase().trim();
                        const nameLower = String(item.name || "").toLowerCase().trim();
                        if (deletedList.has(idLower) || deletedList.has(nameLower)) {
                            continue;
                        }
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

    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    useEffect(() => {
        try {
            localStorage.setItem("erenthub_cart", JSON.stringify(cart));
        } catch (e) { }
    }, [cart]);

    const handleUpdateDays = (cartItemId, newDays) => {
        if (newDays < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item.cartItemId === cartItemId ? { ...item, days: newDays } : item
            )
        );
    };

    const handleRemove = (cartItemId) => {
        setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
        showToast("Device removed from rental bag.");
    };

    const baseCost = cart.reduce((sum, item) => sum + item.dailyPrice * (item.days || 1), 0);
    const gstCharge = Math.round(baseCost * 0.18);
    const totalCost = baseCost + gstCharge;

    return (
        <div className="erenthub-home">
            {/* Floating Toast */}
            {toastMessage && (
                <div className="erenthub-toast">
                    <i className="ri-check-line"></i>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Navbar (Logo on left of name, Add to Cart & Profile on right) */}
            <header className="products-navbar">
                <div className="navbar-brand-left">
                    <Link
                        to="/home"
                        className="products-logo"
                        title="E-RentHub Home"
                    >
                        <img src={logo} alt="E-RentHub Logo" className="navbar-logo-img" />
                        <span className="products-logo-text">
                            E-Rent<span>Hub</span>
                        </span>
                    </Link>
                </div>

                <nav className="orders-nav-links">
                    <Link to="/home" className="orders-nav-link">
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

                <div className="navbar-actions-right">
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

                    {/* Flipkart Style Profile Dropdown */}
                    <ProfileDropdown />
                </div>
            </header>

            {/* Main Cart Section (Reduced left/right padding) */}
            <main style={{ padding: "28px 3% 60px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
                {/* Back and Page Title Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate("/home")}
                            className="erenthub-btn-quickview"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", marginBottom: "8px" }}
                        >
                            ← Continue Shopping
                        </button>
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                            Your Rental Bag ({cart.length} {cart.length === 1 ? "device" : "devices"})
                        </h1>
                    </div>

                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setCart([]);
                                showToast("Rental bag cleared.");
                            }}
                            style={{ background: "none", border: "none", color: "#ef4444", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
                        >
                            Clear Entire Bag
                        </button>
                    )}
                </div>

                {cart.length > 0 ? (
                    /* Flexbox Two-Column Layout (NO GRID) */
                    <div style={{ display: "flex", gap: "28px", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {/* Left Column: Cart Items List */}
                        <div style={{ flex: "1 1 650px", minWidth: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            {cart.map((item, index) => {
                                const days = item.days || 1;
                                const itemTotal = item.dailyPrice * days;

                                return (
                                    <div
                                        key={item.cartItemId || index}
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "14px",
                                            padding: "20px",
                                            display: "flex",
                                            gap: "20px",
                                            alignItems: "center",
                                            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                width: "90px",
                                                height: "90px",
                                                objectFit: "contain",
                                                borderRadius: "10px",
                                                background: "#f8fafc",
                                                padding: "6px",
                                                border: "1px solid #e2e8f0",
                                            }}
                                        />

                                        <div style={{ flex: "1 1 240px", minWidth: "200px" }}>
                                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#2563eb", textTransform: "uppercase" }}>
                                                {item.category}
                                            </span>
                                            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "3px 0 6px" }}>
                                                {item.name}
                                            </h3>
                                            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                                                Daily Rate: <strong style={{ color: "#2563eb" }}>₹{item.dailyPrice}</strong> / day
                                            </div>
                                            <span style={{ fontSize: "11px", color: "#059669", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <i className="ri-truck-line"></i> {item.delivery || "Doorstep Delivery by E-RentHub Partner • FREE"}
                                            </span>
                                        </div>

                                        {/* Day Counter */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Duration</span>
                                            <div className="erenthub-day-counter">
                                                <button
                                                    type="button"
                                                    className="erenthub-day-counter-btn"
                                                    onClick={() => handleUpdateDays(item.cartItemId, days - 1)}
                                                >
                                                    -
                                                </button>
                                                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", minWidth: "50px", textAlign: "center" }}>
                                                    {days} {days === 1 ? "Day" : "Days"}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="erenthub-day-counter-btn"
                                                    onClick={() => handleUpdateDays(item.cartItemId, days + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total Price and Remove */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", minWidth: "100px" }}>
                                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                                                ₹{itemTotal}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.cartItemId)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#ef4444",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <i className="ri-delete-bin-line"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Column: Order Summary Card */}
                        <div style={{ flex: "1 1 360px", minWidth: "280px" }}>
                            <div
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "14px",
                                    padding: "24px",
                                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
                                }}
                            >
                                <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px" }}>
                                    Rental Order Summary
                                </h2>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Total Devices:</span>
                                        <strong style={{ color: "#0f172a" }}>{cart.length}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Base Rental Total:</span>
                                        <strong style={{ color: "#0f172a" }}>₹{baseCost.toLocaleString("en-IN")}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>GST / Tax Charge (18%):</span>
                                        <strong style={{ color: "#2563eb" }}>+₹{gstCharge.toLocaleString("en-IN")}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Security Deposit:</span>
                                        <span style={{ color: "#059669", fontWeight: "700" }}>₹0 (KYC Waived)</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Doorstep Delivery:</span>
                                        <span style={{ color: "#059669", fontWeight: "700" }}>FREE</span>
                                    </div>

                                    <div
                                        style={{
                                            borderTop: "2px dashed #e2e8f0",
                                            marginTop: "8px",
                                            paddingTop: "14px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", display: "block" }}>
                                                Total Amount:
                                            </span>
                                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                                                (Includes 18% GST Charge)
                                            </span>
                                        </div>
                                        <strong style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb" }}>
                                            ₹{totalCost.toLocaleString("en-IN")}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="erenthub-btn-addcart"
                                    style={{ width: "100%", padding: "14px", fontSize: "14px", marginTop: "20px" }}
                                    onClick={() => navigate("/checkout")}
                                >
                                    Proceed to Checkout
                                </button>

                                <div style={{ marginTop: "14px", textAlign: "center" }}>
                                    <span style={{ fontSize: "11px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <i className="ri-shield-check-line"></i> Verified Rental • Doorstep Inspection & Handover Verification
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Empty Bag State */
                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px dashed #cbd5e1",
                            borderRadius: "14px",
                            padding: "60px 20px",
                            textAlign: "center",
                        }}
                    >
                        <i className="ri-shopping-bag-line" style={{ fontSize: "52px", color: "#94a3b8", display: "block", marginBottom: "12px" }}></i>
                        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                            Your Rental Bag is Empty
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
                            Explore our premium laptops, cameras, projectors, and sound boxes to start renting.
                        </p>
                        <button
                            type="button"
                            className="erenthub-btn-addcart"
                            style={{ padding: "12px 24px", fontSize: "13px" }}
                            onClick={() => navigate("/home")}
                        >
                            Explore Electronics Collection
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="products-footer">
                <div className="products-footer-logo">
                    E-Rent<span>Hub</span>
                </div>
                <p>Your trusted platform for renting premium laptops, cameras, projectors, and sound boxes.</p>
                <div className="products-footer-links">
                    <a href="/home" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>All Electronics</a>
                    <a href="/cart" onClick={(e) => { e.preventDefault(); navigate("/cart"); }}>Cart</a>
                    <a href="/admin" onClick={(e) => { e.preventDefault(); navigate("/admin"); }}>Admin</a>
                </div>
                <p className="products-copyright">© 2026 E-RentHub. All rights reserved.</p>
            </footer>
        </div>
    );
}
