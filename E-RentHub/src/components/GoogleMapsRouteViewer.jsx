import { useState, useEffect } from "react";
import "./GoogleMapsRouteViewer.css";

/**
 * GoogleMapsRouteViewer
 * Renders an interactive Google Maps embedded route or location viewer.
 * For customers: displays ONLY the live route/location of where the delivery partner is.
 * For admin/staff: can optionally display location cards and switcher tabs.
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
  showDeliveryBoy = false,
  trackingStage = 1,
  statusNote,
  height = "320px",
  showCards = false,
  defaultTab = "route", // 'route' | 'delivery' | 'pickup'
  isCustomerView = false,
}) {
  const cleanPickup = pickupAddress || "Powerpet Main Road, Eluru - 534002";
  const cleanDelivery = deliveryAddress || "Eluru, Andhra Pradesh - 534002";

  // Determine stage-specific view based on where the delivery partner currently is
  const getStageTab = (stage) => {
    if (stage === 2 || stage === 3) return "pickup";
    if (stage === 5 || stage >= 6) return "delivery";
    return "route"; // Stages 1 & 4: Route between pickup and customer
  };

  const [activeTab, setActiveTab] = useState(() => getStageTab(trackingStage));
  const [copiedKey, setCopiedKey] = useState("");

  // Keep view synchronized with live tracking stage
  useEffect(() => {
    setActiveTab(getStageTab(trackingStage));
  }, [trackingStage]);

  // Google Maps Embed URLs
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
    if (trackingStage === 2) return `Rider ${deliveryBoyName} accepted order • Heading to pickup hub (${pickupTitle})`;
    if (trackingStage === 3) return `Rider ${deliveryBoyName} arrived at pickup hub • Inspecting equipment`;
    if (trackingStage === 4) return `Out for delivery • Rider on EV Scooter riding to your doorstep`;
    if (trackingStage === 5) return `Rider ${deliveryBoyName} arrived at your doorstep • Ready for handover`;
    if (trackingStage >= 6) return `Delivered & active rental • Handover verified`;
    return `Delivery route • Powerpet Central Hub to your doorstep`;
  };

  // If customer view, render ONLY the live route map with a clean header
  if (isCustomerView) {
    return (
      <div className="gm-route-container">
        {/* Minimal Customer Header: Live status + Open in Maps */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#1e40af",
              backgroundColor: "#eff6ff",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #bfdbfe",
            }}
          >
            <span className="gm-live-dot" style={{ width: "7px", height: "7px", backgroundColor: "#2563eb" }}></span>
            <span>{getLiveLocationText()}</span>
          </div>

          <a
            href={currentExternalNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gm-btn-directions"
            style={{ padding: "6px 12px", fontSize: "11.5px" }}
          >
            <i className="ri-external-link-line"></i>
            <span>Open in Google Maps</span>
          </a>
        </div>

        {/* Embedded Google Map Frame: Customer sees ONLY the route */}
        <div className="gm-frame-wrap" style={{ height }}>
          <iframe
            title="Google Maps Route"
            src={currentEmbedUrl}
            className="gm-iframe"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="gm-brand-tag">
            <i className="ri-google-fill"></i>
            <span>Google Maps Route</span>
          </div>
        </div>
      </div>
    );
  }

  // Admin / Staff View (only when showCards is explicitly enabled)
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

      {/* Google Maps Controls Toolbar */}
      <div className="gm-toolbar">
        <div className="gm-tabs">
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
        </div>

        <a
          href={currentExternalNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-btn-directions"
        >
          <i className="ri-navigation-fill"></i>
          <span>Open in Google Maps</span>
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
          <span>Google Maps Active</span>
        </div>
      </div>
    </div>
  );
}
