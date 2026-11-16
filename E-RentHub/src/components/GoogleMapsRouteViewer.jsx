import { useState } from "react";
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
  height = "320px",
  showCards = true,
  defaultTab = "route", // 'route' | 'delivery' | 'pickup'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copiedKey, setCopiedKey] = useState("");

  const cleanPickup = pickupAddress || "Powerpet Main Road, Eluru - 534002";
  const cleanDelivery = deliveryAddress || "Eluru, Andhra Pradesh - 534002";

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

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2500);
  };

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
                  <i className="ri-riding-line"></i> 2. Delivery Boy
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
                  title="Call Delivery Boy"
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
          href={externalRouteNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-btn-directions"
        >
          <i className="ri-navigation-fill"></i>
          <span>Start Navigation in Google Maps</span>
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
          <span>Google Maps Active • Delivery Partner En Route</span>
        </div>
      </div>
    </div>
  );
}
