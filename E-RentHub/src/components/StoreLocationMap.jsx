import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./StoreLocationMap.css";

// Official E-RentHub Eluru Store Hub Location
export const STORE_LOCATION = {
  name: "E-RentHub Experience & Store Hub",
  address: "Shop #4, Powerpet Main Road, Near Powerpet Railway Station, Eluru, Andhra Pradesh - 534002",
  landmark: "Opposite Venkataramana Theater Lane, Powerpet",
  city: "Eluru",
  pincode: "534002",
  phone: "+91 8812 234567",
  altPhone: "+91 98480 12345",
  email: "store.eluru@erenthub.in",
  hours: "9:00 AM – 9:00 PM (All 7 Days)",
  coords: { lat: 16.7145, lng: 81.102 },
  googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=16.7145,81.1020",
};

export default function StoreLocationMap({
  height = "260px",
  showHeader = true,
  interactive = true,
  customTitle,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [STORE_LOCATION.coords.lat, STORE_LOCATION.coords.lng],
        zoom: 16,
        scrollWheelZoom: false,
        dragging: interactive,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom Store Hub Pin Marker
      const storePin = L.divIcon({
        className: "erh-store-pin-marker",
        html: `
          <div class="erh-store-pin-bubble">
            <div class="erh-store-pin-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
              </svg>
            </div>
            <div class="erh-store-pin-tail"></div>
            <div class="erh-store-pin-pulse"></div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 50],
      });

      const marker = L.marker(
        [STORE_LOCATION.coords.lat, STORE_LOCATION.coords.lng],
        { icon: storePin }
      ).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 4px;">
            ${STORE_LOCATION.name}
          </strong>
          <span style="color: #475569; display: block; margin-bottom: 6px;">
            ${STORE_LOCATION.address}
          </span>
          <div style="display: flex; gap: 8px; font-size: 11.5px; color: #166534; font-weight: 600; margin-bottom: 8px;">
            <span><i class="ri-time-line"></i> ${STORE_LOCATION.hours}</span>
          </div>
          <a href="${STORE_LOCATION.googleMapsUrl}" target="_blank" rel="noopener noreferrer"
             style="display: inline-block; background: #2563eb; color: #ffffff; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 11.5px;">
            Get Directions →
          </a>
        </div>
      `);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [interactive]);

  return (
    <div className="store-map-card">
      {showHeader && (
        <div className="store-map-header">
          <div className="store-map-header-info">
            <div className="store-map-badge">
              <i className="ri-store-2-fill"></i>
              <span>Customer Pickup Hub</span>
            </div>
            <h4 className="store-map-title">
              {customTitle || STORE_LOCATION.name}
            </h4>
            <p className="store-map-address">
              <i className="ri-map-pin-2-line"></i> {STORE_LOCATION.address}
            </p>
            <div className="store-map-meta">
              <span>
                <i className="ri-time-line"></i> Hours: {STORE_LOCATION.hours}
              </span>
              <span>
                <i className="ri-phone-line"></i> Call: {STORE_LOCATION.phone}
              </span>
            </div>
          </div>

          <a
            href={STORE_LOCATION.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="store-map-directions-btn"
            title="Open directions in Google Maps"
          >
            <i className="ri-direction-line"></i>
            <span>Get Directions</span>
          </a>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="store-map-view"
        style={{ height }}
      />

      <div className="store-map-footer">
        <span className="store-map-instruction">
          <i className="ri-information-line"></i> Show your 4-digit Collection PIN at the store counter to test and pick up your device.
        </span>
      </div>
    </div>
  );
}
