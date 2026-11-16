import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDropdown.css";

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const userRole = localStorage.getItem("erenthub_user_role") || "customer";
    const profile = (() => {
        try {
            return JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
        } catch (e) {
            return {};
        }
    })();

    const displayName = profile.name ? profile.name.split(" ")[0] : (userRole === "admin" ? "Admin" : (userRole === "delivery" ? "Courier" : "Customer"));

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleItemClick = (action) => {
        setIsOpen(false);
        if (action === "home") {
            navigate("/home");
        } else if (action === "profile") {
            navigate("/profile");
        } else if (action === "orders") {
            navigate("/orders");
        } else if (action === "cart") {
            navigate("/cart");
        } else if (action === "admin") {
            navigate("/admin");
        } else if (action === "sales") {
            navigate("/sales");
        } else if (action === "delivery") {
            navigate("/delivery");
        } else if (action === "logout") {
            localStorage.removeItem("erenthub_token");
            localStorage.removeItem("erenthub_user_role");
            localStorage.removeItem("erenthub_user_profile");
            navigate("/");
        }
    };

    return (
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className="profile-trigger-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <i className="ri-user-3-line profile-user-icon"></i>
                <span className="profile-user-name">{displayName}</span>
                <i className={`ri-arrow-${isOpen ? "up" : "down"}-s-line profile-caret-icon`}></i>
            </button>

            {isOpen && (
                <div className="flipkart-dropdown-menu">
                    <div className="dropdown-header-title">
                        {userRole === "admin" ? "Administrator Account" : (userRole === "delivery" ? "Delivery Partner Account" : "Customer Account")}
                    </div>

                    <ul className="dropdown-items-list">
                        {/* CUSTOMER VIEWS: Home, My Profile, Orders, Cart, Sales Portal */}
                        {(userRole === "customer" || userRole === "admin") && (
                            <>
                                <li onClick={() => handleItemClick("home")}>
                                    <i className="ri-home-4-line"></i>
                                    <span>Home Store</span>
                                </li>

                                <li onClick={() => handleItemClick("profile")}>
                                    <i className="ri-user-line"></i>
                                    <span>My Profile</span>
                                </li>

                                <li onClick={() => handleItemClick("orders")}>
                                    <i className="ri-inbox-archive-line"></i>
                                    <span>Orders</span>
                                </li>

                                <li onClick={() => handleItemClick("cart")}>
                                    <i className="ri-shopping-cart-2-line"></i>
                                    <span>Cart</span>
                                </li>

                                <li onClick={() => handleItemClick("sales")}>
                                    <i className="ri-store-2-line" style={{ color: "#16a34a" }}></i>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <span style={{ fontWeight: 600, color: "#15803d" }}>Sales Portal (Put Items on Rent)</span>
                                        <span style={{ fontSize: "11px", color: "#64748b" }}>Upload & Manage Your Rentals</span>
                                    </div>
                                </li>
                            </>
                        )}

                        {/* DELIVERY VIEW: Delivery Partner Desk ONLY */}
                        {userRole === "delivery" && (
                            <li onClick={() => handleItemClick("delivery")}>
                                <i className="ri-truck-line" style={{ color: "#0284c7" }}></i>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span style={{ fontWeight: 600, color: "#0284c7" }}>Delivery Partner Desk</span>
                                    <span style={{ fontSize: "11px", color: "#64748b" }}>Order Pickups & Tracking</span>
                                </div>
                            </li>
                        )}

                        {/* ADMIN VIEW: Admin Dashboard */}
                        {userRole === "admin" && (
                            <li onClick={() => handleItemClick("admin")}>
                                <i className="ri-shield-user-line" style={{ color: "#2563eb" }}></i>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <span style={{ fontWeight: 600, color: "#2563eb" }}>Admin Dashboard</span>
                                    <span style={{ fontSize: "11px", color: "#64748b" }}>Platform Management & Reports</span>
                                </div>
                            </li>
                        )}

                        <li className="dropdown-logout-item" onClick={() => handleItemClick("logout")}>
                            <i className="ri-logout-box-r-line"></i>
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>
            )}

            {showProfileModal && (
                <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="profile-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h3>
                                <i className="ri-user-line" style={{ color: "#2563eb" }}></i>
                                Profile Details
                            </h3>
                            <button
                                type="button"
                                className="profile-modal-close"
                                onClick={() => setShowProfileModal(false)}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="profile-modal-body">
                            <div className="profile-summary-header">
                                <div className="profile-avatar-circle">
                                    {displayName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4>{profile.name || "E-RentHub User"}</h4>
                                    <span className="profile-tier-badge">{userRole.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <label>Email Address</label>
                                    <span>{profile.email || "user@gmail.com"}</span>
                                </div>
                                <div className="profile-info-item">
                                    <label>Role</label>
                                    <span style={{ textTransform: "capitalize" }}>{userRole}</span>
                                </div>
                                <div className="profile-info-item">
                                    <label>City & Hub</label>
                                    <span>Eluru, Andhra Pradesh</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-modal-footer">
                            <button
                                type="button"
                                className="profile-btn-close"
                                onClick={() => setShowProfileModal(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
