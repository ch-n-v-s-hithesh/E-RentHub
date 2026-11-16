import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./SalesDashboard.css";

const INITIAL_LEADS = [
    {
        id: "LEAD-101",
        customerName: "Vikram Tech Solutions",
        contactPerson: "Arjun Verma",
        phone: "+91 98450 12345",
        email: "arjun@vikramtech.io",
        category: "Laptops",
        itemRequested: "Apple MacBook Pro M2 (16GB RAM)",
        units: 3,
        durationDays: 30,
        estimatedValue: 17910,
        status: "New Inquiry",
        date: "Today, 11:30 AM",
    },
    {
        id: "LEAD-102",
        customerName: "Aura Cinematography",
        contactPerson: "Pooja Reddy",
        phone: "+91 97001 88231",
        email: "pooja@auracinema.in",
        category: "Cameras",
        itemRequested: "Sony Alpha A7 IV Full-Frame Camera",
        units: 2,
        durationDays: 7,
        estimatedValue: 4886,
        status: "Quote Sent",
        date: "Yesterday",
    },
    {
        id: "LEAD-103",
        customerName: "Hyderabad Tech Summit",
        contactPerson: "Karthik Raju",
        phone: "+91 91234 56789",
        email: "events@hydtechsummit.org",
        category: "Projectors",
        itemRequested: "Epson 4K PRO-UHD Home Cinema Projector",
        units: 4,
        durationDays: 4,
        estimatedValue: 5584,
        status: "KYC Verified",
        date: "Oct 20, 2026",
    },
    {
        id: "LEAD-104",
        customerName: "Pulse Beats DJ & Sound",
        contactPerson: "Rohan Das",
        phone: "+91 99887 76655",
        email: "rohan@pulsebeats.com",
        category: "Sound Boxes",
        itemRequested: "JBL PartyBox 310 High Power Portable Speaker",
        units: 3,
        durationDays: 3,
        estimatedValue: 2691,
        status: "New Inquiry",
        date: "Oct 20, 2026",
    },
    {
        id: "LEAD-105",
        customerName: "DesignCrafters Studio",
        contactPerson: "Sneha Nair",
        phone: "+91 94455 66778",
        email: "sneha@designcrafters.com",
        category: "Laptops",
        itemRequested: "Gaming i5-11thGen 6GB-4GB Graphics Laptop",
        units: 2,
        durationDays: 14,
        estimatedValue: 5012,
        status: "Quote Sent",
        date: "Oct 19, 2026",
    },
    {
        id: "LEAD-106",
        customerName: "Horizon Wedding Studio",
        contactPerson: "Manish Kumar",
        phone: "+91 90001 22334",
        email: "manish@horizonstudio.com",
        category: "Cameras",
        itemRequested: "Canon EOS R6 Mark II Mirrorless Camera",
        units: 1,
        durationDays: 5,
        estimatedValue: 1995,
        status: "KYC Verified",
        date: "Oct 18, 2026",
    },
];

const AVAILABLE_DEVICES = [
    { name: "Gaming i5-11thGen 6GB-4GB Graphics Laptop", category: "Laptops", dailyPrice: 179 },
    { name: "Apple MacBook Pro M2 (16GB RAM, 512GB SSD)", category: "Laptops", dailyPrice: 199 },
    { name: "Windows i7 8thGen-16GB Laptop", category: "Laptops", dailyPrice: 129 },
    { name: "Sony Alpha A7 IV Full-Frame Camera", category: "Cameras", dailyPrice: 349 },
    { name: "Canon EOS R6 Mark II Mirrorless Camera", category: "Cameras", dailyPrice: 399 },
    { name: "Epson 4K PRO-UHD Home Cinema Projector", category: "Projectors", dailyPrice: 349 },
    { name: "BenQ Full HD 1080p Business Projector", category: "Projectors", dailyPrice: 229 },
    { name: "JBL PartyBox 310 High Power Portable Speaker", category: "Sound Boxes", dailyPrice: 299 },
    { name: "Sony SRS-XG500 Mega Bass Wireless Boombox", category: "Sound Boxes", dailyPrice: 249 },
];

export default function SalesDashboard() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState(() => {
        try {
            const saved = localStorage.getItem("erenthub_leads");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { }
        return INITIAL_LEADS;
    });

    useEffect(() => {
        try {
            localStorage.setItem("erenthub_leads", JSON.stringify(leads));
        } catch (e) { }
    }, [leads]);

    const [activeTab, setActiveTab] = useState("leads"); // 'leads' | 'renewals' | 'quote'
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    // Quick Booking Modal State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
    const [bookingDays, setBookingDays] = useState(7);

    // Quote Generator State
    const [quoteDeviceIndex, setQuoteDeviceIndex] = useState(0);
    const [quoteUnits, setQuoteUnits] = useState(1);
    const [quoteDays, setQuoteDays] = useState(14);
    const [quoteDiscount, setQuoteDiscount] = useState(10);
    const [quoteGenerated, setQuoteGenerated] = useState(false);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3500);
    };

    // Filtered Leads
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesCategory = categoryFilter === "ALL" || lead.category === categoryFilter;
            const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                lead.customerName.toLowerCase().includes(q) ||
                lead.contactPerson.toLowerCase().includes(q) ||
                lead.itemRequested.toLowerCase().includes(q) ||
                lead.id.toLowerCase().includes(q);
            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [leads, categoryFilter, statusFilter, searchQuery]);

    // Handle Lead Status Updates
    const handleUpdateStatus = (leadId, nextStatus) => {
        setLeads((prev) =>
            prev.map((lead) => (lead.id === leadId ? { ...lead, status: nextStatus } : lead))
        );
        showToast(`Lead ${leadId} updated to "${nextStatus}"`);
    };

    // Handle Quick Booking Submit
    const handleCreateBooking = (e) => {
        e.preventDefault();
        if (!newClientName.trim() || !newClientPhone.trim()) {
            alert("Please provide customer name and phone.");
            return;
        }

        const device = AVAILABLE_DEVICES[selectedDeviceIndex];
        const total = device.dailyPrice * bookingDays;

        // Save order into localStorage so it reflects across Customer & Admin dashboards
        const newOrder = {
            id: `ORD-SALES-${Date.now().toString().slice(-4)}`,
            name: device.name,
            image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
            category: device.category,
            daysRented: bookingDays,
            dailyPrice: device.dailyPrice,
            totalPrice: total,
            deposit: 0,
            status: "CONFIRMED",
            statusColor: "status-blue",
            date: "Today",
            deliveryDate: "In 2 Days",
            customerName: newClientName,
            customerPhone: newClientPhone,
            badge: "Booked by Sales Rep",
        };

        try {
            const currentOrders = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
            localStorage.setItem("erenthub_orders", JSON.stringify([newOrder, ...currentOrders]));
        } catch (err) { }

        setShowBookingModal(false);
        setNewClientName("");
        setNewClientPhone("");
        setNewClientEmail("");
        showToast(`Booking successfully generated for ${newClientName}! Total: ₹${total.toLocaleString("en-IN")}`);
    };

    return (
        <div className="dashboard-container">
            {toastMessage && (
                <div className="erenthub-toast">
                    <i className="ri-check-line"></i>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Navigation Bar with Search Bar */}
            <header className="products-navbar">
                <div className="navbar-brand-left">
                    <div
                        onClick={() => navigate("/home")}
                        className="products-logo"
                        style={{ cursor: "pointer" }}
                        title="E-RentHub Home"
                    >
                        <img src={logo} alt="E-RentHub Logo" className="navbar-logo-img" />
                        <span className="products-logo-text">
                            E-Rent<span>Hub</span>
                        </span>
                    </div>
                </div>

                {/* Navbar Center: Search Bar */}
                <div className="navbar-search-center">
                    <div className="products-search-box">
                        <i className="ri-search-line"></i>
                        <input
                            type="text"
                            placeholder="Search leads, clients, laptops, cameras, projectors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search leads"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="products-search-clear"
                                onClick={() => setSearchQuery("")}
                                title="Clear search"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        )}
                        <button type="button" className="products-search-submit">
                            Search
                        </button>
                    </div>
                </div>

                <div className="navbar-actions-right">
                    {/* Dashboard Selector */}
                    <div className="navbar-dashboard-dropdown">
                        <select
                            className="navbar-role-select"
                            value="sales"
                            onChange={(e) => {
                                const newRole = e.target.value;
                                localStorage.setItem("erenthub_user_role", newRole);
                                if (newRole === "admin") navigate("/admin");
                                else if (newRole === "customer") navigate("/profile");
                            }}
                            title="Switch Dashboard"
                        >
                            <option value="customer">Customer View</option>
                            <option value="sales">Sales Portal</option>
                            <option value="admin">Admin Dashboard</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="navbar-cart-btn"
                        onClick={() => navigate("/cart")}
                        title="View Cart"
                    >
                        <i className="ri-shopping-cart-2-fill"></i>
                        <span>Cart</span>
                    </button>

                    <button
                        type="button"
                        className="navbar-profile-btn"
                        style={{ background: "#eff6ff", borderColor: "#2563eb", color: "#2563eb" }}
                        onClick={() => navigate("/profile")}
                        title="Customer Profile"
                    >
                        <i className="ri-user-3-line"></i>
                        <span>Customer View</span>
                    </button>
                </div>
            </header>

            {/* Sales Dashboard Hero Banner */}
            <div className="dashboard-top-hero">
                <div className="dashboard-hero-inner">
                    <div>
                        <span className="dashboard-badge-role">
                            <i className="ri-briefcase-4-line"></i> Sales Representative Desk
                        </span>
                        <h1 className="dashboard-hero-title">Sales Person Dashboard</h1>
                        <p className="dashboard-hero-subtitle">
                            Manage rental inquiries, client pipelines, instant quotes & bookings for Laptops, Cameras, Projectors, and Sound Boxes.
                        </p>
                    </div>
                    <div className="dashboard-hero-actions">
                        <button
                            type="button"
                            className="dashboard-action-btn-primary"
                            onClick={() => setShowBookingModal(true)}
                        >
                            <i className="ri-add-circle-line"></i> Create Quick Booking
                        </button>
                        <button
                            type="button"
                            className="dashboard-action-btn-secondary"
                            onClick={() => navigate("/home")}
                        >
                            <i className="ri-store-2-line"></i> Catalog
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="dashboard-main-content">
                {/* 4 Sales KPI Metrics */}
                <div className="dashboard-kpi-row">
                    <div className="dashboard-kpi-card">
                        <div>
                            <div className="kpi-label">Active Lead Pipeline</div>
                            <div className="kpi-value">{leads.length} Leads</div>
                            <div className="kpi-delta positive">
                                <i className="ri-arrow-up-line"></i> +4 new this morning
                            </div>
                        </div>
                        <div className="kpi-icon-wrap kpi-icon-blue">
                            <i className="ri-user-follow-line"></i>
                        </div>
                    </div>

                    <div className="dashboard-kpi-card">
                        <div>
                            <div className="kpi-label">Month-to-Date Volume</div>
                            <div className="kpi-value">₹2,84,500</div>
                            <div className="kpi-delta positive">
                                <i className="ri-arrow-up-line"></i> 18.2% vs target
                            </div>
                        </div>
                        <div className="kpi-icon-wrap kpi-icon-green">
                            <i className="ri-money-rupee-circle-line"></i>
                        </div>
                    </div>

                    <div className="dashboard-kpi-card">
                        <div>
                            <div className="kpi-label">Avg. Rental Tenure</div>
                            <div className="kpi-value">16.4 Days</div>
                            <div className="kpi-delta neutral">
                                <i className="ri-time-line"></i> High retention
                            </div>
                        </div>
                        <div className="kpi-icon-wrap kpi-icon-purple">
                            <i className="ri-calendar-check-line"></i>
                        </div>
                    </div>

                    <div className="dashboard-kpi-card">
                        <div>
                            <div className="kpi-label">Renewals Due This Week</div>
                            <div className="kpi-value">5 Clients</div>
                            <div className="kpi-delta positive">
                                <i className="ri-refresh-line"></i> High conversion
                            </div>
                        </div>
                        <div className="kpi-icon-wrap kpi-icon-amber">
                            <i className="ri-timer-flash-line"></i>
                        </div>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="dashboard-tabs-bar">
                    <button
                        type="button"
                        className={`dashboard-tab-btn ${activeTab === "leads" ? "active" : ""}`}
                        onClick={() => setActiveTab("leads")}
                    >
                        <i className="ri-user-shared-line"></i> Customer Inquiries & Leads
                        <span className="dashboard-tab-count">{filteredLeads.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`dashboard-tab-btn ${activeTab === "renewals" ? "active" : ""}`}
                        onClick={() => setActiveTab("renewals")}
                    >
                        <i className="ri-history-line"></i> Active Tenures & Extensions
                    </button>

                    <button
                        type="button"
                        className={`dashboard-tab-btn ${activeTab === "quote" ? "active" : ""}`}
                        onClick={() => setActiveTab("quote")}
                    >
                        <i className="ri-calculator-line"></i> Instant Quote Generator
                    </button>
                </div>

                {/* TAB 1: Leads Management */}
                {activeTab === "leads" && (
                    <div className="dashboard-card-panel">
                        <div className="panel-header-row">
                            <div>
                                <h2 className="panel-title">
                                    <i className="ri-contacts-book-line" style={{ color: "#2563eb" }}></i>
                                    Rental Lead Inquiries
                                </h2>
                                <p className="panel-subtitle">
                                    Showing requests for Laptops, Cameras, Projectors, and Sound Boxes
                                </p>
                            </div>

                            <div className="panel-filters">
                                <select
                                    className="panel-select"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="ALL">All Categories</option>
                                    <option value="Laptops">Laptops</option>
                                    <option value="Cameras">Cameras</option>
                                    <option value="Projectors">Projectors</option>
                                    <option value="Sound Boxes">Sound Boxes</option>
                                </select>

                                <select
                                    className="panel-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="New Inquiry">New Inquiry</option>
                                    <option value="Quote Sent">Quote Sent</option>
                                    <option value="KYC Verified">KYC Verified</option>
                                    <option value="Converted">Converted</option>
                                </select>
                            </div>
                        </div>

                        <div className="dashboard-table-wrap">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Lead ID</th>
                                        <th>Client & Contact</th>
                                        <th>Category & Item</th>
                                        <th>Units / Days</th>
                                        <th>Est. Value</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id}>
                                            <td style={{ fontWeight: 700, color: "#2563eb" }}>{lead.id}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{lead.customerName}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                    {lead.contactPerson} • {lead.phone}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="category-pill">{lead.category}</span>
                                                <div style={{ fontSize: "12.5px", marginTop: "3px", fontWeight: 500 }}>
                                                    {lead.itemRequested}
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{lead.units} units</strong> / {lead.durationDays} days
                                            </td>
                                            <td style={{ fontWeight: 700, color: "#16a34a" }}>
                                                ₹{lead.estimatedValue.toLocaleString("en-IN")}
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-pill ${lead.status === "Converted"
                                                        ? "status-green"
                                                        : lead.status === "KYC Verified"
                                                            ? "status-blue"
                                                            : lead.status === "Quote Sent"
                                                                ? "status-amber"
                                                                : "status-purple"
                                                        }`}
                                                >
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    {lead.status === "New Inquiry" && (
                                                        <button
                                                            type="button"
                                                            className="table-action-btn table-btn-primary"
                                                            onClick={() => handleUpdateStatus(lead.id, "Quote Sent")}
                                                        >
                                                            Send Quote
                                                        </button>
                                                    )}
                                                    {lead.status === "Quote Sent" && (
                                                        <button
                                                            type="button"
                                                            className="table-action-btn table-btn-primary"
                                                            onClick={() => handleUpdateStatus(lead.id, "KYC Verified")}
                                                        >
                                                            Verify KYC
                                                        </button>
                                                    )}
                                                    {lead.status === "KYC Verified" && (
                                                        <button
                                                            type="button"
                                                            className="table-action-btn table-btn-primary"
                                                            onClick={() => handleUpdateStatus(lead.id, "Converted")}
                                                        >
                                                            Convert & Book
                                                        </button>
                                                    )}
                                                    {lead.status === "Converted" && (
                                                        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                                            <i className="ri-check-line"></i> Booked
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="table-action-btn table-btn-outline"
                                                        onClick={() => showToast(`Dialing client ${lead.contactPerson} (${lead.phone})...`)}
                                                        title="Call Client"
                                                    >
                                                        <i className="ri-phone-line"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLeads.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                                                No leads found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: Renewals & Extensions */}
                {activeTab === "renewals" && (
                    <div className="dashboard-card-panel">
                        <div className="panel-header-row">
                            <div>
                                <h2 className="panel-title">
                                    <i className="ri-time-line" style={{ color: "#2563eb" }}></i> Active Tenures Due for Renewal
                                </h2>
                                <p className="panel-subtitle">Proactively offer renewal discounts to keep devices rented</p>
                            </div>
                        </div>

                        <div className="dashboard-table-wrap">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Rental ID</th>
                                        <th>Customer</th>
                                        <th>Rented Item</th>
                                        <th>Return Due</th>
                                        <th>Daily Rate</th>
                                        <th>Renewal Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 700, color: "#2563eb" }}>RNT-8891</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>Rahul Sharma</div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>+91 98765 43210</div>
                                        </td>
                                        <td>
                                            <span className="category-pill">Laptops</span>
                                            <div>Apple MacBook Pro M2 (16GB RAM)</div>
                                        </td>
                                        <td style={{ color: "#dc2626", fontWeight: 700 }}>In 2 Days</td>
                                        <td>₹199 / day</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="table-action-btn table-btn-primary"
                                                onClick={() => showToast("15% Extension Offer SMS & Email sent to Rahul Sharma!")}
                                            >
                                                Offer 15% Off Extension
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 700, color: "#2563eb" }}>RNT-8894</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>Ananya Wedding Films</div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>+91 98112 33445</div>
                                        </td>
                                        <td>
                                            <span className="category-pill">Cameras</span>
                                            <div>Sony Alpha A7 IV Full-Frame Camera</div>
                                        </td>
                                        <td style={{ color: "#d97706", fontWeight: 700 }}>In 4 Days</td>
                                        <td>₹349 / day</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="table-action-btn table-btn-primary"
                                                onClick={() => showToast("10% Weekly Extension Offer sent to Ananya Wedding Films!")}
                                            >
                                                Extend Tenure
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 700, color: "#2563eb" }}>RNT-8898</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>Apex Corporate Events</div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>+91 97788 99001</div>
                                        </td>
                                        <td>
                                            <span className="category-pill">Projectors</span>
                                            <div>Epson 4K PRO-UHD Home Cinema Projector</div>
                                        </td>
                                        <td style={{ color: "#16a34a", fontWeight: 700 }}>In 6 Days</td>
                                        <td>₹349 / day</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="table-action-btn table-btn-outline"
                                                onClick={() => showToast("Scheduled return pickup confirmed for Apex Corporate Events.")}
                                            >
                                                Schedule Pickup
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: Instant Quote Generator */}
                {activeTab === "quote" && (
                    <div className="dashboard-card-panel">
                        <div className="panel-header-row">
                            <div>
                                <h2 className="panel-title">
                                    <i className="ri-file-text-line" style={{ color: "#2563eb" }}></i> Corporate Quote Generator
                                </h2>
                                <p className="panel-subtitle">Create official quotation breakdowns for prospective clients</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                            <div style={{ flex: "1 1 340px" }}>
                                <div className="modal-form-group">
                                    <label>Select Device Category & Model</label>
                                    <select
                                        value={quoteDeviceIndex}
                                        onChange={(e) => {
                                            setQuoteDeviceIndex(Number(e.target.value));
                                            setQuoteGenerated(false);
                                        }}
                                    >
                                        {AVAILABLE_DEVICES.map((dev, idx) => (
                                            <option key={dev.name} value={idx}>
                                                [{dev.category}] {dev.name} - ₹{dev.dailyPrice}/day
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: "flex", gap: "14px" }}>
                                    <div className="modal-form-group" style={{ flex: 1 }}>
                                        <label>Number of Units</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={quoteUnits}
                                            onChange={(e) => {
                                                setQuoteUnits(Math.max(1, Number(e.target.value)));
                                                setQuoteGenerated(false);
                                            }}
                                        />
                                    </div>
                                    <div className="modal-form-group" style={{ flex: 1 }}>
                                        <label>Tenure (Days)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={quoteDays}
                                            onChange={(e) => {
                                                setQuoteDays(Math.max(1, Number(e.target.value)));
                                                setQuoteGenerated(false);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label>Sales Discount %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={quoteDiscount}
                                        onChange={(e) => {
                                            setQuoteDiscount(Number(e.target.value));
                                            setQuoteGenerated(false);
                                        }}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="dashboard-action-btn-primary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                    onClick={() => setQuoteGenerated(true)}
                                >
                                    <i className="ri-file-chart-line"></i> Calculate & Generate Quote
                                </button>
                            </div>

                            {/* Quote Result Box */}
                            <div
                                style={{
                                    flex: "1 1 360px",
                                    background: "#f8fafc",
                                    border: "1.5px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "20px 24px",
                                }}
                            >
                                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", color: "#0f172a" }}>
                                    Quotation Preview
                                </h3>

                                {(() => {
                                    const dev = AVAILABLE_DEVICES[quoteDeviceIndex];
                                    const gross = dev.dailyPrice * quoteUnits * quoteDays;
                                    const discountAmount = Math.round((gross * quoteDiscount) / 100);
                                    const netTotal = gross - discountAmount;
                                    const gst = Math.round(netTotal * 0.18);
                                    const grandTotal = netTotal + gst;

                                    return (
                                        <div style={{ fontSize: "13.5px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ color: "#64748b" }}>Device:</span>
                                                <strong style={{ textAlign: "right" }}>{dev.name}</strong>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ color: "#64748b" }}>Category:</span>
                                                <span className="category-pill">{dev.category}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ color: "#64748b" }}>Duration / Units:</span>
                                                <strong>{quoteDays} Days × {quoteUnits} Unit(s)</strong>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ color: "#64748b" }}>Gross Rental:</span>
                                                <span>₹{gross.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#16a34a" }}>
                                                <span>Special Discount ({quoteDiscount}%):</span>
                                                <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#64748b" }}>
                                                <span>GST (18%):</span>
                                                <span>₹{gst.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    marginTop: "12px",
                                                    paddingTop: "12px",
                                                    borderTop: "1.5px dashed #cbd5e1",
                                                    fontSize: "17px",
                                                    fontWeight: 800,
                                                    color: "#2563eb",
                                                }}
                                            >
                                                <span>Net Payable:</span>
                                                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                                            </div>

                                            {quoteGenerated && (
                                                <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
                                                    <button
                                                        type="button"
                                                        className="table-action-btn table-btn-primary"
                                                        style={{ flex: 1, justifyContent: "center" }}
                                                        onClick={() => showToast("Quotation copied to clipboard! Ready to share.")}
                                                    >
                                                        <i className="ri-file-copy-line"></i> Copy Quote
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="table-action-btn table-btn-outline"
                                                        style={{ flex: 1, justifyContent: "center" }}
                                                        onClick={() => showToast("PDF Quote generated & downloaded.")}
                                                    >
                                                        <i className="ri-download-2-line"></i> Download PDF
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* QUICK BOOKING MODAL */}
            {showBookingModal && (
                <div className="dashboard-modal-backdrop" onClick={() => setShowBookingModal(false)}>
                    <div className="dashboard-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <h3 className="modal-title">Book Rental for Customer</h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowBookingModal(false)}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <form onSubmit={handleCreateBooking}>
                            <div className="modal-form-group">
                                <label>Customer / Business Name*</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ramesh Kumar / Pixel Studios"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <div className="modal-form-group" style={{ flex: 1 }}>
                                    <label>Customer Mobile*</label>
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile"
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="modal-form-group" style={{ flex: 1 }}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="customer@email.com"
                                        value={newClientEmail}
                                        onChange={(e) => setNewClientEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label>Select Device (Laptops, Cameras, Projectors, Sound Boxes)</label>
                                <select
                                    value={selectedDeviceIndex}
                                    onChange={(e) => setSelectedDeviceIndex(Number(e.target.value))}
                                >
                                    {AVAILABLE_DEVICES.map((d, i) => (
                                        <option key={d.name} value={i}>
                                            [{d.category}] {d.name} - ₹{d.dailyPrice}/day
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-form-group">
                                <label>Rental Tenure (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={bookingDays}
                                    onChange={(e) => setBookingDays(Math.max(1, Number(e.target.value)))}
                                    required
                                />
                            </div>

                            <div
                                style={{
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "8px",
                                    padding: "12px 14px",
                                    fontSize: "13px",
                                    marginBottom: "16px",
                                }}
                            >
                                <strong>Estimated Booking Amount: </strong>
                                <span style={{ color: "#2563eb", fontWeight: 800 }}>
                                    ₹{(AVAILABLE_DEVICES[selectedDeviceIndex].dailyPrice * bookingDays).toLocaleString("en-IN")}
                                </span>{" "}
                                (Zero Security Deposit on Verified KYC)
                            </div>

                            <div className="modal-footer-row">
                                <button
                                    type="button"
                                    className="dashboard-action-btn-secondary"
                                    style={{ color: "#334155" }}
                                    onClick={() => setShowBookingModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="dashboard-action-btn-primary">
                                    <i className="ri-check-line"></i> Confirm & Create Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
