import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import { ALL_PRODUCTS } from "./Home";
import "./ProductDetail.css";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find the product by ID from our products list, admin equipment, or user-listed rentals
    const product = (() => {
        const standardProduct = ALL_PRODUCTS.find((p) => String(p.id) === String(id));
        if (standardProduct) return standardProduct;
        try {
            const adminEquipment = JSON.parse(localStorage.getItem("erenthub_equipment") || "[]");
            const foundAdminItem = adminEquipment.find((eq) => String(eq.id) === String(id));
            if (foundAdminItem) {
                return {
                    id: foundAdminItem.id,
                    name: foundAdminItem.name,
                    category: foundAdminItem.category,
                    image: foundAdminItem.image,
                    dailyPrice: Number(foundAdminItem.dailyRate) || 150,
                    monthlyPrice: (Number(foundAdminItem.dailyRate) || 150) * 25,
                    city: "Eluru",
                    place: "Eluru (Main Hub)",
                    deposit: Number(foundAdminItem.securityDeposit) || 1500,
                    specs: foundAdminItem.specs || "Verified device in excellent condition."
                };
            }
            const userRentals = JSON.parse(localStorage.getItem("erenthub_user_rentals") || "[]");
            const foundUserItem = userRentals.find((r) => String(r.id) === String(id));
            if (foundUserItem) {
                return {
                    id: foundUserItem.id,
                    name: foundUserItem.title,
                    category: foundUserItem.category,
                    image: foundUserItem.image,
                    dailyPrice: Number(foundUserItem.dailyRate) || 120,
                    monthlyPrice: (Number(foundUserItem.dailyRate) || 120) * 30,
                    city: foundUserItem.city || "Eluru",
                    place: `${foundUserItem.city || "Eluru"} (${foundUserItem.area || "Local Hub"})`,
                    deposit: Number(foundUserItem.securityDeposit) || 1000,
                    specs: foundUserItem.specs || "Verified device in excellent condition."
                };
            }
        } catch (e) { }
        return ALL_PRODUCTS[0];
    })();

    // State for rental duration in days (default: 7)
    const [days, setDays] = useState(7);

    // Toast notification state
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    // Cart state for navbar count and in-cart check
    const [cartCount, setCartCount] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("erenthub_cart") || "[]");
            return Array.isArray(saved) ? saved.length : 0;
        } catch (e) {
            return 0;
        }
    });

    const [isInCart, setIsInCart] = useState(() => {
        try {
            const currentCart = JSON.parse(localStorage.getItem("erenthub_cart") || "[]");
            return currentCart.some(
                (item) => String(item.id) === String(product.id) || (item.name.toLowerCase() === product.name.toLowerCase() && item.category === product.category)
            );
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        try {
            const deletedList = JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]").map((x) => String(x).toLowerCase().trim());
            if (deletedList.includes(String(id).toLowerCase().trim()) || (product && deletedList.includes(String(product.name).toLowerCase().trim()))) {
                alert("This equipment has been removed from the rental catalog.");
                navigate("/home", { replace: true });
                return;
            }

            const currentCart = JSON.parse(localStorage.getItem("erenthub_cart") || "[]");
            setIsInCart(
                currentCart.some(
                    (item) => String(item.id) === String(product.id) || (item.name.toLowerCase() === product.name.toLowerCase() && item.category === product.category)
                )
            );
            setCartCount(currentCart.length);
        } catch (e) { }
    }, [id, product, navigate]);

    // Increase rental days
    const handleIncrease = () => {
        setDays((prev) => prev + 1);
    };

    // Decrease rental days (minimum 1 day)
    const handleDecrease = () => {
        if (days > 1) {
            setDays((prev) => prev - 1);
        }
    };

    // Calculate base rental price, 18% GST charge, and total price
    const basePrice = product.dailyPrice * days;
    const gstCharge = Math.round(basePrice * 0.18);
    const totalPrice = basePrice + gstCharge;

    // Add to cart helper: prevent duplicate items of same specification
    const handleAddToCart = () => {
        try {
            const currentCart = JSON.parse(localStorage.getItem("erenthub_cart") || "[]");
            const isAlreadyInCart = currentCart.some(
                (item) => String(item.id) === String(product.id) || (item.name.toLowerCase() === product.name.toLowerCase() && item.category === product.category)
            );
            if (isAlreadyInCart) {
                showToast(`"${product.name.slice(0, 22)}..." is already in your Cart.`);
                return;
            }
            const updated = [
                ...currentCart,
                {
                    ...product,
                    cartItemId: Date.now(),
                    days: days,
                    basePrice: basePrice,
                    gstCharge: gstCharge,
                    totalPrice: totalPrice,
                },
            ];
            localStorage.setItem("erenthub_cart", JSON.stringify(updated));
            setCartCount(updated.length);
            setIsInCart(true);
            showToast(`Added "${product.name.slice(0, 22)}..." to Cart.`);
        } catch (error) {
            showToast("Added to Cart!");
        }
    };

    return (
        <div className="product-page-wrapper">
            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="erenthub-toast">
                    <i className="ri-check-line"></i>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Official Sticky Navbar with Home, My Orders, Sales Portal, Profile */}
            <header className="orders-navbar">
                <div className="orders-nav-container">
                    <Link to="/home" className="orders-brand-link">
                        <img src={logo} alt="E-RentHub Logo" className="orders-brand-logo" />
                        <span className="orders-brand-name">
                            E-<span>RentHub</span>
                        </span>
                    </Link>

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

                    <div className="orders-nav-right">
                        <button
                            type="button"
                            className="navbar-cart-btn"
                            onClick={() => navigate("/cart")}
                            title="View Cart"
                        >
                            <i className="ri-shopping-cart-2-fill"></i>
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="erenthub-counter-badge">{cartCount}</span>
                            )}
                        </button>
                        <ProfileDropdown />
                    </div>
                </div>
            </header>

            {/* Breadcrumb Navigation */}
            <div className="simple-breadcrumb">
                <button type="button" className="simple-back-btn" onClick={() => navigate("/home")}>
                    ← Back to Catalog
                </button>
                <span className="breadcrumb-divider">/</span>
                <span>{product.category}</span>
                <span className="breadcrumb-divider">/</span>
                <strong>{product.name}</strong>
            </div>

            {/* Main Product Card: TOP Image, DOWN Details */}
            <div className="simple-product-card vertical-layout">
                {/* TOP: Product Image Showcase */}
                <div className="simple-product-image-box">
                    {product.badge && (
                        <span className="product-card-top-badge">{product.badge}</span>
                    )}
                    <img src={product.image} alt={product.name} />
                </div>

                {/* DOWN: Product Details */}
                <div className="simple-product-info">
                    {/* Meta Tags (NO OWNER NAME) */}
                    <div className="simple-meta-row">
                        <span className="simple-product-tag">{product.category}</span>
                        <span className="simple-city-badge"><i className="ri-map-pin-line"></i> {product.city || "Eluru"}</span>
                        <span className="simple-verified-tag"><i className="ri-shield-check-line"></i> Verified Rental Device</span>
                    </div>

                    <h1 className="simple-product-heading">{product.name}</h1>

                    {/* Price banner */}
                    <div className="simple-product-price-box">
                        <span className="simple-price-val">₹{product.dailyPrice}</span>
                        <span className="simple-price-unit">/ day</span>
                        <span className="simple-monthly-hint">
                            (Monthly: ₹{(product.monthlyPrice || product.dailyPrice * 25).toLocaleString("en-IN")})
                        </span>
                    </div>

                    <p className="simple-product-description">{product.description}</p>

                    {/* Specifications Table (NO OWNER NAME) */}
                    <div className="simple-specs-box">
                        <h3>Product Specifications</h3>
                        <table className="simple-specs-table">
                            <tbody>
                                <tr>
                                    <td><strong>Category:</strong></td>
                                    <td>{product.category}</td>
                                </tr>
                                <tr>
                                    <td><strong>Processor / Spec:</strong></td>
                                    <td>{product.cpu}</td>
                                </tr>
                                <tr>
                                    <td><strong>RAM / Memory:</strong></td>
                                    <td>{product.ram}</td>
                                </tr>
                                <tr>
                                    <td><strong>Storage:</strong></td>
                                    <td>{product.storage}</td>
                                </tr>
                                <tr>
                                    <td><strong>Delivery Time:</strong></td>
                                    <td>{product.delivery}</td>
                                </tr>
                                <tr>
                                    <td><strong>Pickup / Delivery Hub:</strong></td>
                                    <td>{product.place || "Eluru (Local Hub)"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Rental Duration Stepper */}
                    <div className="simple-duration-box">
                        <label>Rental Duration:</label>
                        <div className="simple-counter">
                            <button type="button" onClick={handleDecrease} title="Decrease days">-</button>
                            <span>{days} {days === 1 ? "Day" : "Days"}</span>
                            <button type="button" onClick={handleIncrease} title="Increase days">+</button>
                        </div>
                    </div>

                    {/* Total Amount & Charge Breakdown */}
                    <div className="simple-total-box">
                        <div className="charge-row">
                            <span>Base Rent ({days} days × ₹{product.dailyPrice}):</span>
                            <strong>₹{basePrice.toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="charge-row tax-charge">
                            <span>GST / Tax Charge (18%):</span>
                            <strong>+₹{gstCharge.toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="charge-row total-charge">
                            <span>Total Payable:</span>
                            <span className="total-highlight">₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    {/* COD Assurance */}
                    <div className="simple-cod-assurance">
                        <i className="ri-check-line"></i> Cash on Delivery Available (Local to Local Delivery • ₹0 advance required)
                    </div>

                    {/* Action Buttons: ONLY Add to Cart, NO Book Now */}
                    <div className="simple-actions-box">
                        <button
                            type="button"
                            className={`btn-add-cart ${isInCart ? "item-in-cart" : ""}`}
                            onClick={handleAddToCart}
                        >
                            <i className={isInCart ? "ri-check-line" : "ri-shopping-cart-2-fill"} style={{ marginRight: "6px" }}></i>
                            <span>{isInCart ? "In Cart" : "Add to Cart"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="simple-footer">
                <p>© 2026 E-RentHub. All rights reserved.</p>
                <div className="simple-footer-links">
                    <Link to="/home">Home</Link> | <Link to="/orders">My Orders</Link> | <Link to="/cart">Cart</Link> | <Link to="/terms">Terms</Link> | <Link to="/privacy">Privacy</Link>
                </div>
            </footer>
        </div>
    );
}
