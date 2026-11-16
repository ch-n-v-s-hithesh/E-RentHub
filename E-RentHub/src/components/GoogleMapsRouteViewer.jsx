import { useState, useEffect } from "react";
import "./GoogleMapsRouteViewer.css";

/**
 * GoogleMapsRouteViewer
 * Renders an interactive Google Maps embedded route or location viewer
 * with one-click direct links to Google Maps app/web, and assigned delivery boy details.
 */
export default function GoogleMapsRouteViewer({
  pickupAddress = "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
  deliveryAddress = "Flat 302, Sri Sai Residency, Powerpet Main Road, Eluru - 534002",
  pickupTitle = "E-RentHub Central Logistics Hub",
  deliveryTitle = "Customer Doorstep Delivery",
  customerName = "Balu Hithesh",
  customerPhone = "+91 7396348793",
  deliveryBoyName = "CH.N.V.S. Hithesh",
  deliveryBoyPhone = "+91 73963 48793",
  deliveryBoyVehicle = "EV Scooter (AP-37)",
  deliveryBoyHub = "Powerpet Central Hub, Eluru",
  deliveryBoyRating = "4.9 ★ (180+ deliveries)",
  showDeliveryBoy = true,
  trackingStage = 1,
  statusNote,
  height = "320px",
  showCards = true,
  defaultTab = "route", // 'route' | 'delivery' | 'pickup'
  isCustomerView = false,
}) {
  const cleanPickup = pickupAddress || "Powerpet Main Road, Eluru - 534002";
  const cleanDelivery = deliveryAddress || "Eluru, Andhra Pradesh - 534002";

  // Compute stage-specific active tab
  const getStageTab = (stage) => {
    if (stage === 2 || stage === 3) return "pickup";
    if (stage === 4) return "route";
    if (stage >= 5) return "delivery";
    return defaultTab || "route";
  };

  const [activeTab, setActiveTab] = useState(() => getStageTab(trackingStage));
  const [copiedKey, setCopiedKey] = useState("");

  // Sync activeTab whenever trackingStage changes
  useEffect(() => {
    setActiveTab(getStageTab(trackingStage));
  }, [trackingStage]);

  // Google Maps URLs
  const routeEmbedUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(cleanPickup)}&daddr=${encodeURIComponent(cleanDelivery)}&output=embed`;
  const deliveryEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cleanDelivery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const pickupEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cleanPickup)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  // External Navigation URLs
  const externalRouteNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(cleanPickup)}&destination=${encodeURIComponent(cleanDelivery)}&travelmode=driving`;
  const externalDeliveryNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanDelivery)}`;
  const externalPickupNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanPickup)}`;

  const currentEmbedUrl =
    activeTab === "pickup"
      ? pickupEmbedUrl
      : activeTab === "delivery"
      ? deliveryEmbedUrl
      : routeEmbedUrl;

  const currentExternalNavUrl =
    activeTab === "pickup"
      ? externalPickupNavUrl
      : activeTab === "delivery"
      ? externalDeliveryNavUrl
      : externalRouteNavUrl;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2500);
  };

  const getLiveLocationText = () => {
    if (statusNote) return statusNote;
    if (trackingStage === 2) return `🛵 Delivery partner ${deliveryBoyName} accepted order • Heading to pickup hub (${pickupTitle})`;
    if (trackingStage === 3) return `📍 Delivery partner ${deliveryBoyName} reached pickup hub • Inspecting gadget with hub team`;
    if (trackingStage === 4) return `🚚 Out for delivery! ${deliveryBoyName} picked up gadget • Riding to your doorstep`;
    if (trackingStage === 5) return `🎉 Delivery partner ${deliveryBoyName} has arrived at your doorstep • Ready for inspection & handover`;
    if (trackingStage >= 6) return `✅ Order delivered & active rental • Handover verified`;
    return `📦 Order confirmed • Assigned to delivery partner ${deliveryBoyName}`;
  };

  const getStageBadgeInfo = () => {
    if (trackingStage === 2) {
      return {
        label: "Stage: Heading to Pickup Hub",
        desc: "Rider is en route to the store to collect your reserved gadget.",
        icon: "ri-riding-line",
        color: "#d97706",
        bgColor: "#fef3c7",
      };
    }
    if (trackingStage === 3) {
      return {
        label: "Stage: At Pickup Location",
        desc: "Rider has reached the store and is inspecting device quality & accessories.",
        icon: "ri-store-2-fill",
        color: "#b45309",
        bgColor: "#fef3c7",
      };
    }
    if (trackingStage === 4) {
      return {
        label: "Stage: Out for Local Delivery",
        desc: "Rider is actively on the road between the pickup hub and your doorstep.",
        icon: "ri-truck-fill",
        color: "#1d4ed8",
        bgColor: "#eff6ff",
      };
    }
    if (trackingStage === 5) {
      return {
        label: "Stage: Arrived at Doorstep",
        desc: "Rider has reached your address. Please inspect the gadget upon handover.",
        icon: "ri-map-pin-user-fill",
        color: "#059669",
        bgColor: "#ecfdf5",
      };
    }
    if (trackingStage >= 6) {
      return {
        label: "Stage: Delivered & Handed Over",
        desc: "Direct handover complete. Rental is active.",
        icon: "ri-shield-check-fill",
        color: "#15803d",
        bgColor: "#f0fdf4",
      };
    }
    return {
      label: "Stage: Order Assigned",
      desc: "Delivery partner assigned. Preparing for dispatch.",
      icon: "ri-time-line",
      color: "#475569",
      bgColor: "#f1f5f9",
    };
  };

  const stageBadge = getStageBadgeInfo();

  return (
    <div className="gm-route-container">
      {/* Cards: Pickup Location, Delivery Boy Details & Delivery Destination */}
      {showCards && (
        <div className="gm-cards-grid">
          {/* Card 1: Pickup Location */}
          <div className="gm-card gm-card-pickup">
            <div className="gm-card-header">
              <span className="gm-badge gm-badge-pickup">
                <i className="ri-store-2-line"></i> 1. Pickup Hub
              </span>
              <a
                href={externalPickupNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gm-nav-link"
                title="Open in Google Maps"
              >
                <i className="ri-external-link-line"></i> Google Maps
              </a>
            </div>

            <div className="gm-card-title">{pickupTitle}</div>
            <div className="gm-card-address">
              <i className="ri-map-pin-2-fill gm-pin-pickup"></i>
              <span>{cleanPickup}</span>
            </div>

            <div className="gm-card-footer">
              <span className="gm-meta-item">
                <i className="ri-time-line"></i> 9:00 AM – 9:00 PM
              </span>
              <button
                type="button"
                className="gm-btn-copy"
                onClick={() => handleCopy(cleanPickup, "pickup")}
              >
                <i className={copiedKey === "pickup" ? "ri-check-line" : "ri-file-copy-line"}></i>
                <span>{copiedKey === "pickup" ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Assigned Delivery Boy Details */}
          {showDeliveryBoy && (
            <div className="gm-card gm-card-rider">
              <div className="gm-card-header">
                <span className="gm-badge gm-badge-rider">
                  <i className="ri-riding-line"></i> 2. Delivery Partner
                </span>
                <span className="gm-rider-live-tag">
                  <span className="gm-live-dot"></span> On Duty • En Route
                </span>
              </div>

              <div className="gm-rider-profile">
                <div className="gm-rider-avatar">
                  <i className="ri-user-star-line"></i>
                </div>
                <div className="gm-rider-info">
                  <div className="gm-card-title" style={{ margin: 0 }}>{deliveryBoyName}</div>
                  <div className="gm-rider-sub">
                    <span>{deliveryBoyVehicle}</span> • <span className="gm-rider-rating">{deliveryBoyRating}</span>
                  </div>
                </div>
              </div>

              <div className="gm-rider-hub">
                <i className="ri-map-pin-line"></i>
                <span>Based at: <strong>{deliveryBoyHub}</strong></span>
              </div>

              <div className="gm-card-footer">
                <a
                  href={`tel:${deliveryBoyPhone.replace(/\s+/g, "")}`}
                  className="gm-btn-call"
                  title="Call Delivery Partner"
                >
                  <i className="ri-phone-fill"></i>
                  <span>Call: {deliveryBoyPhone}</span>
                </a>
                <span className="gm-badge-verified">
                  <i className="ri-shield-check-fill"></i> ID Verified
                </span>
              </div>
            </div>
          )}

          {/* Card 3: Delivery Destination */}
          <div className="gm-card gm-card-delivery">
            <div className="gm-card-header">
              <span className="gm-badge gm-badge-delivery">
                <i className="ri-truck-line"></i> 3. Delivery Destination
              </span>
              <a
                href={externalDeliveryNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gm-nav-link"
                title="Open in Google Maps"
              >
                <i className="ri-external-link-line"></i> Google Maps
              </a>
            </div>

            <div className="gm-card-title">{customerName}</div>
            <div className="gm-card-address">
              <i className="ri-map-pin-user-fill gm-pin-delivery"></i>
              <span>{cleanDelivery}</span>
            </div>

            <div className="gm-card-footer">
              <span className="gm-meta-item">
                <i className="ri-phone-line"></i> {customerPhone}
              </span>
              <button
                type="button"
                className="gm-btn-copy"
                onClick={() => handleCopy(cleanDelivery, "delivery")}
              >
                <i className={copiedKey === "delivery" ? "ri-check-line" : "ri-file-copy-line"}></i>
                <span>{copiedKey === "delivery" ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Route Location Banner */}
      <div
        style={{
          backgroundColor: stageBadge.bgColor,
          border: `1px solid ${stageBadge.color}30`,
          borderRadius: "8px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "12.5px",
          color: stageBadge.color,
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <i className={stageBadge.icon} style={{ fontSize: "16px" }}></i>
          <div>
            <div>{getLiveLocationText()}</div>
            <div style={{ fontSize: "11px", fontWeight: "500", opacity: 0.9 }}>{stageBadge.desc}</div>
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "4px",
            backgroundColor: "#ffffff",
            border: `1px solid ${stageBadge.color}40`,
            color: stageBadge.color,
            fontWeight: "700",
          }}
        >
          {stageBadge.label}
        </span>
      </div>

      {/* Google Maps Controls Toolbar */}
      <div className="gm-toolbar">
        <div className="gm-tabs">
          {isCustomerView ? (
            /* Customer View: Highlights where the delivery guy currently is on route */
            <>
              {trackingStage === 2 || trackingStage === 3 ? (
                <button
                  type="button"
                  className={`gm-tab ${activeTab === "pickup" ? "active" : ""}`}
                  onClick={() => setActiveTab("pickup")}
                >
                  <i className="ri-store-2-fill"></i>
                  <span>Rider at Pickup Location</span>
                </button>
              ) : trackingStage === 4 ? (
                <button
                  type="button"
                  className={`gm-tab ${activeTab === "route" ? "active" : ""}`}
                  onClick={() => setActiveTab("route")}
                >
                  <i className="ri-truck-fill"></i>
                  <span>Live Delivery Route to You</span>
                </button>
              ) : trackingStage >= 5 ? (
                <button
                  type="button"
                  className={`gm-tab ${activeTab === "delivery" ? "active" : ""}`}
                  onClick={() => setActiveTab("delivery")}
                >
                  <i className="ri-map-pin-user-fill"></i>
                  <span>Rider at Your Doorstep</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`gm-tab ${activeTab === "pickup" ? "active" : ""}`}
                  onClick={() => setActiveTab("pickup")}
                >
                  <i className="ri-store-2-line"></i>
                  <span>Pickup Hub</span>
                </button>
              )}

              <button
                type="button"
                className={`gm-tab ${activeTab === "route" && trackingStage !== 4 ? "active" : ""}`}
                onClick={() => setActiveTab(activeTab === "route" ? getStageTab(trackingStage) : "route")}
              >
                <i className="ri-map-2-line"></i>
                <span>{activeTab === "route" ? "Back to Rider Location" : "Overview Route"}</span>
              </button>
            </>
          ) : (
            /* Standard Admin/Staff View */
            <>
              <button
                type="button"
                className={`gm-tab ${activeTab === "route" ? "active" : ""}`}
                onClick={() => setActiveTab("route")}
              >
                <i className="ri-route-line"></i>
                <span>Google Maps Route</span>
              </button>
              <button
                type="button"
                className={`gm-tab ${activeTab === "delivery" ? "active" : ""}`}
                onClick={() => setActiveTab("delivery")}
              >
                <i className="ri-map-pin-user-line"></i>
                <span>Delivery Destination</span>
              </button>
              <button
                type="button"
                className={`gm-tab ${activeTab === "pickup" ? "active" : ""}`}
                onClick={() => setActiveTab("pickup")}
              >
                <i className="ri-store-2-line"></i>
                <span>Pickup Hub</span>
              </button>
            </>
          )}
        </div>

        <a
          href={currentExternalNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-btn-directions"
        >
          <i className="ri-navigation-fill"></i>
          <span>
            {trackingStage === 2 || trackingStage === 3
              ? "View Pickup Hub on Google Maps"
              : trackingStage === 4
              ? "Track Live Route on Google Maps"
              : "Open in Google Maps"}
          </span>
        </a>
      </div>

      {/* Embedded Google Map Frame */}
      <div className="gm-frame-wrap" style={{ height }}>
        <iframe
          title="Google Maps Location & Route"
          src={currentEmbedUrl}
          className="gm-iframe"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="gm-brand-tag">
          <i className="ri-google-fill"></i>
          <span>
            {trackingStage === 2
              ? `Delivery Partner ${deliveryBoyName} • Heading to Pickup`
              : trackingStage === 3
              ? `Delivery Partner ${deliveryBoyName} • At Pickup Location`
              : trackingStage === 4
              ? `Delivery Partner ${deliveryBoyName} • Out for Delivery`
              : trackingStage === 5
              ? `Delivery Partner ${deliveryBoyName} • At Your Doorstep`
              : `Google Maps • Delivery Partner ${deliveryBoyName}`}
          </span>
        </div>
      </div>
    </div>
  );
}
