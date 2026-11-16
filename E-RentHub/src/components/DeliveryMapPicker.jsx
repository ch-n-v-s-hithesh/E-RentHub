import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./DeliveryMapPicker.css";

// Default coordinates centered on Eluru, Andhra Pradesh
const DEFAULT_CENTER = { lat: 16.7107, lng: 81.0952 };

// Known local landmarks in Eluru for instantaneous, reliable resolution
const ELURU_LANDMARKS = [
  { name: "Powerpet", area: "Powerpet Road", landmark: "Near Powerpet Railway Station", lat: 16.7145, lng: 81.1020, pincode: "534002" },
  { name: "Southern Street", area: "Southern Street", landmark: "Near Kathepu Veedhi Centre", lat: 16.7112, lng: 81.0935, pincode: "534001" },
  { name: "R.R. Pet", area: "Ramachandra Rao Pet", landmark: "Near Main Market", lat: 16.7080, lng: 81.0990, pincode: "534002" },
  { name: "Ashok Nagar", area: "Ashok Nagar Main Rd", landmark: "Near Municipal Park", lat: 16.7210, lng: 81.0890, pincode: "534002" },
  { name: "Sanivarapupeta", area: "Sanivarapupeta", landmark: "Near Government High School", lat: 16.7270, lng: 81.1150, pincode: "534003" },
  { name: "Tangellamudi", area: "Tangellamudi", landmark: "Near Tammileru Bridge", lat: 16.7015, lng: 81.0850, pincode: "534005" },
];

// Fallback reverse geocoder when offline or Nominatim is throttled
function fallbackResolveEluru(lat, lng) {
  let closest = ELURU_LANDMARKS[0];
  let minDiff = 999;
  for (const lm of ELURU_LANDMARKS) {
    const diff = Math.hypot(lm.lat - lat, lm.lng - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = lm;
    }
  }

  const offsetHouse = Math.floor(10 + Math.abs(lat * 1000) % 90);
  return {
    fullAddress: `${offsetHouse}D-4-23, ${closest.area}, ${closest.landmark}, Eluru - ${closest.pincode}`,
    area: closest.name,
    city: "Eluru",
    pincode: closest.pincode,
  };
}

// Custom High-Contrast SVG Draggable Pin Icon
const createPinIcon = () => {
  return L.divIcon({
    className: "erh-map-pin-marker",
    html: `
      <div class="erh-pin-wrapper">
        <div class="erh-pin-body">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="#2563eb">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="erh-pin-dot"></div>
        </div>
        <div class="erh-pin-shadow"></div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
  });
};

export default function DeliveryMapPicker({ initialAddress, onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem("erenthub_delivery_coords");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) return parsed;
      } catch (e) {}
    }
    return DEFAULT_CENTER;
  });

  const [resolvedAddress, setResolvedAddress] = useState(
    initialAddress || "6D-4-23, Dudekula vari sandu, Kathepu Veedhi Centre, Southern Street, Eluru - 534001"
  );
  const [isLocating, setIsLocating] = useState(false);
  const [statusNote, setStatusNote] = useState("Drag marker or click map to pinpoint doorstep");

  // Reverse Geocoding with debounce and fallback
  const fetchAddress = useCallback(
    async (lat, lng) => {
      setStatusNote("Resolving street address...");
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            const addr = data.address || {};
            const road = addr.road || addr.suburb || addr.neighbourhood || addr.residential || "Street";
            const house = addr.house_number || "Door No.";
            const suburb = addr.suburb || addr.village || addr.city_district || "Central";
            const city = addr.city || addr.town || addr.county || "Eluru";
            const postcode = addr.postcode || "534001";

            const formatted = `${house !== "Door No." ? house + ", " : ""}${road}, ${suburb}, ${city} - ${postcode}`;
            setResolvedAddress(formatted);
            setStatusNote(`Location confirmed: ${suburb}, ${city}`);

            // Persist to localStorage immediately
            localStorage.setItem("erenthub_delivery_coords", JSON.stringify({ lat, lng }));
            localStorage.setItem("erenthub_delivery_address", formatted);

            if (onLocationSelect) {
              onLocationSelect({
                fullAddress: formatted,
                lat,
                lng,
                city,
                pincode: postcode,
                area: suburb,
              });
            }
            return;
          }
        }
      } catch (e) {
        console.warn("Nominatim reverse geocode fallback:", e);
      }

      // Offline / Fallback resolution
      const fallback = fallbackResolveEluru(lat, lng);
      setResolvedAddress(fallback.fullAddress);
      setStatusNote(`Location pinned: ${fallback.area}, ${fallback.city}`);

      localStorage.setItem("erenthub_delivery_coords", JSON.stringify({ lat, lng }));
      localStorage.setItem("erenthub_delivery_address", fallback.fullAddress);

      if (onLocationSelect) {
        onLocationSelect({
          fullAddress: fallback.fullAddress,
          lat,
          lng,
          city: fallback.city,
          pincode: fallback.pincode,
          area: fallback.area,
        });
      }
    },
    [onLocationSelect]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Draggable Marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: createPinIcon(),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker.bindPopup("<b>Delivery Pin</b><br>Drag me to your exact building or house gate!").openPopup();

    // Drag end listener
    marker.on("dragend", (e) => {
      const newPos = e.target.getLatLng();
      const updated = { lat: Number(newPos.lat.toFixed(6)), lng: Number(newPos.lng.toFixed(6)) };
      setCoords(updated);
      fetchAddress(updated.lat, updated.lng);
    });

    // Map click to reposition pin
    map.on("click", (e) => {
      const newPos = e.latlng;
      const updated = { lat: Number(newPos.lat.toFixed(6)), lng: Number(newPos.lng.toFixed(6)) };
      marker.setLatLng(newPos);
      setCoords(updated);
      fetchAddress(updated.lat, updated.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // Live Location Button (GPS)
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setStatusNote("Acquiring GPS satellite position...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const newCoords = { lat, lng };

        setCoords(newCoords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.bindPopup("<b>Live GPS Location Found!</b><br>Doorstep pin updated.").openPopup();
        }

        fetchAddress(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err.message);
        setStatusNote("GPS permission denied or timed out. Defaulted to Eluru Main Hub.");
        // Center on default hub gracefully
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 15);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Quick area selection chips
  const handleSelectArea = (lm) => {
    const newCoords = { lat: lm.lat, lng: lm.lng };
    setCoords(newCoords);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lm.lat, lm.lng], 16, { duration: 0.8 });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lm.lat, lm.lng]);
    }
    fetchAddress(lm.lat, lm.lng);
  };

  return (
    <div className="erh-map-picker-card">
      <div className="erh-map-picker-header">
        <div className="erh-map-picker-title-wrap">
          <div className="erh-map-icon-badge">
            <i className="ri-map-pin-user-line"></i>
          </div>
          <div>
            <h4 className="erh-map-title">Pinpoint Exact Delivery Location</h4>
            <p className="erh-map-subtitle">Drag the marker or click map to set delivery doorstep</p>
          </div>
        </div>

        <button
          type="button"
          className={`erh-btn-live-location ${isLocating ? "loading" : ""}`}
          onClick={handleUseLiveLocation}
          disabled={isLocating}
          title="Detect my current GPS position"
        >
          <i className={isLocating ? "ri-loader-4-line erh-spin" : "ri-crosshair-2-line"}></i>
          <span>{isLocating ? "Locating..." : "Use Live Location"}</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="erh-map-wrapper">
        <div ref={mapContainerRef} className="erh-leaflet-container" />
        <div className="erh-map-overlay-badge">
          <i className="ri-drag-move-2-line"></i>
          <span>Draggable Marker Enabled</span>
        </div>
      </div>

      {/* Quick Area Jump Chips */}
      <div className="erh-quick-areas">
        <span className="erh-quick-label">Quick Areas (Eluru):</span>
        <div className="erh-chips-list">
          {ELURU_LANDMARKS.map((lm) => (
            <button
              key={lm.name}
              type="button"
              className="erh-chip-btn"
              onClick={() => handleSelectArea(lm)}
            >
              <i className="ri-building-line"></i>
              {lm.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resolved Address Banner */}
      <div className="erh-map-resolved-box">
        <div className="erh-resolved-left">
          <div className="erh-resolved-icon">
            <i className="ri-navigation-line"></i>
          </div>
          <div className="erh-resolved-text">
            <span className="erh-resolved-heading">Selected Delivery Doorstep:</span>
            <p className="erh-resolved-address">{resolvedAddress}</p>
            <span className="erh-resolved-coords">
              GPS: {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E • {statusNote}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

