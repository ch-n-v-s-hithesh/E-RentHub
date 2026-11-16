import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import GoogleMapsRouteViewer from "../components/GoogleMapsRouteViewer";
import "./Orders.css";

const STORE_LOCATION = {
  name: "E-RentHub Central Hub",
  address: "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
  hours: "9:00 AM – 9:00 PM (Monday – Sunday)",
  phone: "+91 8812 234567",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Shop+%234+Powerpet+Main+Road+Eluru",
};

const TRACKING_STAGES = [
  { stage: 1, label: "Confirmed", location: "Hub", desc: "Order booked and confirmed." },
  { stage: 2, label: "Out for Delivery", location: "In Transit", desc: "Delivery partner is on the way." },
  { stage: 3, label: "Delivered & In Use", location: "With Customer", desc: "Delivered and verified. Rental is active." },
  { stage: 4, label: "Returned", location: "Store Hub", desc: "Item returned safely. Full deposit refunded." },
];

export default function Orders() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [openMapOrderId, setOpenMapOrderId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCopyAddress = (addr) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    showToast("Address copied to clipboard! Paste in Google Maps.");
  };

  const handleResendOtp = async (order) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${order.id.replace("#", "")}/resend-otp`, { method: "POST" });
      const data = await res.json();
      showToast(data.message || `Handover OTP resent to ${order.customerEmail}`);
    } catch (e) {
      showToast(`Handover OTP sent to registered mail ${order.customerEmail || "balue.hithesh@gmail.com"}`);
    }
  };

  // Active cart count for navbar badge
  const [cartCount, setCartCount] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("erenthub_cart") || "[]");
      return Array.isArray(saved) ? saved.length : 0;
    } catch (e) {
      return 0;
    }
  });

  // Read orders directly from localStorage - clean and without mock items
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("erenthub_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const legacyMockIds = new Set([
            "#ERH-821942", "ERH-821942", "#ERH-9402", "ERH-9402", "#ERH-8150", "ERH-8150",
            "#ERH-7920", "#ERH-7320", "#ERH-6840", "#ERH-6120", "#ERH-5890", "#ERH-5510",
            "#ERH-5210", "#ERH-4980", "#ERH-4750", "#ERH-4420", "#ERH-4110", "#ERH-3890"
          ]);
          const realOrders = parsed.filter(o => !legacyMockIds.has(o.id ? (o.id.startsWith("#") ? o.id : `#${o.id}`) : ""));
          return realOrders.map((o) => {
            const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            const stage = o.trackingStage !== undefined ? o.trackingStage : (o.status === "Cancelled" ? 0 : 1);
            return {
              ...o,
              bookingDate: o.bookingDate || todayStr,
              startDate: o.startDate || o.rentalStartDate || todayStr,
              endDate: o.endDate || o.returnDate || new Date(Date.now() + (o.durationDays || o.days || 3) * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              durationDays: o.durationDays || o.days || 3,
              rentalPrice: o.rentalPrice || o.baseAmount || 420,
              securityDeposit: o.securityDeposit !== undefined ? o.securityDeposit : 1500,
              totalAmount: o.totalAmount || 496,
              customerName: o.customerName || "Customer",
              customerPhone: o.customerPhone || "+91 73963 48793",
              deliveryAddress: o.deliveryAddress || "Powerpet Main Road, Eluru",
              paymentStatus: o.paymentStatus || "Pay on Delivery / Handover",
              status: o.status || "Pending",
              trackingStage: stage,
              canCancel: stage < 2 && o.status !== "Cancelled",
            };
          });
        }
      }
    } catch (e) { }

    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("erenthub_orders", JSON.stringify(orders));
    } catch (e) { }
  }, [orders]);

  // Modal dialog states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null);

  // Filter tabs
  const filterTabs = [
    { key: "All", label: "All Orders" },
    { key: "InTransit", label: "In Transit" },
    { key: "Active", label: "Active Rentals" },
    { key: "Completed", label: "Completed" },
    { key: "Cancelled", label: "Cancelled" },
  ];

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { All: orders.length, InTransit: 0, Active: 0, Completed: 0, Cancelled: 0 };
    orders.forEach((o) => {
      if (o.status === "Cancelled") {
        counts.Cancelled += 1;
      } else if (o.status === "Completed" || o.status === "Returned" || o.trackingStage >= 4) {
        counts.Completed += 1;
      } else if (o.trackingStage === 3 || o.status === "Active") {
        counts.Active += 1;
      } else if (o.trackingStage < 3) {
        counts.InTransit += 1;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let matchesTab = true;
      if (activeTab === "InTransit") {
        matchesTab = (order.trackingStage || 1) < 3 && order.status !== "Cancelled";
      } else if (activeTab === "Active") {
        matchesTab = (order.trackingStage === 3 || order.status === "Active") && order.status !== "Cancelled";
      } else if (activeTab === "Completed") {
        matchesTab = order.status === "Completed" || order.status === "Returned" || (order.trackingStage || 1) >= 4;
      } else if (activeTab === "Cancelled") {
        matchesTab = order.status === "Cancelled";
      }

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        order.id.toLowerCase().includes(q) ||
        order.name.toLowerCase().includes(q) ||
        (order.category && order.category.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  // Advance tracking stage for simulation / testing
  const handleAdvanceTracking = (orderId) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        if (o.status === "Cancelled") return o;
        const currentStage = o.trackingStage || 1;
        const nextStage = Math.min(currentStage + 1, 5);

        let nextStatus = o.status;
        let note = "";
        let canCancel = false;

        if (nextStage === 2) {
          nextStatus = "Pending";
          note = "Packed & quality verified at Eluru Hub";
          canCancel = true;
        } else if (nextStage === 3) {
          nextStatus = "Out for Delivery";
          note = "Dispatched with courier • In Transit";
          canCancel = false;
        } else if (nextStage === 4) {
          nextStatus = "Active";
          note = "Delivered to customer • In Active Use";
          canCancel = false;
        } else if (nextStage === 5) {
          nextStatus = "Completed";
          note = "Returned & verified • Deposit Refunded";
          canCancel = false;
        }

        const stageInfo = TRACKING_STAGES.find((s) => s.stage === nextStage);
        return {
          ...o,
          trackingStage: nextStage,
          status: nextStatus,
          statusNote: note,
          trackingStatus: stageInfo ? stageInfo.desc : note,
          canCancel,
        };
      }
      return o;
    });

    setOrders(updated);
    try {
      localStorage.setItem("erenthub_orders", JSON.stringify(updated));
    } catch (e) { }

    const target = updated.find((o) => o.id === orderId);
    if (target) {
      if (target.trackingStage === 3) {
        showToast("Order is now out for delivery. Cancellation window is closed.");
      } else if (target.trackingStage === 4) {
        showToast("Rental activated. Device is in use.");
      } else if (target.trackingStage === 5) {
        showToast("Rental completed. Security deposit released.");
      } else {
        showToast("Order stage updated to " + (TRACKING_STAGES[target.trackingStage - 1]?.label || "Next"));
      }
    }
  };

  // Handle Cancel Order - ONLY allowed before out of store
  const handleConfirmCancel = () => {
    if (!cancelTargetOrder) return;

    if (cancelTargetOrder.trackingStage >= 3) {
      alert("Orders cannot be cancelled once dispatched for delivery.");
      setCancelTargetOrder(null);
      return;
    }

    const updated = orders.map((o) =>
      o.id === cancelTargetOrder.id
        ? {
          ...o,
          status: "Cancelled",
          trackingStage: 0,
          statusNote: "Order cancelled by customer",
          trackingStatus: "Cancelled prior to dispatch",
          canCancel: false,
        }
        : o
    );
    setOrders(updated);

    try {
      localStorage.setItem("erenthub_orders", JSON.stringify(updated));

      const bookedList = JSON.parse(localStorage.getItem("erenthub_booked_ids") || "[]");
      const targetItems = cancelTargetOrder.items || [{ id: cancelTargetOrder.id }];
      const targetIds = targetItems.map((i) => String(i.id));
      const filteredBooked = bookedList.filter((bId) => !targetIds.includes(String(bId)));
      localStorage.setItem("erenthub_booked_ids", JSON.stringify(filteredBooked));

      const userRentals = JSON.parse(localStorage.getItem("erenthub_user_rentals") || "[]");
      if (Array.isArray(userRentals) && userRentals.length > 0) {
        const updatedRentals = userRentals.map((r) => {
          if (targetIds.includes(String(r.id))) {
            return { ...r, status: "available", bookedBy: undefined };
          }
          return r;
        });
        localStorage.setItem("erenthub_user_rentals", JSON.stringify(updatedRentals));
      }
    } catch (e) {
      console.error(e);
    }

    setCancelTargetOrder(null);
    showToast(`Order #${cancelTargetOrder.id.replace("#", "")} cancelled successfully.`);
  };

  return (
    <div className="orders-app-container">
      {/* 1. TOP NAVBAR */}
      <header className="orders-navbar">
        <div className="orders-nav-container">
          <Link to="/home" className="orders-brand-link">
            <img src={logo} alt="E-RentHub Logo" className="orders-brand-logo" />
            <span className="orders-brand-name">
              E-<span>RentHub</span>
            </span>
          </Link>

          <nav className="orders-nav-links">
            <Link to="/home" className="orders-nav-link">Home</Link>
            <Link to="/orders" className="orders-nav-link active">My Orders</Link>
            <Link to="/sales" className="orders-nav-link sales-portal-link">Sales Portal</Link>
            <Link to="/profile" className="orders-nav-link">Profile</Link>
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

      {/* 2. MAIN CONTENT */}
      <main className="orders-page-wrapper">
        {/* Page Header */}
        <div className="orders-page-header">
          <div>
            <h1 className="orders-main-title">Rental Orders</h1>
            <p className="orders-main-subtitle">
              Track your rental bookings, doorstep delivery progress, and verification status.
            </p>
          </div>

          <div className="orders-header-actions">
            <Link to="/home" className="orders-browse-catalog-link">
              <i className="ri-add-line"></i>
              <span>Explore Gadgets</span>
            </Link>
          </div>
        </div>

        {/* Professional Cancellation Notice Banner */}
        <div className="cancellation-policy-banner">
          <div className="policy-banner-left">
            <div className="policy-icon-wrapper">
              <i className="ri-shield-check-line"></i>
            </div>
            <div className="policy-text">
              <span className="policy-heading">Cancellation Policy:</span>
              <span className="policy-desc">
                Orders can be cancelled free of charge anytime before the delivery partner picks up the gadget. Once verified and delivered to your doorstep, active rental terms apply.
              </span>
            </div>
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="orders-controls-bar">
          <div className="orders-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`orders-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="orders-tab-count">{tabCounts[tab.key] || 0}</span>
              </button>
            ))}
          </div>

          <div className="orders-search-wrapper">
            <i className="ri-search-line search-icon"></i>
            <input
              type="text"
              placeholder="Search by order ID or device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="orders-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="orders-empty-card">
              <div className="empty-box-icon">
                <i className="ri-inbox-archive-line"></i>
              </div>
              <h3>No rental orders found</h3>
              <p>
                {searchQuery
                  ? `No matching orders for "${searchQuery}".`
                  : `You don't have any bookings in "${activeTab}" right now.`}
              </p>
              <Link to="/home" className="orders-empty-btn">
                Browse Rental Catalog
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const stage = order.trackingStage || 1;
              const isCancelled = order.status === "Cancelled";
              const isBeforeOutOfStore = stage < 3 && !isCancelled;

              return (
                <div key={order.id} className={`order-item-card ${isCancelled ? "card-cancelled" : ""}`}>
                  {/* Human Order Header */}
                  <div className="order-top-bar">
                    <div className="order-meta-group">
                      <div className="order-meta-item">
                        <span className="meta-label">Order</span>
                        <span className="order-id-code">#{order.id.replace("#", "")}</span>
                      </div>
                      <div className="order-meta-divider"></div>
                      <div className="order-meta-item">
                        <span className="meta-label">Placed On</span>
                        <span className="meta-value">{order.bookingDate}</span>
                      </div>
                      <div className="order-meta-divider"></div>
                      <div className="order-meta-item">
                        <span className="meta-label">Total Amount</span>
                        <span className="meta-value price-highlight">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                          <small className="pay-method">({order.paymentStatus?.includes("Online") ? "Paid" : "Pay on Delivery"})</small>
                        </span>
                      </div>
                      <div className="order-meta-divider"></div>
                      <div className="order-meta-item">
                        <span className="meta-label">Customer</span>
                        <span className="meta-value">{order.customerName}</span>
                      </div>
                    </div>

                    <div className="status-badge-wrap">
                      {isCancelled ? (
                        <span className="status-pill status-cancelled">
                          <i className="ri-close-circle-line"></i> Cancelled
                        </span>
                      ) : stage >= 4 ? (
                        <span className="status-pill status-completed">
                          <i className="ri-checkbox-circle-line"></i> Returned & Completed
                        </span>
                      ) : stage === 3 ? (
                        <span className="status-pill status-active">
                          <i className="ri-macbook-line"></i> Active Rental
                        </span>
                      ) : stage === 2 ? (
                        <span className="status-pill status-out-of-store">
                          <i className="ri-truck-line"></i> Out for Delivery
                        </span>
                      ) : (
                        <span className="status-pill status-pending">
                          <i className="ri-time-line"></i> Order Confirmed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="order-body">
                    {/* ORDER PROGRESS STEPPER */}
                    {!isCancelled && (
                      <div className="order-tracker-box">
                        <div className="tracker-header">
                          <div className="tracker-heading-group">
                            <i className="ri-route-line tracker-icon"></i>
                            <span className="tracker-title">Order Progress</span>
                          </div>
                          <span className="tracker-current-stage">
                            {stage === 1 && "Order confirmed • Prepared for courier pickup"}
                            {stage === 2 && "Out for delivery with delivery partner"}
                            {stage === 3 && "Delivered to your doorstep • Active rental"}
                            {stage >= 4 && "Returned safely • Full deposit refunded"}
                          </span>
                        </div>

                        <div className="tracker-stepper">
                          {TRACKING_STAGES.map((s, idx) => {
                            const isCompleted = stage > s.stage;
                            const isCurrent = stage === s.stage;

                            return (
                              <div
                                key={s.stage}
                                className={`tracker-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                              >
                                <div className="step-marker-container">
                                  <div className="step-marker">
                                    {isCompleted ? (
                                      <i className="ri-check-line"></i>
                                    ) : (
                                      <span>{s.stage}</span>
                                    )}
                                  </div>
                                  {idx < TRACKING_STAGES.length - 1 && (
                                    <div className={`step-connector ${stage > s.stage ? "active" : ""}`} />
                                  )}
                                </div>
                                <div className="step-info">
                                  <span className="step-label">{s.label}</span>
                                  <span className="step-location">{s.location}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* DELIVERY & HANDOVER CARD */}
                    {!isCancelled && (
                      <div className="order-delivery-card">
                        <div className="delivery-header-row">
                          <div className="delivery-label">
                            <i className="ri-map-pin-2-line"></i>
                            <span>Delivery Destination</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn-copy-address"
                              style={{
                                backgroundColor: openMapOrderId === order.id ? "#2563eb" : "#eff6ff",
                                color: openMapOrderId === order.id ? "#ffffff" : "#1d4ed8",
                                borderColor: "#bfdbfe",
                              }}
                              onClick={() => setOpenMapOrderId(openMapOrderId === order.id ? null : order.id)}
                            >
                              <i className="ri-map-2-line"></i>
                              <span>{openMapOrderId === order.id ? "Hide Map" : "Google Maps Route"}</span>
                            </button>

                            <button
                              type="button"
                              className="btn-copy-address"
                              onClick={() => handleCopyAddress(order.deliveryAddress || "Shop #4, Powerpet Main Road, Eluru - 534002")}
                            >
                              <i className="ri-file-copy-line"></i>
                              <span>Copy Address</span>
                            </button>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress || "Shop #4, Powerpet Main Road, Eluru - 534002")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-copy-address"
                              style={{ textDecoration: "none" }}
                            >
                              <i className="ri-external-link-line"></i>
                              <span>Open in Maps</span>
                            </a>
                          </div>
                        </div>

                        {/* Pickup Hub Details */}
                        <div style={{ fontSize: "12px", color: "#92400e", backgroundColor: "#fffbeb", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fef3c7", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <i className="ri-store-2-fill"></i>
                          <span><strong>Pickup Hub:</strong> {order.pickupHub || STORE_LOCATION.name}</span>
                          <span style={{ color: "#b45309" }}>• {order.pickupAddress || STORE_LOCATION.address}</span>
                        </div>

                        <div className="delivery-address-text">
                          <i className="ri-map-pin-user-fill" style={{ color: "#2563eb", marginRight: "4px" }}></i>
                          {order.deliveryAddress || "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002"}
                        </div>
                        <div className="delivery-recipient-text">
                          Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                        </div>

                        {/* Embedded Google Maps Route Viewer */}
                        {openMapOrderId === order.id && (
                          <div style={{ margin: "10px 0" }}>
                            <GoogleMapsRouteViewer
                              pickupAddress={order.pickupAddress || STORE_LOCATION.address}
                              deliveryAddress={order.deliveryAddress || "Powerpet Main Road, Eluru - 534002"}
                              pickupTitle={order.pickupHub || STORE_LOCATION.name}
                              deliveryTitle="Your Doorstep Delivery"
                              customerName={order.customerName}
                              customerPhone={order.customerPhone}
                              deliveryBoyName={order.assignedDeliveryBoy || "CH.N.V.S. Hithesh"}
                              deliveryBoyPhone="+91 73963 48793"
                              deliveryBoyVehicle="EV Scooter (AP-37)"
                              deliveryBoyHub={order.pickupHub || "Powerpet Central Hub, Eluru"}
                              deliveryBoyRating="4.9 ★ (Verified Partner)"
                              showDeliveryBoy={true}
                              height="280px"
                              showCards={true}
                              defaultTab="route"
                            />
                          </div>
                        )}

                        <div className="delivery-rental-window">
                          <i className="ri-calendar-event-line"></i>
                          <span>
                            Rental Duration: <strong>{order.startDate || "Today"}</strong> to <strong>{order.endDate || "3 Days later"}</strong> ({order.durationDays || 3} Days)
                          </span>
                        </div>

                        {/* Doorstep handover assurance */}
                        <div className="delivery-otp-notice" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div className="otp-notice-content">
                            <i className="ri-shield-check-line otp-icon" style={{ color: "#16a34a" }}></i>
                            <div>
                              <div className="otp-title" style={{ color: "#0f172a" }}>Doorstep Handover & Quality Verification</div>
                              <div className="otp-desc" style={{ color: "#475569" }}>
                                Inspect and test the equipment with our delivery partner at your doorstep. No OTP required—simply confirm handover and pay via Cash or UPI.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="delivery-partner-row">
                          <i className="ri-truck-line"></i>
                          <span>
                            <strong>Delivery Partner:</strong> Assigned to CH.N.V.S. Hithesh • EV Scooter (AP-37)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* PRODUCT ROW */}
                    <div className="order-product-row">
                      <div className="order-img-container">
                        <img
                          src={order.image}
                          alt={order.name}
                          className="order-product-thumb"
                        />
                      </div>

                      <div className="order-product-details">
                        <div className="order-category-tag">{order.category || "Gadget"}</div>
                        <h3 className="order-product-name">{order.name}</h3>

                        <div className="order-rental-period">
                          <i className="ri-calendar-2-line"></i>
                          <span>
                            {order.startDate} to {order.endDate}
                          </span>
                          <span className="rental-duration-badge">{order.durationDays || order.days || 3} Days</span>
                        </div>

                        <div className="order-security-info">
                          <span>Deposit: <strong>₹{Number(order.securityDeposit || 1000).toLocaleString("en-IN")}</strong> <span className="refundable-text">(100% Refundable)</span></span>
                          <span className="dot-divider">•</span>
                          <span>Daily Rate: <strong>₹{Number(order.rentalPrice || 140).toLocaleString("en-IN")}/day</strong></span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="order-actions-col">
                        <button
                          type="button"
                          className="btn-order-action btn-primary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <i className="ri-information-line"></i>
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          className="btn-order-action btn-secondary"
                          onClick={() => setReceiptOrder(order)}
                        >
                          <i className="ri-receipt-line"></i>
                          <span>Receipt</span>
                        </button>

                        {/* Cancellation Button */}
                        {!isCancelled && isBeforeOutOfStore && (
                          <button
                            type="button"
                            className="btn-order-action btn-danger"
                            onClick={() => setCancelTargetOrder(order)}
                            title="Cancel order before dispatch"
                          >
                            <i className="ri-close-line"></i>
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ========================================================
          MODAL 1: ORDER DETAILS
         ======================================================== */}
      {selectedOrder && (
        <div className="orders-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="orders-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h2>Order Details (#{selectedOrder.id.replace("#", "")})</h2>
              <button
                type="button"
                className="orders-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="orders-modal-content">
              <div className="modal-item-summary">
                <img
                  src={selectedOrder.image}
                  alt={selectedOrder.name}
                  className="modal-item-img"
                />
                <div>
                  <h4>{selectedOrder.name}</h4>
                  <span className="order-category-tag">{selectedOrder.category}</span>
                  <p className="modal-item-specs">{selectedOrder.specs || "Verified device with accessories and full insurance."}</p>
                </div>
              </div>

              <div className="modal-table-grid">
                <div className="table-row">
                  <span className="table-key">Order Status:</span>
                  <span className="table-val" style={{ fontWeight: 600, color: selectedOrder.status === "Cancelled" ? "#dc2626" : "#2563eb" }}>
                    {selectedOrder.status === "Cancelled"
                      ? "Cancelled"
                      : selectedOrder.trackingStage >= 4
                        ? "Returned & Completed"
                        : selectedOrder.trackingStage === 3
                          ? "Delivered & Active Rental"
                          : selectedOrder.trackingStage === 2
                            ? "Out for Delivery"
                            : "Order Confirmed"}
                  </span>
                </div>
                <div className="table-row">
                  <span className="table-key">Rental Dates:</span>
                  <span className="table-val">{selectedOrder.startDate} to {selectedOrder.endDate} ({selectedOrder.durationDays || 3} Days)</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Rental Rent:</span>
                  <span className="table-val">₹{Number(selectedOrder.rentalPrice || selectedOrder.baseAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Refundable Deposit:</span>
                  <span className="table-val">₹{Number(selectedOrder.securityDeposit || 1000).toLocaleString("en-IN")} (Refundable upon return)</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Total Payable:</span>
                  <span className="table-val" style={{ fontWeight: 700 }}>₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Payment Mode:</span>
                  <span className="table-val">{selectedOrder.paymentStatus || "Pay on Handover (Cash / UPI)"}</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Customer Info:</span>
                  <span className="table-val">{selectedOrder.customerName} ({selectedOrder.customerEmail})</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Contact Phone:</span>
                  <span className="table-val">{selectedOrder.customerPhone}</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Delivery Address:</span>
                  <span className="table-val" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span>{selectedOrder.deliveryAddress || STORE_LOCATION.address}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(selectedOrder.deliveryAddress || STORE_LOCATION.address)}
                      style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Copy
                    </button>
                  </span>
                </div>
                <div className="table-row">
                  <span className="table-key">Delivery Partner:</span>
                  <span className="table-val">CH.N.V.S. Hithesh • EV Scooter (AP-37)</span>
                </div>
                <div className="table-row">
                  <span className="table-key">Handover Verification:</span>
                  <span className="table-val" style={{ color: "#166534", fontWeight: "600" }}>
                    Verified upon doorstep delivery & customer inspection.
                  </span>
                </div>
                <div className="table-row">
                  <span className="table-key">Cancellation Rule:</span>
                  <span className="table-val" style={{ color: selectedOrder.trackingStage < 2 ? "#16a34a" : "#b91c1c", fontWeight: 600 }}>
                    {selectedOrder.status === "Cancelled"
                      ? "Cancelled"
                      : selectedOrder.trackingStage < 2
                        ? "Eligible for free cancellation (Before pickup)"
                        : "Locked: In transit / delivered to customer"}
                  </span>
                </div>
              </div>
            </div>

            <div className="orders-modal-footer">
              <button
                type="button"
                className="btn-order-action btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: INVOICE RECEIPT
         ======================================================== */}
      {receiptOrder && (
        <div className="orders-modal-overlay" onClick={() => setReceiptOrder(null)}>
          <div className="orders-modal-box invoice-box" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header">
              <div className="invoice-brand">
                <img src={logo} alt="E-RentHub Logo" className="invoice-logo" />
                <h3>E-RentHub Rental Receipt</h3>
              </div>
              <div className="invoice-meta">
                <div>Receipt #{receiptOrder.id.replace("#", "")}</div>
                <div>Date: {receiptOrder.bookingDate}</div>
              </div>
            </div>

            <div className="invoice-body">
              <div className="invoice-parties">
                <div>
                  <strong>Billed To:</strong>
                  <div>{receiptOrder.customerName}</div>
                  <div>{receiptOrder.deliveryAddress}</div>
                  <div>Phone: {receiptOrder.customerPhone}</div>
                </div>
                <div>
                  <strong>Fulfillment Partner Hub:</strong>
                  <div>E-RentHub Partner Logistics</div>
                  <div>Powerpet Main Road, Eluru - 534002</div>
                  <div>Helpline: +91 8812 234567</div>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Days</th>
                    <th>Rent/Day</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{receiptOrder.name}</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{receiptOrder.category}</div>
                    </td>
                    <td>{receiptOrder.durationDays || receiptOrder.days || 3}</td>
                    <td>₹{Math.round((receiptOrder.rentalPrice || 420) / (receiptOrder.durationDays || 3))}</td>
                    <td style={{ textAlign: "right" }}>₹{(receiptOrder.rentalPrice || 420).toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td>Refundable Security Deposit</td>
                    <td>-</td>
                    <td>-</td>
                    <td style={{ textAlign: "right" }}>₹{(receiptOrder.securityDeposit || 1000).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ textAlign: "right", fontWeight: 700 }}>Total Payable on Handover:</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      ₹{((receiptOrder.totalAmount || 0) + (receiptOrder.securityDeposit || 1000)).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="invoice-notes">
                <p><strong>Fulfillment / Store Hub:</strong> E-RentHub Experience Store Hub, Shop #4, Powerpet Main Road, Eluru - 534002.</p>
                <p><strong>Quality Guarantee:</strong> Equipment tested and verified prior to handover. 100% refundable security deposit upon return.</p>
              </div>
            </div>

            <div className="orders-modal-footer">
              <button
                type="button"
                className="btn-order-action btn-primary"
                onClick={() => window.print()}
              >
                <i className="ri-printer-line"></i>
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                className="btn-order-action btn-secondary"
                onClick={() => setReceiptOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CANCEL BOOKING CONFIRMATION
         ======================================================== */}
      {cancelTargetOrder && (
        <div className="orders-modal-overlay" onClick={() => setCancelTargetOrder(null)}>
          <div className="orders-modal-box cancel-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="orders-modal-header">
              <h2>Cancel Rental Booking?</h2>
              <button
                type="button"
                className="orders-modal-close"
                onClick={() => setCancelTargetOrder(null)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="orders-modal-content">
              <div className="cancel-modal-banner-allowed">
                <i className="ri-checkbox-circle-fill"></i>
                <span>This order has not been dispatched yet. Cancellation is completely free.</span>
              </div>
              <p style={{ fontSize: "14px", color: "#334155", margin: "14px 0 6px" }}>
                Are you sure you want to cancel booking <strong>#{cancelTargetOrder.id.replace("#", "")}</strong> ({cancelTargetOrder.name})?
              </p>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Any reserved gadgets will be released to catalog availability immediately.
              </p>
            </div>

            <div className="orders-modal-footer">
              <button
                type="button"
                className="btn-order-action btn-danger"
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </button>
              <button
                type="button"
                className="btn-order-action btn-secondary"
                onClick={() => setCancelTargetOrder(null)}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modern Toast Notification */}
      {toastMessage && (
        <div className="erenthub-toast">
          <i className="ri-information-fill"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
