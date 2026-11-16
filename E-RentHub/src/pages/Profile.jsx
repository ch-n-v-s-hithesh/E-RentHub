
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import ProfileDropdown from "./ProfileDropdown";
import "./Profile.css";

const INITIAL_GIVEN_RENTALS = [
    {
        id: 991,
        title: "Dell Latitude Business Laptop Core i5",
        category: "Laptops",
        dailyRate: 99,
        monthlyRate: 2800,
        city: "Eluru",
        area: "Powerpet, Near Fire Station",
        status: "Active / Rented Out",
        earned: "₹ 1,980",
        renter: "Ramesh Kumar (7 Days Active)",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
        createdAt: "24 Apr 2025",
    },
    {
        id: 992,
        title: "Canon EOS 1500D DSLR Camera Kit",
        category: "Cameras",
        dailyRate: 129,
        monthlyRate: 3600,
        city: "Eluru",
        area: "Powerpet",
        status: "Available for Rent",
        earned: "₹ 1,290",
        renter: "Ready for next booking",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        createdAt: "22 Apr 2025",
    },
];

const CATEGORY_DEFAULT_IMAGES = {
    Laptops: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    Cameras: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
    Projectors: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80",
    "Sound Boxes": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
    "Other Electronics": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
};

export default function Profile() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("details");

    const [cartCount] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_cart");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed.length;
            }
        } catch (e) { }
        return 0;
    });

    const [givenRentals, setGivenRentals] = useState(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("erenthub_user_rentals") || "[]"
            );
            if (Array.isArray(saved) && saved.length > 0) return saved;
        } catch (error) {
            console.error(error);
        }
        return INITIAL_GIVEN_RENTALS;
    });

    // Profile details dynamically loaded from registered user profile or session
    const [name, setName] = useState(() => {
        try {
            const p = JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
            const u = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            return p.name || u.name || "Balu Hithesh";
        } catch (e) { return "Balu Hithesh"; }
    });
    const [email, setEmail] = useState(() => {
        try {
            const p = JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
            const u = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            return p.email || u.email || "balue.hithesh@gmail.com";
        } catch (e) { return "balue.hithesh@gmail.com"; }
    });
    const [phone, setPhone] = useState(() => {
        try {
            const p = JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
            const u = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            return p.phone || u.phone || "+91 73963 48793";
        } catch (e) { return "+91 73963 48793"; }
    });
    const [address, setAddress] = useState(() => {
        try {
            const p = JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
            const u = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            return p.address || u.address || "Powerpet Main Road, Eluru - 534002";
        } catch (e) { return "Powerpet Main Road, Eluru - 534002"; }
    });
    const [city, setCity] = useState(() => {
        try {
            const p = JSON.parse(localStorage.getItem("erenthub_user_profile") || "{}");
            const u = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            return p.city || u.city || "Eluru";
        } catch (e) { return "Eluru"; }
    });
    const [stateName, setStateName] = useState("Andhra Pradesh");
    const [pincode, setPincode] = useState("534002");

    // Password details
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Toast
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3500);
    };

    // Save profile
    const handleSaveProfile = (e) => {
        e.preventDefault();

        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || name.trim();
        const lastName = nameParts.slice(1).join(" ") || "";

        const profileData = {
            name: name.trim(),
            firstName,
            lastName,
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            stateName,
            pincode,
            role: localStorage.getItem("erenthub_user_role") || "customer",
        };

        localStorage.setItem("erenthub_user_profile", JSON.stringify(profileData));

        try {
            const currentU = JSON.parse(localStorage.getItem("erenthub_user") || "{}");
            localStorage.setItem("erenthub_user", JSON.stringify({
                ...currentU,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                address: address.trim(),
                city: city.trim(),
            }));

            fetch("http://localhost:5000/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    address: address.trim(),
                    city: city.trim(),
                }),
            }).catch(() => {});
        } catch (err) { }

        showToast("Profile details updated successfully!");
    };

    // Change password
    const handleChangePassword = (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New Password and Confirm Password do not match!");
            return;
        }

        if (newPassword.length < 6) {
            alert("New Password must be at least 6 characters long.");
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        showToast("Password updated successfully!");
    };

    // Save rental list
    const saveRentals = (updated) => {
        setGivenRentals(updated);

        try {
            localStorage.setItem(
                "erenthub_user_rentals",
                JSON.stringify(updated)
            );
        } catch (error) {
            console.error("Unable to save rentals:", error);
            showToast("Unable to save rental changes.");
        }
    };

    // Toggle rental status
    const handleToggleStatus = (id) => {
        const updated = givenRentals.map((item) => {
            if (item.id === id) {
                const newStatus = item.status?.includes("Rented")
                    ? "Available for Rent"
                    : "Active / Rented Out";

                return { ...item, status: newStatus };
            }
            return item;
        });

        saveRentals(updated);
        showToast("Rental item status updated successfully!");
    };

    // Delete rental
    const handleDeleteRental = (id, title) => {
        if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
            const updated = givenRentals.filter(
                (item) => item.id !== id
            );

            saveRentals(updated);

            try {
                const existingDeleted = JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]");
                const newDeleted = Array.from(new Set([...existingDeleted, String(id).toLowerCase().trim(), String(title).toLowerCase().trim()]));
                localStorage.setItem("erenthub_deleted_product_ids", JSON.stringify(newDeleted));
            } catch (e) { }

            showToast(`Listing "${title}" removed.`);
        }
    };

    // Rental modal
    const [showRentModal, setShowRentModal] = useState(false);
    const [rentItemTitle, setRentItemTitle] = useState("");
    const [rentItemCategory, setRentItemCategory] = useState("Laptops");
    const [rentItemOwner, setRentItemOwner] = useState("Hithesh Chaluvadi");
    const [rentItemDailyRate, setRentItemDailyRate] = useState("");
    const [rentItemArea, setRentItemArea] = useState("Powerpet, Eluru");
    const [rentItemSpecs, setRentItemSpecs] = useState("");
    const [rentItemPhotoPreview, setRentItemPhotoPreview] = useState("");

    // Photo upload
    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Please select an image under 5MB.");
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setRentItemPhotoPreview(reader.result);
        };

        reader.readAsDataURL(file);
    };

    // Submit new rental
    const handleRentItemSubmit = (e) => {
        e.preventDefault();

        if (!rentItemTitle.trim() || !rentItemDailyRate) {
            alert("Please enter item name and daily rental rate.");
            return;
        }

        const rate = Number(rentItemDailyRate);

        if (!Number.isFinite(rate) || rate < 10) {
            alert("Daily rental rate must be at least ₹10.");
            return;
        }

        const finalImage =
            rentItemPhotoPreview ||
            CATEGORY_DEFAULT_IMAGES[rentItemCategory] ||
            CATEGORY_DEFAULT_IMAGES.Laptops;

        const newItem = {
            id: Date.now(),
            title: rentItemTitle.trim(),
            category: rentItemCategory,
            dailyRate: rate,
            monthlyRate: Math.round(rate * 28),
            city: city || "Eluru",
            area: rentItemArea.trim() || "Powerpet, Eluru",
            status: "Available for Rent",
            earned: "₹ 0",
            renter: "Ready for booking",
            image: finalImage,
            createdAt: new Date().toLocaleDateString("en-IN"),
            ownerName: rentItemOwner.trim() || name,
            specs: rentItemSpecs.trim(),
        };

        const updated = [newItem, ...givenRentals];

        saveRentals(updated);

        showToast(`"${newItem.title}" added successfully!`);

        setShowRentModal(false);
        setRentItemTitle("");
        setRentItemDailyRate("");
        setRentItemSpecs("");
        setRentItemPhotoPreview("");
        setActiveTab("rentals");
    };

    const totalEarnings = givenRentals.reduce((total, item) => {
        const amount = Number(
            String(item.earned || "0").replace(/[₹,\s]/g, "")
        );
        return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const rentedCount = givenRentals.filter(
        (item) => item.status?.includes("Rented")
    ).length;

    return (
        <div
            className="erenthub-home"
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* Navbar */}
            <header className="products-navbar">
                <div className="navbar-brand-left">
                    <Link to="/home" className="products-logo" title="E-RentHub">
                        <img
                            src={logo}
                            alt="E-RentHub Logo"
                            className="navbar-logo-img"
                        />
                        <span className="products-logo-text">
                            E-Rent<span>Hub</span>
                        </span>
                    </Link>
                </div>

                <nav className="orders-nav-links">
                    <Link to="/home" className="orders-nav-link">
                        Home
                    </Link>
                    <Link to="/orders" className="orders-nav-link">
                        My Orders
                    </Link>
                    <Link to="/sales" className="orders-nav-link sales-portal-link">
                        Sales Portal
                    </Link>
                    <Link to="/profile" className="orders-nav-link active">
                        Profile
                    </Link>
                </nav>

                <div className="navbar-actions-right">
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
            </header>

            {/* Main Content */}
            <main style={{
                maxWidth: "1100px",
                width: "90%",
                margin: "30px auto 50px",
                flex: 1
            }}>

                <div style={{ marginBottom: "20px" }}>
                    <h1 style={{
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "#0f172a",
                        margin: "0 0 6px"
                    }}>
                        My Profile Dashboard
                    </h1>

                    <p style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: 0
                    }}>
                        Manage your personal details, residential address,
                        rental items and account security.
                    </p>
                </div>

                {/* Toast Message */}
                {toastMessage && (
                    <div style={{
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        color: "#065f46",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}>
                        <i className="ri-check-line"></i> {toastMessage}
                    </div>
                )}

                {/* Two Column Layout */}
                <div style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    alignItems: "flex-start"
                }}>

                    {/* LEFT SIDEBAR */}
                    <aside style={{
                        flex: "1 1 250px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "24px",
                        textAlign: "center"
                    }}>

                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "#2563eb",
                            color: "#ffffff",
                            fontSize: "32px",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 14px"
                        }}>
                            {name.charAt(0).toUpperCase()}
                        </div>

                        <h2 style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#0f172a",
                            margin: "0 0 4px"
                        }}>
                            {name}
                        </h2>

                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#dbeafe",
                            color: "#1e40af",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            marginBottom: "16px"
                        }}>
                            <i className="ri-checkbox-circle-line"></i> Verified Customer
                        </span>

                        {/* Statistics */}
                        <div style={{
                            borderTop: "1px solid #f1f5f9",
                            borderBottom: "1px solid #f1f5f9",
                            padding: "14px 0",
                            margin: "10px 0",
                            display: "flex",
                            justifyContent: "space-around"
                        }}>

                            <div
                                onClick={() => setActiveTab("rentals")}
                                style={{ cursor: "pointer" }}
                            >
                                <span style={{
                                    fontSize: "20px",
                                    fontWeight: "800",
                                    color: "#2563eb",
                                    display: "block"
                                }}>
                                    {givenRentals.length}
                                </span>

                                <span style={{
                                    fontSize: "12px",
                                    color: "#64748b"
                                }}>
                                    Given on Rent
                                </span>
                            </div>

                            <div style={{
                                borderLeft: "1px solid #f1f5f9"
                            }} />

                            <div
                                onClick={() => navigate("/orders")}
                                style={{ cursor: "pointer" }}
                            >
                                <span style={{
                                    fontSize: "20px",
                                    fontWeight: "800",
                                    color: "#16a34a",
                                    display: "block"
                                }}>
                                    5
                                </span>

                                <span style={{
                                    fontSize: "12px",
                                    color: "#64748b"
                                }}>
                                    Total Orders
                                </span>
                            </div>
                        </div>

                        {/* Sidebar Buttons */}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            marginTop: "14px"
                        }}>

                            <button
                                type="button"
                                style={sidebarPrimary}
                                onClick={() => navigate("/orders")}
                            >
                                <i className="ri-inbox-archive-line" /> View Orders
                            </button>

                            <button
                                type="button"
                                style={sidebarSecondary}
                                onClick={() => navigate("/sales")}
                            >
                                <i className="ri-store-2-line" /> Sales Portal (Upload Items)
                            </button>

                            <button
                                type="button"
                                style={sidebarSecondary}
                                onClick={() => navigate("/home")}
                            >
                                <i className="ri-home-4-line" /> Explore Electronics
                            </button>
                        </div>

                    </aside>

                    {/* RIGHT CONTENT */}
                    <section style={{
                        flex: "2 1 450px",
                        minWidth: 0,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "24px"
                    }}>

                        {/* Tabs */}
                        <div style={{
                            display: "flex",
                            gap: "10px",
                            borderBottom: "2px solid #f1f5f9",
                            paddingBottom: "12px",
                            marginBottom: "20px",
                            flexWrap: "wrap"
                        }}>

                            {[
                                ["details", "Personal & Address", "ri-user-settings-line"],
                                ["rentals", "Items Given for Rent", "ri-hand-coin-line"],
                                ["password", "Change Password", "ri-lock-password-line"]
                            ].map(([tab, label, icon]) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: "8px 12px",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontWeight: "700",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                        background: activeTab === tab ? "#2563eb" : "#f1f5f9",
                                        color: activeTab === tab ? "#ffffff" : "#475569"
                                    }}
                                >
                                    <i className={icon} /> {label}
                                    {tab === "rentals" && ` (${givenRentals.length})`}
                                </button>
                            ))}

                        </div>

                        {/* PERSONAL DETAILS */}
                        {activeTab === "details" && (
                            <form onSubmit={handleSaveProfile}>

                                <h3 style={sectionHeading}>Basic Information</h3>

                                <div style={formRow}>
                                    <FormField label="Full Name">
                                        <input
                                            style={inputStyle}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Email Address">
                                        <input
                                            style={inputStyle}
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Phone Number">
                                    <input
                                        style={inputStyle}
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <h3 style={sectionHeading}>
                                    Residential Address & Location
                                </h3>

                                <FormField label="Street Address / House No.">
                                    <input
                                        style={inputStyle}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <div style={formRow}>
                                    <FormField label="City">
                                        <input
                                            style={inputStyle}
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                        />
                                    </FormField>

                                    <FormField label="State">
                                        <input
                                            style={inputStyle}
                                            value={stateName}
                                            onChange={(e) => setStateName(e.target.value)}
                                            required
                                        />
                                    </FormField>

                                    <FormField label="PIN Code">
                                        <input
                                            style={inputStyle}
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            required
                                        />
                                    </FormField>
                                </div>

                                <div style={submitRow}>
                                    <button type="submit" style={primaryButton}>
                                        Save Address & Profile Details
                                    </button>
                                </div>

                            </form>
                        )}

                        {/* CHANGE PASSWORD */}
                        {activeTab === "password" && (
                            <form onSubmit={handleChangePassword}>

                                <h3 style={sectionHeading}>
                                    Account Security & Password
                                </h3>

                                <p style={{ fontSize: "13px", color: "#64748b" }}>
                                    Choose a strong password with at least 6 characters.
                                </p>

                                <FormField label="Current Password">
                                    <input
                                        style={inputStyle}
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <FormField label="New Password">
                                    <input
                                        style={inputStyle}
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <FormField label="Confirm New Password">
                                    <input
                                        style={inputStyle}
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <div style={submitRow}>
                                    <button type="submit" style={primaryButton}>
                                        Update Password
                                    </button>
                                </div>

                            </form>
                        )}

                        {/* RENTALS */}
                        {activeTab === "rentals" && (
                            <div>

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                    marginBottom: "18px"
                                }}>
                                    <div>
                                        <h3 style={sectionHeading}>
                                            Devices Given / Listed for Rent
                                        </h3>
                                        <p style={{
                                            fontSize: "13px",
                                            color: "#64748b"
                                        }}>
                                            Manage your listed electronics and rental bookings.
                                        </p>
                                    </div>
                                </div>

                                {/* Rental Statistics */}
                                <div style={formRow}>

                                    <StatCard
                                        title="Listed Devices"
                                        value={`${givenRentals.length} Items`}
                                    />

                                    <StatCard
                                        title="Currently Rented"
                                        value={`${rentedCount} Active`}
                                    />

                                    <StatCard
                                        title="Total Earnings"
                                        value={`₹ ${totalEarnings.toLocaleString("en-IN")}`}
                                    />

                                </div>

                                {/* Rental List */}
                                {givenRentals.length === 0 ? (

                                    <div style={{
                                        textAlign: "center",
                                        padding: "40px 20px",
                                        background: "#f8fafc",
                                        borderRadius: "10px"
                                    }}>
                                        <i className="ri-hand-coin-line"
                                            style={{ fontSize: "40px", color: "#94a3b8" }}
                                        />

                                        <h4>You haven't listed any devices yet.</h4>

                                        <button
                                            type="button"
                                            onClick={() => setShowRentModal(true)}
                                            style={primaryButton}
                                        >
                                            Give First Device on Rent
                                        </button>
                                    </div>

                                ) : (

                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px"
                                    }}>

                                        {givenRentals.map((item) => {

                                            const isRented = item.status?.includes("Rented");

                                            return (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        display: "flex",
                                                        gap: "16px",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "10px",
                                                        padding: "14px",
                                                        alignItems: "center",
                                                        flexWrap: "wrap"
                                                    }}
                                                >

                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        style={{
                                                            width: "80px",
                                                            height: "80px",
                                                            objectFit: "cover",
                                                            borderRadius: "8px"
                                                        }}
                                                    />

                                                    <div style={{ flex: "2 1 180px" }}>

                                                        <span style={{
                                                            fontSize: "11px",
                                                            background: "#f1f5f9",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px"
                                                        }}>
                                                            {item.category}
                                                        </span>

                                                        <h4 style={{
                                                            fontSize: "15px",
                                                            color: "#0f172a"
                                                        }}>
                                                            {item.title}
                                                        </h4>

                                                        <p style={{
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            <i className="ri-map-pin-line" />
                                                            {" "}{item.city} - {item.area}
                                                        </p>

                                                        <p style={{
                                                            fontSize: "12px",
                                                            color: "#15803d"
                                                        }}>
                                                            {item.renter}
                                                        </p>

                                                        <span style={{
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            color: isRented ? "#15803d" : "#1e40af"
                                                        }}>
                                                            ● {item.status}
                                                        </span>

                                                    </div>

                                                    <div style={{
                                                        textAlign: "right",
                                                        flex: "1 1 140px"
                                                    }}>

                                                        <strong style={{
                                                            fontSize: "17px",
                                                            color: "#16a34a"
                                                        }}>
                                                            ₹ {item.dailyRate}/day
                                                        </strong>

                                                        <p style={{
                                                            fontSize: "12px",
                                                            color: "#64748b"
                                                        }}>
                                                            Earned: {item.earned || "₹ 0"}
                                                        </p>

                                                        <div style={{
                                                            display: "flex",
                                                            gap: "6px",
                                                            justifyContent: "flex-end",
                                                            flexWrap: "wrap"
                                                        }}>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleStatus(item.id)}
                                                                style={smallButton}
                                                            >
                                                                {isRented ? "Mark Available" : "Mark Rented"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteRental(item.id, item.title)}
                                                                style={{
                                                                    ...smallButton,
                                                                    color: "#dc2626",
                                                                    background: "#fef2f2"
                                                                }}
                                                            >
                                                                <i className="ri-delete-bin-line" />
                                                            </button>

                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>
                                )}

                            </div>
                        )}

                    </section>

                </div>
            </main>

            {/* GIVE ITEM ON RENT MODAL */}
            {showRentModal && (
                <div
                    className="profile-modal-overlay"
                    onClick={() => setShowRentModal(false)}
                >
                    <div
                        className="profile-modal-box"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "560px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            borderRadius: "12px",
                            padding: "24px",
                            background: "#ffffff"
                        }}
                    >

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "18px"
                        }}>
                            <h3>List Device for Rent</h3>

                            <button
                                type="button"
                                onClick={() => setShowRentModal(false)}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "20px"
                                }}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <form
                            onSubmit={handleRentItemSubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "14px"
                            }}
                        >

                            <FormField label="Choice of Item (Category)">
                                <select
                                    style={inputStyle}
                                    value={rentItemCategory}
                                    onChange={(e) => setRentItemCategory(e.target.value)}
                                >
                                    <option value="Laptops">Laptop / Notebook</option>
                                    <option value="Cameras">Camera / DSLR Kit</option>
                                    <option value="Projectors">Projector</option>
                                    <option value="Sound Boxes">Sound Box</option>
                                    <option value="Other Electronics">Other Electronics</option>
                                </select>
                            </FormField>

                            <FormField label="Device Title / Model Name">
                                <input
                                    style={inputStyle}
                                    value={rentItemTitle}
                                    onChange={(e) => setRentItemTitle(e.target.value)}
                                    placeholder="e.g. Dell Latitude Core i5"
                                    required
                                />
                            </FormField>

                            <div style={formRow}>

                                <FormField label="Owner Name">
                                    <input
                                        style={inputStyle}
                                        value={rentItemOwner}
                                        onChange={(e) => setRentItemOwner(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <FormField label="Daily Rate (₹)">
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min="10"
                                        value={rentItemDailyRate}
                                        onChange={(e) => setRentItemDailyRate(e.target.value)}
                                        placeholder="149"
                                        required
                                    />
                                </FormField>

                            </div>

                            <FormField label="Pickup & Delivery Area">
                                <input
                                    style={inputStyle}
                                    value={rentItemArea}
                                    onChange={(e) => setRentItemArea(e.target.value)}
                                    placeholder="Powerpet, Eluru"
                                />
                            </FormField>

                            <FormField label="Specifications / Condition">
                                <textarea
                                    style={{ ...inputStyle, minHeight: "70px" }}
                                    value={rentItemSpecs}
                                    onChange={(e) => setRentItemSpecs(e.target.value)}
                                    placeholder="Device specifications and condition"
                                />
                            </FormField>

                            {/* Photo Upload */}
                            <FormField label="Upload Item Photo">
                                <input
                                    style={inputStyle}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </FormField>

                            {rentItemPhotoPreview && (
                                <div>
                                    <img
                                        src={rentItemPhotoPreview}
                                        alt="Preview"
                                        style={{
                                            width: "120px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "8px"
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setRentItemPhotoPreview("")}
                                        style={smallButton}
                                    >
                                        Remove Photo
                                    </button>
                                </div>
                            )}

                            {!rentItemPhotoPreview && (
                                <p style={{
                                    fontSize: "12px",
                                    color: "#64748b"
                                }}>
                                    A default category image will be used if no photo is uploaded.
                                </p>
                            )}

                            {rentItemDailyRate && Number(rentItemDailyRate) >= 10 && (
                                <div style={{
                                    background: "#f0fdf4",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    color: "#15803d"
                                }}>
                                    Estimated Monthly Earnings:
                                    <strong>
                                        {" "}₹ {(Number(rentItemDailyRate) * 28).toLocaleString("en-IN")}
                                    </strong>
                                </div>
                            )}

                            <div style={{
                                display: "flex",
                                gap: "10px"
                            }}>

                                <button
                                    type="button"
                                    onClick={() => setShowRentModal(false)}
                                    style={cancelButton}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    style={primaryButton}
                                >
                                    <i className="ri-check-line" /> List Device for Rent
                                </button>

                            </div>

                        </form>

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

        </div>
    );
}

// Reusable components
function FormField({ label, children }) {
    return (
        <div style={{ flex: "1 1 150px", marginBottom: "14px" }}>
            <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
            }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div style={{
            flex: "1 1 120px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px"
        }}>
            <span style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: "700",
                textTransform: "uppercase"
            }}>
                {title}
            </span>

            <strong style={{
                display: "block",
                fontSize: "17px",
                marginTop: "5px",
                color: "#0f172a"
            }}>
                {value}
            </strong>
        </div>
    );
}

// Common styles
const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "13px",
    boxSizing: "border-box"
};

const formRow = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
};

const sectionHeading = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "14px 0"
};

const submitRow = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "18px"
};

const primaryButton = {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px"
};

const sidebarPrimary = {
    ...primaryButton,
    width: "100%"
};

const sidebarSecondary = {
    ...primaryButton,
    width: "100%",
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1"
};

const smallButton = {
    padding: "6px 9px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    borderRadius: "5px",
    fontSize: "11px",
    cursor: "pointer"
};

const cancelButton = {
    ...primaryButton,
    flex: 1,
    background: "#f1f5f9",
    color: "#334155"
};
