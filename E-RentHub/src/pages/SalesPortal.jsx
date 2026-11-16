import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import "./SalesPortal.css";

// Reliable fallback imagery per category when user doesn't upload a photo
const CATEGORY_DEFAULT_IMAGES = {
    Laptops: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    Cameras: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
    Projectors: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    Speakers: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
    Electronics: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80",
};

export default function SalesPortal() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form inputs for listing a new item
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Laptops");
    const [dailyRate, setDailyRate] = useState("");
    const [securityDeposit, setSecurityDeposit] = useState("");
    const [city, setCity] = useState("Eluru");
    const [area, setArea] = useState("Powerpet");
    const [phone, setPhone] = useState("+91 73963 48793");
    const [ownerName, setOwnerName] = useState("Subba Rao");
    const [uploadedPhoto, setUploadedPhoto] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [specs, setSpecs] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3500);
    };

    // Active cart items count for navbar badge
    const [cartCount, setCartCount] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("erenthub_cart") || "[]");
            return Array.isArray(saved) ? saved.length : 0;
        } catch (e) {
            return 0;
        }
    });

    // Read user rentals from localStorage
    const [rentals, setRentals] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_user_rentals");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { }

        return [
            {
                id: "RENT-101",
                title: "HP Pavilion 15 Core i5 16GB Laptop",
                category: "Laptops",
                dailyRate: 140,
                securityDeposit: 1500,
                city: "Eluru",
                area: "Powerpet",
                ownerName: "Subba Rao",
                phone: "+91 94401 23456",
                image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
                specs: "Intel i5 11th Gen, 16GB RAM, 512GB SSD, with charger & bag",
                status: "stopped",
                listedAt: "Today",
            },
            {
                id: "RENT-102",
                title: "Nikon D5600 DSLR with 18-55mm Kit Lens",
                category: "Cameras",
                dailyRate: 180,
                securityDeposit: 2000,
                city: "Eluru",
                area: "Central Hub",
                ownerName: "Subba Rao",
                phone: "+91 94401 23456",
                image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
                specs: "24.2 MP, Full HD 60fps, 64GB Extreme SD Card included",
                status: "booked",
                bookedBy: "Customer (Online Booking)",
                listedAt: "Yesterday",
            }
        ];
    });

    // Sync to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("erenthub_user_rentals", JSON.stringify(rentals));
        } catch (e) { }
    }, [rentals]);

    // Handle real file upload from device
    const handleFileUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedPhoto(event.target.result);
                setUploadedFileName(file.name);
                setImageUrlInput("");
                showToast("Photo attached from device.");
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected photo
    const handleRemovePhoto = () => {
        setUploadedPhoto("");
        setUploadedFileName("");
        setImageUrlInput("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const activeImagePreview = uploadedPhoto || imageUrlInput.trim() || "";

    // Handle Upload Item to Home Page (Submit form)
    const handleUploadItem = (e) => {
        e.preventDefault();
        if (!title.trim() || !dailyRate) {
            alert("Please provide the device name and daily rental price.");
            return;
        }

        const fallbackImg = CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.Laptops;
        const finalImage = activeImagePreview || fallbackImg;

        const newItem = {
            id: `RENT-${Date.now().toString().slice(-5)}`,
            title: title.trim(),
            category,
            dailyRate: Number(dailyRate) || 120,
            securityDeposit: Number(securityDeposit) || 1000,
            city,
            area,
            phone,
            ownerName,
            image: finalImage,
            specs: specs.trim() || `Verified ${category} in excellent working condition.`,
            status: "available",
            listedAt: "Just now",
        };

        const updated = [newItem, ...rentals];
        setRentals(updated);
        try {
            localStorage.setItem("erenthub_user_rentals", JSON.stringify(updated));
        } catch (err) { }

        // Reset form
        setTitle("");
        setDailyRate("");
        setSecurityDeposit("");
        setSpecs("");
        setUploadedPhoto("");
        setUploadedFileName("");
        setImageUrlInput("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        showToast(`"${newItem.title}" published! Live in the rental catalog.`);
    };

    // Return item: Switch from Booked back to Available
    const handleMarkReturned = (id) => {
        const strId = String(id);
        const updated = rentals.map((item) => {
            if (String(item.id) === strId) {
                return {
                    ...item,
                    status: "available",
                    bookedBy: undefined,
                };
            }
            return item;
        });
        setRentals(updated);
        try {
            localStorage.setItem("erenthub_user_rentals", JSON.stringify(updated));
            const bookedList = JSON.parse(localStorage.getItem("erenthub_booked_ids") || "[]");
            const filtered = bookedList.filter((bId) => String(bId) !== strId);
            localStorage.setItem("erenthub_booked_ids", JSON.stringify(filtered));
        } catch (e) { }
        showToast("Item marked as returned and relisted as available.");
    };

    // Stop / Pause item: Owner can temporarily pause listing
    const handleToggleStop = (id) => {
        const strId = String(id);
        let nextStatus = "stopped";
        const updated = rentals.map((item) => {
            if (String(item.id) === strId) {
                nextStatus = item.status === "stopped" ? "available" : "stopped";
                return {
                    ...item,
                    status: nextStatus,
                };
            }
            return item;
        });
        setRentals(updated);
        try {
            localStorage.setItem("erenthub_user_rentals", JSON.stringify(updated));
            if (nextStatus === "available") {
                const bookedList = JSON.parse(localStorage.getItem("erenthub_booked_ids") || "[]");
                const filtered = bookedList.filter((bId) => String(bId) !== strId);
                localStorage.setItem("erenthub_booked_ids", JSON.stringify(filtered));
            }
        } catch (e) { }

        if (nextStatus === "stopped") {
            showToast("Listing paused. Hidden from catalog search.");
        } else {
            showToast("Listing resumed and active in catalog.");
        }
    };

    // Simulate customer booking for demonstration
    const handleSimulateBooked = (id) => {
        const strId = String(id);
        const updated = rentals.map((item) => {
            if (String(item.id) === strId) {
                return {
                    ...item,
                    status: "booked",
                    bookedBy: "Customer (Online Booking)",
                };
            }
            return item;
        });
        setRentals(updated);
        try {
            localStorage.setItem("erenthub_user_rentals", JSON.stringify(updated));
            const bookedList = JSON.parse(localStorage.getItem("erenthub_booked_ids") || "[]");
            if (!bookedList.includes(strId)) {
                localStorage.setItem("erenthub_booked_ids", JSON.stringify([...bookedList, strId]));
            }
        } catch (e) { }
        showToast("Item status changed to On Rent.");
    };

    // Permanently delete item
    const handleDeleteItem = (id) => {
        if (!window.confirm("Are you sure you want to remove this listing?")) return;
        const strId = String(id);
        const updated = rentals.filter((item) => String(item.id) !== strId);
        setRentals(updated);
        try {
            localStorage.setItem("erenthub_user_rentals", JSON.stringify(updated));
            const bookedList = JSON.parse(localStorage.getItem("erenthub_booked_ids") || "[]");
            const filtered = bookedList.filter((bId) => String(bId) !== strId);
            localStorage.setItem("erenthub_booked_ids", JSON.stringify(filtered));
        } catch (e) { }
        showToast("Listing removed.");
    };

    const availableCount = rentals.filter((r) => r.status === "available" || (!r.status && r.status !== "booked")).length;
    const bookedCount = rentals.filter((r) => r.status === "booked").length;
    const stoppedCount = rentals.filter((r) => r.status === "stopped").length;

    return (
        <div className="sales-portal-wrapper">
            {/* Top Navigation Bar */}
            <header className="sales-navbar">
                <div className="sales-navbar-container">
                    <Link to="/home" className="sales-brand-logo">
                        <img src={logo} alt="E-RentHub Logo" className="sales-logo-img" />
                        <span className="sales-brand-text">
                            E-Rent<span>Hub</span>
                        </span>
                    </Link>

                    <div className="sales-nav-links">
                        <Link to="/home" className="sales-nav-link">Home</Link>
                        <Link to="/orders" className="sales-nav-link">My Orders</Link>
                        <Link to="/sales" className="sales-nav-link active">Sales Portal</Link>
                        <Link to="/profile" className="sales-nav-link">Profile</Link>
                    </div>

                    <div className="sales-nav-right">
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

            {/* Main Content Area */}
            <main className="sales-main-container">
                {/* Header Welcome & Key Metrics */}
                <div className="sales-hero-banner">
                    <div className="sales-hero-text">
                        <h1>Lender Portal</h1>
                        <p>
                            Manage your listed inventory, track active customer rentals, and list new gadgets to earn.
                        </p>
                    </div>

                    <div className="sales-quick-stats">
                        <div className="sales-stat-pill available">
                            <div className="stat-pill-header">
                                <span className="status-dot green"></span>
                                <span className="stat-label">Available</span>
                            </div>
                            <span className="stat-count">{availableCount}</span>
                        </div>
                        <div className="sales-stat-pill booked">
                            <div className="stat-pill-header">
                                <span className="status-dot red"></span>
                                <span className="stat-label">On Rent</span>
                            </div>
                            <span className="stat-count">{bookedCount}</span>
                        </div>
                        <div className="sales-stat-pill stopped">
                            <div className="stat-pill-header">
                                <span className="status-dot amber"></span>
                                <span className="stat-label">Paused</span>
                            </div>
                            <span className="stat-count">{stoppedCount}</span>
                        </div>
                    </div>
                </div>

                {/* MY LISTED ITEMS SECTION */}
                <section className="sales-section-card sales-listings-top">
                    <div className="listings-header">
                        <div>
                            <h3>Active Listings ({rentals.length})</h3>
                            <p>Devices currently in your inventory and their catalog visibility.</p>
                        </div>
                        <button
                            type="button"
                            className="btn-view-home"
                            onClick={() => navigate("/home")}
                        >
                            <span>View Public Catalog</span>
                            <i className="ri-arrow-right-line"></i>
                        </button>
                    </div>

                    <div className="sales-items-list">
                        {rentals.length === 0 ? (
                            <div className="no-items-placeholder">
                                <i className="ri-inbox-archive-line placeholder-icon"></i>
                                <h4>No listed items yet</h4>
                                <p>Use the form below to list your first gadget for rent.</p>
                            </div>
                        ) : (
                            rentals.map((item) => {
                                const currentStatus = item.status || "available";
                                return (
                                    <div key={item.id} className={`sales-item-row ${currentStatus}`}>
                                        <div className="sales-item-image-box">
                                            <img src={item.image} alt={item.title} className="sales-item-thumb" />
                                        </div>

                                        <div className="sales-item-details">
                                            <div className="item-title-row">
                                                <div>
                                                    <span className="item-category-tag">{item.category}</span>
                                                    <h4>{item.title}</h4>
                                                </div>
                                                <span className={`status-pill ${currentStatus}`}>
                                                    <span className={`status-dot ${currentStatus === "available" ? "green" : currentStatus === "booked" ? "red" : "amber"}`}></span>
                                                    {currentStatus === "booked" && "On Rent"}
                                                    {currentStatus === "available" && "Available"}
                                                    {currentStatus === "stopped" && "Paused"}
                                                </span>
                                            </div>

                                            <div className="item-meta-line">
                                                <span className="meta-tag price">
                                                    <strong>₹{item.dailyRate}</strong> <small>/ day</small>
                                                </span>
                                                <span className="meta-tag">
                                                    <i className="ri-shield-check-line"></i>
                                                    Deposit: ₹{item.securityDeposit}
                                                </span>
                                                <span className="meta-tag">
                                                    <i className="ri-map-pin-line"></i>
                                                    {item.city} ({item.area})
                                                </span>
                                                {item.ownerName && (
                                                    <span className="meta-tag">
                                                        <i className="ri-user-3-line"></i>
                                                        {item.ownerName}
                                                    </span>
                                                )}
                                            </div>

                                            {item.specs && <p className="item-specs-text">{item.specs}</p>}

                                            {/* Clean context subtext */}
                                            {currentStatus === "booked" && (
                                                <div className="status-notice-banner booked" style={{ backgroundColor: "#fef3c7", border: "1.5px solid #f59e0b", color: "#92400e", padding: "10px 14px", borderRadius: "6px", margin: "10px 0" }}>
                                                    <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                                                        <i className="ri-store-2-line"></i>
                                                        <span>Action Required: Please Give Your Product in Store</span>
                                                    </div>
                                                    <div style={{ fontSize: "12.5px", lineHeight: "1.5" }}>
                                                        A customer has booked this gadget! Please drop off your product at our Central Store Hub (Shop #4, Powerpet Main Road, Eluru) for quality check and customer collection.
                                                    </div>
                                                </div>
                                            )}
                                            {currentStatus === "stopped" && (
                                                <div className="status-notice-banner stopped">
                                                    <i className="ri-pause-circle-line"></i>
                                                    <span>Listing paused. Hidden from search catalog.</span>
                                                </div>
                                            )}

                                            {/* Action Control Buttons */}
                                            <div className="sales-item-actions">
                                                {currentStatus === "booked" && (
                                                    <button
                                                        type="button"
                                                        className="btn-action-return"
                                                        onClick={() => handleMarkReturned(item.id)}
                                                        title="Mark device returned and make available again"
                                                    >
                                                        <i className="ri-check-line"></i>
                                                        <span>Mark as Returned</span>
                                                    </button>
                                                )}

                                                {currentStatus === "available" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-action-stop"
                                                            onClick={() => handleToggleStop(item.id)}
                                                            title="Temporarily pause listing"
                                                        >
                                                            <i className="ri-pause-line"></i>
                                                            <span>Pause Listing</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action-simulate"
                                                            onClick={() => handleSimulateBooked(item.id)}
                                                            title="Simulate a customer booking for testing"
                                                        >
                                                            <i className="ri-flask-line"></i>
                                                            <span>Simulate Rental</span>
                                                        </button>
                                                    </>
                                                )}

                                                {currentStatus === "stopped" && (
                                                    <button
                                                        type="button"
                                                        className="btn-action-resume"
                                                        onClick={() => handleToggleStop(item.id)}
                                                        title="Reactivate listing in public catalog"
                                                    >
                                                        <i className="ri-play-line"></i>
                                                        <span>Resume Listing</span>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn-action-delete"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    title="Remove item"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* UPLOAD ITEM FORM */}
                <section className="sales-section-card sales-upload-bottom">
                    <div className="form-card-header">
                        <div className="form-header-badge">Listing Studio</div>
                        <h3>List a New Gadget</h3>
                        <p>Fill in device specifications and rental pricing to publish to the Eluru rental catalog.</p>
                    </div>

                    <form onSubmit={handleUploadItem} className="sales-upload-form">
                        <div className="form-full-row">
                            <label>Gadget Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Dell Inspiron 15 Core i5 Laptop"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-two-col">
                            <div>
                                <label>Category *</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="Laptops">Laptops</option>
                                    <option value="Cameras">Cameras</option>
                                    <option value="Projectors">Projectors</option>
                                    <option value="Speakers">Speakers & Audio</option>
                                    <option value="Electronics">Electronics & TV</option>
                                </select>
                            </div>

                            <div>
                                <label>Daily Rent (₹/day) *</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 150"
                                    value={dailyRate}
                                    onChange={(e) => setDailyRate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-two-col">
                            <div>
                                <label>Refundable Deposit (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 1500"
                                    value={securityDeposit}
                                    onChange={(e) => setSecurityDeposit(e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Location / Store Hub</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Eluru (Powerpet)"
                                    value={`${city} (${area})`}
                                    onChange={(e) => setArea(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-two-col">
                            <div>
                                <label>Owner / Contact Name</label>
                                <input
                                    type="text"
                                    placeholder="Subba Rao"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Contact Phone</label>
                                <input
                                    type="text"
                                    placeholder="+91 94401 23456"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Device Photo Upload */}
                        <div className="form-full-row photo-upload-container">
                            <label className="photo-section-label">Device Photos</label>
                            <p className="photo-section-sub">Upload clear photos from your device or paste a web image link.</p>

                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileUpload}
                                id="sales-device-file-input"
                                style={{ display: "none" }}
                            />

                            {activeImagePreview ? (
                                <div className="photo-preview-card">
                                    <img
                                        src={activeImagePreview}
                                        alt="Preview"
                                        className="preview-image-thumb"
                                    />
                                    <div className="preview-details">
                                        <div className="preview-status-pill">
                                            <i className="ri-checkbox-circle-fill"></i> Photo Ready
                                        </div>
                                        <p className="preview-filename">
                                            {uploadedFileName || (imageUrlInput.length > 45 ? `${imageUrlInput.slice(0, 42)}...` : imageUrlInput) || "Selected Photo"}
                                        </p>
                                        <div className="preview-action-row">
                                            <button
                                                type="button"
                                                className="btn-change-photo"
                                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                            >
                                                Change
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-remove-photo"
                                                onClick={handleRemovePhoto}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="photo-upload-dropzone">
                                    <label htmlFor="sales-device-file-input" className="dropzone-clickable-area">
                                        <i className="ri-upload-cloud-2-line dropzone-icon"></i>
                                        <div className="dropzone-main-text">Upload photo from device</div>
                                        <div className="dropzone-sub-text">PNG, JPG, or WEBP up to 10MB</div>
                                        <button
                                            type="button"
                                            className="btn-browse-device"
                                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                        >
                                            <i className="ri-folder-open-line"></i>
                                            <span>Select File</span>
                                        </button>
                                    </label>

                                    <div className="dropzone-divider">
                                        <span>OR PASTE IMAGE URL</span>
                                    </div>

                                    <div className="url-input-wrapper">
                                        <input
                                            type="url"
                                            placeholder="https://images.unsplash.com/... or paste image URL"
                                            value={imageUrlInput}
                                            onChange={(e) => {
                                                setImageUrlInput(e.target.value);
                                                setUploadedPhoto("");
                                                setUploadedFileName("");
                                            }}
                                            className="photo-url-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-full-row">
                            <label>Specifications & Inclusions</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. 16GB RAM, 512GB SSD, original charger and carry bag included. Condition: like new."
                                value={specs}
                                onChange={(e) => setSpecs(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-submit-row">
                            <button type="submit" className="btn-upload-submit">
                                <i className="ri-add-line"></i>
                                <span>Publish Listing</span>
                            </button>
                        </div>
                    </form>
                </section>
            </main>

            {/* Notification Toast */}
            {toastMessage && (
                <div className="erenthub-toast">
                    <i className="ri-information-fill"></i>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
