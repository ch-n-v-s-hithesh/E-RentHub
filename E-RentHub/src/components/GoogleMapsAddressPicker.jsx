import { useState } from "react";
import "./GoogleMapsAddressPicker.css";

// Official E-RentHub Eluru Pickup Hubs
export const ELURU_PICKUP_HUBS = [
  {
    id: "hub-powerpet",
    name: "Central Logistics Hub (Powerpet)",
    address: "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru - 534002",
    area: "Powerpet",
    landmark: "Opposite Venkataramana Theater Lane",
    coords: { lat: 16.7145, lng: 81.102 },
  },
  {
    id: "hub-southern",
    name: "South Eluru Store Hub (Southern Street)",
    address: "6D-4-23, Kathepu Veedhi Centre, Southern Street, Eluru - 534001",
    area: "Southern Street",
    landmark: "Near Kathepu Veedhi Centre",
    coords: { lat: 16.7112, lng: 81.0935 },
  },
  {
    id: "hub-ashok",
    name: "North Eluru Hub (Ashok Nagar)",
    address: "Ashok Nagar Main Road, Near Municipal Park, Eluru - 534002",
    area: "Ashok Nagar",
    landmark: "Near Municipal Park",
    coords: { lat: 16.721, lng: 81.089 },
  },
  {
    id: "hub-rrpet",
    name: "City Centre Hub (R.R. Pet)",
    address: "Main Market Road, Ramachandra Rao Pet, Eluru - 534002",
    area: "R.R. Pet",
    landmark: "Near Main Market",
    coords: { lat: 16.708, lng: 81.099 },
  },
];

// Popular local delivery areas in Eluru
const POPULAR_ELURU_AREAS = [
  { label: "Powerpet Main Rd", area: "Powerpet", query: "Powerpet Main Road, Eluru - 534002" },
  { label: "Southern Street", area: "Southern Street", query: "Southern Street, Eluru - 534001" },
  { label: "R.R. Pet", area: "Ramachandra Rao Pet", query: "Ramachandra Rao Pet, Eluru - 534002" },
  { label: "Ashok Nagar", area: "Ashok Nagar", query: "Ashok Nagar, Eluru - 534002" },
  { label: "Sanivarapupeta", area: "Sanivarapupeta", query: "Sanivarapupeta, Eluru - 534003" },
  { label: "Tangellamudi", area: "Tangellamudi", query: "Tangellamudi, Eluru - 534005" },
  { label: "Old Bus Stand Area", area: "Old Bus Stand", query: "Near Old Bus Stand, Eluru - 534001" },
  { label: "Collectorate Road", area: "Collectorate", query: "Collectorate Road, Eluru - 534006" },
];

export default function GoogleMapsAddressPicker({
  initialDeliveryAddress,
  initialPickupHubId = "hub-powerpet",
  onLocationChange,
}) {
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialDeliveryAddress || "Flat 302, Sri Sai Residency, Powerpet Main Road, Eluru - 534002"
  );
  const [selectedHubId, setSelectedHubId] = useState(initialPickupHubId);
  const [mapMode, setMapMode] = useState("delivery"); // 'delivery' | 'pickup' | 'route'
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const selectedHub =
    ELURU_PICKUP_HUBS.find((h) => h.id === selectedHubId) || ELURU_PICKUP_HUBS[0];

  // Notify parent of location changes
  const notifyChange = (newDelivery, newHub) => {
    if (onLocationChange) {
      onLocationChange({
        deliveryAddress: newDelivery,
        deliveryCoords: { lat: 16.7107, lng: 81.0952 },
        pickupAddress: newHub.address,
        pickupCoords: newHub.coords,
        pickupHub: newHub.name,
      });
    }
  };

  const handleDeliveryChange = (val) => {
    setDeliveryAddress(val);
    notifyChange(val, selectedHub);
  };

  const handleHubSelect = (hub) => {
    setSelectedHubId(hub.id);
    notifyChange(deliveryAddress, hub);
  };

  const handleQuickAreaSelect = (area) => {
    const updated = `Flat / House, ${area.query}`;
    setDeliveryAddress(updated);
    setMapMode("delivery");
    notifyChange(updated, selectedHub);
    setStatusMessage(`Delivery address set to ${area.label}`);
    setTimeout(() => setStatusMessage(""), 2500);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setStatusMessage("Detecting your current location via GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const gpsAddress = `Current Doorstep Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Eluru - 534002`;
        setDeliveryAddress(gpsAddress);
        setMapMode("delivery");
        if (onLocationChange) {
          onLocationChange({
            deliveryAddress: gpsAddress,
            deliveryCoords: { lat: latitude, lng: longitude },
            pickupAddress: selectedHub.address,
            pickupCoords: selectedHub.coords,
            pickupHub: selectedHub.name,
          });
        }
        setStatusMessage("Exact GPS location pinned on Google Maps!");
        setTimeout(() => setStatusMessage(""), 3000);
      },
      (err) => {
        setIsLocating(false);
        setStatusMessage("Could not access GPS. Please choose an Eluru landmark below.");
        setTimeout(() => setStatusMessage(""), 3500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Google Maps embed URL based on active view
  const currentEmbedUrl =
    mapMode === "pickup"
      ? `https://maps.google.com/maps?q=${encodeURIComponent(selectedHub.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
      : mapMode === "route"
      ? `https://maps.google.com/maps?saddr=${encodeURIComponent(selectedHub.address)}&daddr=${encodeURIComponent(deliveryAddress)}&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(deliveryAddress || "Eluru, Andhra Pradesh")}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const externalMapSearchUrl =
    mapMode === "pickup"
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHub.address)}`
      : mapMode === "route"
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(selectedHub.address)}&destination=${encodeURIComponent(deliveryAddress)}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`;

  return (
    <div className="gmap-picker-card">
      <div className="gmap-picker-header">
        <div className="gmap-header-title-box">
          <div className="gmap-icon-badge">
            <i className="ri-map-2-line"></i>
          </div>
          <div>
            <h4 className="gmap-title">Select Delivery & Pickup Address with Google Maps</h4>
            <p className="gmap-subtitle">
              Pin your doorstep address in Eluru and select the equipment pickup hub
            </p>
          </div>
        </div>

        <button
          type="button"
          className="gmap-btn-gps"
          onClick={handleDetectGPS}
          disabled={isLocating}
        >
          <i className={isLocating ? "ri-loader-4-line ri-spin" : "ri-crosshair-2-line"}></i>
          <span>{isLocating ? "Locating..." : "Use My Current Location"}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="gmap-status-banner">
          <i className="ri-information-line"></i> {statusMessage}
        </div>
      )}

      {/* Input Section 1: Customer Doorstep Delivery Address */}
      <div className="gmap-section">
        <div className="gmap-section-label">
          <i className="ri-map-pin-user-fill" style={{ color: "#2563eb" }}></i>
          <span>1. Customer Delivery Address (Doorstep)</span>
        </div>
        <input
          type="text"
          className="gmap-input"
          value={deliveryAddress}
          onChange={(e) => handleDeliveryChange(e.target.value)}
          placeholder="Enter house no, street, landmark, area in Eluru"
        />

        {/* Popular Eluru Landmarks Chips */}
        <div className="gmap-chips-container">
          <span className="gmap-chips-title">Quick Eluru Locations:</span>
          {POPULAR_ELURU_AREAS.map((area, idx) => (
            <button
              key={idx}
              type="button"
              className="gmap-chip"
              onClick={() => handleQuickAreaSelect(area)}
            >
              <i className="ri-map-pin-line"></i>
              <span>{area.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section 2: Equipment Pickup Hub */}
      <div className="gmap-section">
        <div className="gmap-section-label">
          <i className="ri-store-2-fill" style={{ color: "#f59e0b" }}></i>
          <span>2. Select Equipment Pickup Hub (Store Location)</span>
        </div>

        <div className="gmap-hubs-grid">
          {ELURU_PICKUP_HUBS.map((hub) => {
            const isSelected = hub.id === selectedHubId;
            return (
              <div
                key={hub.id}
                className={`gmap-hub-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleHubSelect(hub)}
              >
                <div className="gmap-hub-header">
                  <div className="gmap-hub-radio">
                    <div className={`radio-dot ${isSelected ? "checked" : ""}`} />
                  </div>
                  <strong className="gmap-hub-name">{hub.name}</strong>
                </div>
                <div className="gmap-hub-addr">{hub.address}</div>
                <div className="gmap-hub-landmark">
                  <i className="ri-building-line"></i> {hub.landmark}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Google Map Interactive View */}
      <div className="gmap-preview-wrap">
        <div className="gmap-preview-toolbar">
          <div className="gmap-view-toggles">
            <button
              type="button"
              className={`gmap-toggle-btn ${mapMode === "delivery" ? "active" : ""}`}
              onClick={() => setMapMode("delivery")}
            >
              <i className="ri-map-pin-user-line"></i> Delivery Pin
            </button>
            <button
              type="button"
              className={`gmap-toggle-btn ${mapMode === "pickup" ? "active" : ""}`}
              onClick={() => setMapMode("pickup")}
            >
              <i className="ri-store-2-line"></i> Pickup Hub
            </button>
            <button
              type="button"
              className={`gmap-toggle-btn ${mapMode === "route" ? "active" : ""}`}
              onClick={() => setMapMode("route")}
            >
              <i className="ri-route-line"></i> Full Route
            </button>
          </div>

          <a
            href={externalMapSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="gmap-open-link"
          >
            <i className="ri-external-link-line"></i> Open in Google Maps
          </a>
        </div>

        <div className="gmap-iframe-container">
          <iframe
            title="Google Maps Selector"
            src={currentEmbedUrl}
            className="gmap-embed-iframe"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="gmap-live-pill">
            <i className="ri-checkbox-circle-fill" style={{ color: "#10b981" }}></i>
            <span>Google Maps Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}

