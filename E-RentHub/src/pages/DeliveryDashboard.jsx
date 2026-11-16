import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import GoogleMapsRouteViewer from "../components/GoogleMapsRouteViewer";
import "./DeliveryDashboard.css";

const INITIAL_DELIVERIES = [];

export default function DeliveryDashboard() {
    const navigate = useNavigate();
    const deliveryProfile = (() => {
        try {
            return JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
        } catch (e) {
            return {};
        }
    })();
    const deliveryName = deliveryProfile.name || "CH.N.V.S. Hithesh (Delivery Partner)";
    const deliveryEmail = deliveryProfile.email || "ch.n.v.s.hithesh@gmail.com";
    const deliveryVehicle = deliveryProfile.assignedVehicle || "EV Scooter (AP-37)";
    const deliveryHub = deliveryProfile.hub || "Powerpet Hub, Eluru";

    const [isOnDuty, setIsOnDuty] = useState(true);
    const [activeTab, setActiveTab] = useState("active"); // 'active', 'completed'
    const [toastMessage, setToastMessage] = useState("");
    const [openMapOrderId, setOpenMapOrderId] = useState(null);

    // Deliveries List starting fresh from first real order
    const [deliveries, setDeliveries] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("erenthub_delivery_orders") || "[]");
            if (Array.isArray(saved) && saved.length > 0) {
                const legacyMockIds = new Set(["ERH-9402", "ERH-8150", "#ERH-9402", "#ERH-8150"]);
                return saved.filter((d) => !legacyMockIds.has(d.id));
            }
        } catch (e) { }
        return [];
    });

    // Auto-sync newly placed orders into the Delivery Queue
    useEffect(() => {
        try {
            const orders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            if (Array.isArray(orders) && orders.length > 0) {
                setDeliveries((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const newFromOrders = orders
                        .filter((o) => !existingIds.has(o.id) && o.status !== "Cancelled")
                        .map((o) => ({
                            id: o.id,
                            name: o.name || (o.items && o.items[0]?.name) || "Rental Equipment",
                            image: o.image || (o.items && o.items[0]?.image) || "",
                            category: o.category || "Electronics",
                            days: o.days || o.durationDays || 3,
                            totalAmount: o.totalAmount || o.total || 496,
                            pickupHub: o.pickupHub || "Central Logistics Hub (Powerpet)",
                            pickupAddress: o.pickupAddress || "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
                            pickupCoords: o.pickupCoords || { lat: 16.7145, lng: 81.1020 },
                            customerName: o.customerName || o.customer || "Balu Hithesh",
                            customerPhone: o.customerPhone || "+91 98480 12345",
                            customerEmail: o.customerEmail || "balue.hithesh@gmail.com",
                            deliveryAddress: o.deliveryAddress || "Powerpet Main Road, Eluru - 534002",
                            deliveryCoords: o.deliveryCoords || { lat: 16.7107, lng: 81.0952 },
                            status: o.trackingStage >= 4 ? "Delivered & Cash Collected" : (o.trackingStage >= 3 ? "Out for Local Delivery" : "Ready for Pickup"),
                            assignedAt: o.bookingDate || "Today",
                            trackingStage: o.trackingStage || 1,
                        }));

                    if (newFromOrders.length > 0) {
                        const merged = [...newFromOrders, ...prev];
                        localStorage.setItem("erenthub_delivery_orders", JSON.stringify(merged));
                        return merged;
                    }
                    return prev;
                });
            }
        } catch (e) { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("erenthub_delivery_orders", JSON.stringify(deliveries));
        } catch (e) { }
    }, [deliveries]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3200);
    };

    const handleCopyAddress = (addr) => {
        if (!addr) return;
        navigator.clipboard.writeText(addr);
        showToast("Address copied! Paste into Google Maps or your navigation app.");
    };

    // 1. Delivery Guy accepts order
    const handleAcceptOrder = (order) => {
        const nextStatus = "Order Accepted • Heading to Pickup";
        const nextStage = 2;
        const note = "Delivery partner accepted order. Heading to pickup hub.";

        setDeliveries((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus, trackingStage: nextStage, statusNote: note } : item))
        );

        try {
            fetch(`http://localhost:5000/api/orders/${order.id.replace("#", "")}/accept-order`, { method: "POST" }).catch(() => {});
            const customerOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const updated = customerOrders.map((o) =>
                o.id === order.id ? { ...o, trackingStage: nextStage, status: nextStatus, statusNote: note } : o
            );
            localStorage.setItem("erenthub_orders", JSON.stringify(updated));
        } catch (e) { }

        showToast(`Order #${order.id} accepted! Heading to pickup hub.`);
    };

    // 2. Delivery Guy reached pickup location
    const handleReachedPickup = (order) => {
        const nextStatus = "Reached Pickup Location";
        const nextStage = 3;
        const note = "Delivery partner reached pickup location. Inspecting gadget with partner.";

        setDeliveries((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus, trackingStage: nextStage, statusNote: note } : item))
        );

        try {
            fetch(`http://localhost:5000/api/orders/${order.id.replace("#", "")}/reached-pickup`, { method: "POST" }).catch(() => {});
            const customerOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const updated = customerOrders.map((o) =>
                o.id === order.id ? { ...o, trackingStage: nextStage, status: nextStatus, statusNote: note } : o
            );
            localStorage.setItem("erenthub_orders", JSON.stringify(updated));
        } catch (e) { }

        showToast(`Reached pickup location! Inspecting equipment.`);
    };

    // 3. Confirm pickup & start delivery
    const handleConfirmDepositPickup = (order) => {
        const nextStatus = "Out for Local Delivery";
        const nextStage = 4;
        const note = "Gadget picked up. Delivery partner en route to customer doorstep.";

        setDeliveries((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus, trackingStage: nextStage, statusNote: note } : item))
        );

        try {
            fetch(`http://localhost:5000/api/orders/${order.id.replace("#", "")}/confirm-pickup`, { method: "POST" }).catch(() => {});
            const customerOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const updated = customerOrders.map((o) =>
                o.id === order.id ? { ...o, trackingStage: nextStage, status: nextStatus, statusNote: note, canCancel: false } : o
            );
            localStorage.setItem("erenthub_orders", JSON.stringify(updated));
        } catch (e) { }

        showToast(`Gadget picked up! Out for doorstep delivery.`);
    };

    // 4. Delivery Guy reached customer location
    const handleReachedCustomer = (order) => {
        const nextStatus = "Reached Customer Location";
        const nextStage = 5;
        const note = "Delivery partner arrived at your doorstep. Ready for inspection & handover.";

        setDeliveries((prev) =>
            prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus, trackingStage: nextStage, statusNote: note } : item))
        );

        try {
            fetch(`http://localhost:5000/api/orders/${order.id.replace("#", "")}/reached-customer`, { method: "POST" }).catch(() => {});
            const customerOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const updated = customerOrders.map((o) =>
                o.id === order.id ? { ...o, trackingStage: nextStage, status: nextStatus, statusNote: note } : o
            );
            localStorage.setItem("erenthub_orders", JSON.stringify(updated));
        } catch (e) { }

        showToast(`Arrived at customer doorstep! Inspecting gadget.`);
    };

    // 5. Direct handover & delivery confirmation (No OTP required)
    const handleConfirmDelivery = (order) => {
        const completedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const nextStatus = "Delivered & Cash Collected";
        const nextStage = 6;
        const note = "Delivered to customer. Active Rental.";

        setDeliveries((prev) =>
            prev.map((item) => {
                if (item.id === order.id) {
                    return {
                        ...item,
                        status: nextStatus,
                        trackingStage: nextStage,
                        statusNote: note,
                        completedAt: completedTime,
                    };
                }
                return item;
            })
        );

        try {
            fetch(`http://localhost:5000/api/orders/${order.id.replace("#", "")}/confirm-delivery`, { method: "POST" }).catch(() => {});
            const customerOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const updated = customerOrders.map((o) =>
                o.id === order.id
                    ? { ...o, status: "Active", trackingStage: nextStage, statusNote: note, canCancel: false }
                    : o
            );
            localStorage.setItem("erenthub_orders", JSON.stringify(updated));
        } catch (e) { }

        showToast(`Handover confirmed! Order #${order.id} is now an active rental.`);
    };

    const handlePickupReturn = (orderId) => {
        setDeliveries((prev) =>
            prev.map((item) => (item.id === orderId ? { ...item, status: "Returned & Closed", trackingStage: 4 } : item))
        );

        try {
            fetch(`http://localhost:5000/api/orders/${orderId.replace("#", "")}/return`, { method: "POST" }).catch(() => {});
            const customerOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            const updated = customerOrders.map((o) =>
                o.id === orderId
                    ? { ...o, status: "Returned", trackingStage: 4, statusNote: "Returned to store. Full deposit refund processed." }
                    : o
            );
            localStorage.setItem("erenthub_orders", JSON.stringify(updated));
        } catch (e) { }

        showToast(`Return picked up and completed for Order #${orderId}. Gadget returned to store.`);
    };

    const handleLogout = () => {
        localStorage.removeItem("erenthub_user");
        localStorage.removeItem("erenthub_token");
        navigate("/");
    };

    const activeOrders = deliveries.filter((d) => d.status !== "Delivered & Cash Collected");
    const completedOrders = deliveries.filter((d) => d.status === "Delivered & Cash Collected");
    const displayedOrders = activeTab === "active" ? activeOrders : completedOrders;

    const totalCashCollected = completedOrders.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    return (
        <div className="dp-app">
            {/* Main Delivery Partner Workspace without global header/footer */}
            <main className="dp-main" style={{ paddingTop: "20px" }}>
                {/* Driver Profile & Operational Status */}
                <section className="dp-agent-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img src={logo} alt="E-RentHub" style={{ height: "28px", width: "auto" }} />
                            <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>E-Rent<span style={{ color: "#2563eb" }}>Hub</span></span>
                            <span className="dp-desk-badge" style={{ marginLeft: "4px" }}>Delivery Partner</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span className="dp-hub-tag">
                                <i className="ri-building-2-line"></i> {deliveryHub}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                                <i className="ri-logout-box-r-line"></i>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    <div className="dp-agent-info">
                        <div className="dp-agent-avatar">
                            <i className="ri-user-star-line"></i>
                        </div>
                        <div className="dp-agent-text">
                            <h2 className="dp-agent-name">{deliveryName}</h2>
                            <span className="dp-agent-id">{deliveryEmail}</span>
                            <div className="dp-agent-badges">
                                <span className="dp-badge verified">
                                    <i className="ri-shield-check-line"></i> Verified Field Executive
                                </span>
                                <span className="dp-badge vehicle">
                                    <i className="ri-e-bike-2-line"></i> {deliveryVehicle}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="dp-duty-switch-box">
                        <div className="dp-duty-label-col">
                            <span className="dp-duty-title">Live Dispatch Status</span>
                            <span className="dp-duty-sub">
                                {isOnDuty ? "Receiving orders in Powerpet & Central Eluru" : "Dispatches paused"}
                            </span>
                        </div>
                        <button
                            type="button"
                            className={`dp-toggle-duty ${isOnDuty ? "is-active" : ""}`}
                            onClick={() => {
                                setIsOnDuty(!isOnDuty);
                                showToast(isOnDuty ? "You are now Off Duty" : "You are now On Duty for dispatches");
                            }}
                        >
                            <span>{isOnDuty ? "Active" : "Paused"}</span>
                        </button>
                    </div>
                </section>

                {/* Operations & Earnings Overview */}
                <section className="dp-metrics-strip">
                    <div className="dp-metric-tile">
                        <span className="dp-metric-label">Active Orders</span>
                        <span className="dp-metric-val">{activeOrders.length}</span>
                        <span className="dp-metric-hint">Awaiting delivery</span>
                    </div>

                    <div className="dp-metric-tile">
                        <span className="dp-metric-label">Completed Today</span>
                        <span className="dp-metric-val success">{completedOrders.length}</span>
                        <span className="dp-metric-hint">100% on-time fulfillment</span>
                    </div>

                    <div className="dp-metric-tile">
                        <span className="dp-metric-label">Cash Collected</span>
                        <span className="dp-metric-val price">₹{totalCashCollected.toLocaleString("en-IN")}</span>
                        <span className="dp-metric-hint">Direct Cash / UPI Handover</span>
                    </div>

                    <div className="dp-metric-tile">
                        <span className="dp-metric-label">Vehicle Assigned</span>
                        <span className="dp-metric-val vehicle">EV Scooter</span>
                        <span className="dp-metric-hint">AP-37 • Range 42 km</span>
                    </div>
                </section>

                {/* Queue Tabs */}
                <div className="dp-queue-header">
                    <div className="dp-segmented-tabs">
                        <button
                            type="button"
                            className={`dp-tab ${activeTab === "active" ? "active" : ""}`}
                            onClick={() => setActiveTab("active")}
                        >
                            <span>Active Orders</span>
                            <span className="dp-tab-count">{activeOrders.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`dp-tab ${activeTab === "completed" ? "active" : ""}`}
                            onClick={() => setActiveTab("completed")}
                        >
                            <span>Completed</span>
                            <span className="dp-tab-count">{completedOrders.length}</span>
                        </button>
                    </div>
                </div>

                {/* Orders Queue */}
                <div className="dp-orders-stack">
                    {displayedOrders.length === 0 ? (
                        <div className="dp-empty-box">
                            <i className="ri-checkbox-circle-line dp-empty-icon"></i>
                            <h3>All clear for now</h3>
                            <p>No orders in this queue. New dispatches from the store hub will arrive here automatically.</p>
                            {activeTab === "active" && completedOrders.length > 0 && (
                                <button
                                    type="button"
                                    className="dp-btn-text"
                                    onClick={() => setActiveTab("completed")}
                                >
                                    View {completedOrders.length} completed deliveries
                                </button>
                            )}
                        </div>
                    ) : (
                        displayedOrders.map((order) => {
                            const isDone = order.trackingStage >= 6 || order.status === "Delivered & Cash Collected" || order.status === "Delivered & Active Rental" || order.status === "Completed";
                            const stage = Number(order.trackingStage || 1);

                            const getStatusBadge = () => {
                                if (isDone) return { text: "Delivered", cls: "done" };
                                if (stage === 5) return { text: "At Customer Doorstep", cls: "transit" };
                                if (stage === 4) return { text: "Out for Delivery", cls: "transit" };
                                if (stage === 3) return { text: "At Pickup Hub", cls: "transit" };
                                if (stage === 2) return { text: "Heading to Hub", cls: "ready" };
                                return { text: "Assigned • Accept Order", cls: "ready" };
                            };
                            const badge = getStatusBadge();

                            return (
                                <div key={order.id} className={`dp-order-card ${isDone ? "is-done" : ""}`}>
                                    {/* Order Meta Header */}
                                    <div className="dp-card-top">
                                        <div className="dp-card-ref-group">
                                            <span className="dp-order-ref">#{order.id}</span>
                                            <span className="dp-order-category">{order.category}</span>
                                            <span className="dp-order-time">{order.assignedAt || "Assigned today"}</span>
                                        </div>

                                        <span className={`dp-status-tag ${badge.cls}`}>
                                            {badge.text}
                                        </span>
                                    </div>

                                    {/* Order Content */}
                                    <div className="dp-card-content">
                                        <div className="dp-thumb-wrap">
                                            <img src={order.image} alt={order.name} className="dp-thumb" />
                                        </div>

                                        <div className="dp-item-details">
                                            <h3 className="dp-item-name">{order.name}</h3>
                                            <div className="dp-item-meta">
                                                <span>Rental: <strong>{order.days} Days</strong></span>
                                                <span className="dp-sep">•</span>
                                                <span>From: <strong>{order.pickupHub}</strong></span>
                                            </div>

                                            <div className="dp-cod-pill">
                                                <span>Collect Cash:</span>
                                                <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                                                <span className="dp-cod-hint">(COD)</span>
                                            </div>
                                        </div>

                                        {/* Logistics Grid: Pickup Location & Delivery Destination */}
                                        <div style={{ flex: "2 1 340px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {/* Box 1: Equipment Pickup Location */}
                                            <div
                                                style={{
                                                    backgroundColor: "#fffbeb",
                                                    border: "1px solid #fef3c7",
                                                    borderRadius: "8px",
                                                    padding: "10px 14px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "4px",
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                                                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                        <i className="ri-store-2-fill"></i> Step 1: Equipment Pickup
                                                    </span>
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.pickupAddress || "Shop #4, Powerpet Main Road, Eluru - 534002")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: "11px", fontWeight: "700", color: "#b45309", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                                                    >
                                                        <i className="ri-navigation-fill"></i> Navigate to Pickup
                                                    </a>
                                                </div>

                                                <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                                                    {order.pickupHub || "Central Logistics Hub (Powerpet)"}
                                                </strong>
                                                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                                                    <i className="ri-map-pin-2-line" style={{ color: "#d97706", marginRight: "3px" }}></i>
                                                    {order.pickupAddress || "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002"}
                                                </div>
                                            </div>

                                            {/* Box 2: Deliver Item To Customer */}
                                            <div className="dp-destination-box">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                                                    <div className="dp-dest-title" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#1e40af" }}>
                                                        <i className="ri-truck-line"></i> Step 2: Deliver To Customer
                                                    </div>
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                                                    >
                                                        <i className="ri-navigation-fill"></i> Navigate to Customer
                                                    </a>
                                                </div>

                                                <div className="dp-dest-name">{order.customerName}</div>
                                                <div className="dp-dest-address">
                                                    <i className="ri-map-pin-user-fill" style={{ color: "#2563eb" }}></i>
                                                    <span>{order.deliveryAddress}</span>
                                                </div>

                                                {/* Map and Communication Actions */}
                                                <div style={{ display: "flex", gap: "8px", margin: "6px 0 0", flexWrap: "wrap", alignItems: "center" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenMapOrderId(openMapOrderId === order.id ? null : order.id)}
                                                        style={{
                                                            backgroundColor: openMapOrderId === order.id ? "#2563eb" : "#eff6ff",
                                                            border: "1px solid #bfdbfe",
                                                            color: openMapOrderId === order.id ? "#ffffff" : "#1d4ed8",
                                                            padding: "5px 12px",
                                                            borderRadius: "5px",
                                                            fontSize: "11.5px",
                                                            fontWeight: "700",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "5px",
                                                        }}
                                                    >
                                                        <i className="ri-map-2-line"></i>
                                                        <span>{openMapOrderId === order.id ? "Hide Google Map" : "View on Google Maps"}</span>
                                                    </button>

                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            backgroundColor: "#f8fafc",
                                                            border: "1px solid #cbd5e1",
                                                            color: "#334155",
                                                            padding: "5px 10px",
                                                            borderRadius: "5px",
                                                            fontSize: "11.5px",
                                                            fontWeight: "600",
                                                            textDecoration: "none",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        <i className="ri-external-link-line"></i> Open in Maps
                                                    </a>

                                                    <a href={`tel:${order.customerPhone}`} className="dp-btn-call" title="Call Customer">
                                                        <i className="ri-phone-fill"></i>
                                                        <span>Call Customer</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Embedded Google Maps Route */}
                                    {openMapOrderId === order.id && (
                                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", marginTop: "4px" }}>
                                            <GoogleMapsRouteViewer
                                                pickupAddress={order.pickupAddress || "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002"}
                                                deliveryAddress={order.deliveryAddress}
                                                pickupTitle={order.pickupHub || "Central Logistics Hub (Powerpet)"}
                                                deliveryTitle={`Customer Delivery: ${order.customerName}`}
                                                customerName={order.customerName}
                                                customerPhone={order.customerPhone}
                                                height="290px"
                                                showCards={false}
                                                defaultTab="route"
                                            />
                                        </div>
                                    )}

                                    {/* Footer Button */}
                                    <div className="dp-card-footer">
                                        {!isDone ? (
                                            stage <= 1 ? (
                                                <button
                                                    type="button"
                                                    className="dp-btn-action accept"
                                                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                                                    onClick={() => handleAcceptOrder(order)}
                                                >
                                                    <i className="ri-check-line"></i>
                                                    <span>Accept Delivery Order</span>
                                                </button>
                                            ) : stage === 2 ? (
                                                <button
                                                    type="button"
                                                    className="dp-btn-action pickup"
                                                    style={{ backgroundColor: "#f59e0b", color: "#ffffff" }}
                                                    onClick={() => handleReachedPickup(order)}
                                                >
                                                    <i className="ri-map-pin-2-line"></i>
                                                    <span>Reached Pickup Location</span>
                                                </button>
                                            ) : stage === 3 ? (
                                                <button
                                                    type="button"
                                                    className="dp-btn-action pickup"
                                                    style={{ backgroundColor: "#d97706", color: "#ffffff" }}
                                                    onClick={() => handleConfirmDepositPickup(order)}
                                                >
                                                    <i className="ri-inbox-archive-line"></i>
                                                    <span>Picked Up Item • Start Delivery</span>
                                                </button>
                                            ) : stage === 4 ? (
                                                <button
                                                    type="button"
                                                    className="dp-btn-action deliver"
                                                    style={{ backgroundColor: "#0284c7", color: "#ffffff" }}
                                                    onClick={() => handleReachedCustomer(order)}
                                                >
                                                    <i className="ri-map-pin-user-line"></i>
                                                    <span>Reached Customer Location</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="dp-btn-action deliver"
                                                    style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                                                    onClick={() => handleConfirmDelivery(order)}
                                                >
                                                    <i className="ri-shield-check-line"></i>
                                                    <span>Customer Inspected • Complete Handover (No OTP)</span>
                                                </button>
                                            )
                                        ) : (
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "8px" }}>
                                                <div className="dp-done-summary">
                                                    <i className="ri-checkbox-circle-fill"></i>
                                                    <span>Delivered & Active ({order.completedAt || "Completed"})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePickupReturn(order.id)}
                                                    style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                >
                                                    <i className="ri-arrow-go-back-line"></i> Pick Up Return
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {toastMessage && (
                <div className="dp-toast">
                    <i className="ri-checkbox-circle-fill"></i>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
