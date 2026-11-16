import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProducts, createProduct, deleteProduct, fetchOrders } from "./api";
import logo from "../assets/logo.png";
import "./AdminDashboard.css";


const INITIAL_EQUIPMENT = [
  {
    id: "EQ-101",
    name: "Epson 4K Ultra HD Home Cinema Projector",
    category: "Projectors",
    dailyRate: 189,
    securityDeposit: 1500,
    stock: "Available",
    totalUnits: 5,
    availableUnits: 3,
    specs: "3000 Lumens Brightness, 4K PRO-UHD, Dual HDMI 2.0",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "EQ-102",
    name: "BenQ Full HD Conference & Event Projector",
    category: "Projectors",
    dailyRate: 119,
    securityDeposit: 1200,
    stock: "Available",
    totalUnits: 7,
    availableUnits: 5,
    specs: "3600 Lumens, Native 1080p, Low Latency, Dual HDMI",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "EQ-103",
    name: "Canon EOS 200D II DSLR Camera (18-55mm Lens Kit)",
    category: "Cameras",
    dailyRate: 149,
    securityDeposit: 2000,
    stock: "Available",
    totalUnits: 6,
    availableUnits: 4,
    specs: "24.1MP Dual Pixel CMOS, 4K Video, Dual Batteries",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "EQ-104",
    name: "Sony Alpha A6400 Mirrorless 4K Camera (16-50mm Lens)",
    category: "Cameras",
    dailyRate: 179,
    securityDeposit: 2500,
    stock: "Available",
    totalUnits: 4,
    availableUnits: 2,
    specs: "24.2MP Exmor CMOS, 4K HDR, Real-time Eye AF",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "EQ-105",
    name: "JBL PartyBox 310 High-Power Portable Speaker",
    category: "Sound Boxes",
    dailyRate: 169,
    securityDeposit: 1200,
    stock: "Available",
    totalUnits: 4,
    availableUnits: 4,
    specs: "240W RMS, Light Show Sync, 18hr Battery, Splashproof",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "EQ-106",
    name: "Sony MHC-V13 Wireless High Power Audio System",
    category: "Sound Boxes",
    dailyRate: 129,
    securityDeposit: 1000,
    stock: "Available",
    totalUnits: 5,
    availableUnits: 3,
    specs: "Jet Bass Booster, High-Efficiency Tweeters, Bluetooth / USB",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "EQ-107",
    name: "HP Pavilion 15 Core i5 16GB Laptop",
    category: "Laptops",
    dailyRate: 140,
    securityDeposit: 1500,
    stock: "Available",
    totalUnits: 8,
    availableUnits: 6,
    specs: "Intel i5 11th Gen, 16GB RAM, 512GB SSD, FHD Display",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80",
  },
];

// Orders start clean from scratch (first order)
const SEED_ORDERS = [];

// Clean Customer Directory starting fresh
const INITIAL_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "Balu Hithesh",
    email: "balue.hithesh@gmail.com",
    phone: "+91 98480 12345",
    city: "Eluru",
    activeRentals: 0,
    totalRentals: 0,
    totalSpend: 0,
    status: "Verified",
    joinedDate: "01 Nov 2026",
  },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function parseOrderDate(order) {
  const str = String(order.startDate || order.bookingDate || "");
  const yearMatch = str.match(/202[0-9]/);
  const year = yearMatch ? yearMatch[0] : "2026";

  let monthShort = "Oct";
  let monthNum = 10;
  let monthName = "October";

  MONTH_SHORT.forEach((m, idx) => {
    if (new RegExp(`\\b${m}\\b`, "i").test(str)) {
      monthShort = m;
      monthNum = idx + 1;
      monthName = MONTH_NAMES[idx];
    }
  });

  return { year, monthShort, monthNum, monthName };
}

function getProductCategory(equipName, equipmentList = INITIAL_EQUIPMENT) {
  if (!equipName) return "Electronics";
  if (Array.isArray(equipmentList)) {
    const found = equipmentList.find(
      (e) => e.name && e.name.toLowerCase() === equipName.toLowerCase()
    );
    if (found && found.category) return found.category;
  }
  const l = equipName.toLowerCase();
  if (l.includes("projector")) return "Projectors";
  if (l.includes("camera") || l.includes("lens") || l.includes("dslr") || l.includes("canon") || l.includes("sony alpha")) return "Cameras";
  if (l.includes("speaker") || l.includes("sound") || l.includes("audio") || l.includes("partybox")) return "Sound Boxes";
  if (l.includes("laptop") || l.includes("macbook") || l.includes("hp pavilion") || l.includes("thinkpad")) return "Laptops";
  if (l.includes("display") || l.includes("screen") || l.includes("tv") || l.includes("monitor")) return "Displays";
  if (l.includes("playstation") || l.includes("ps5") || l.includes("xbox") || l.includes("gaming") || l.includes("vr")) return "Gaming";
  return "Electronics";
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Active view: Orders, Products, Customers, Reports
  const [activeTab, setActiveTab] = useState("Orders");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [equipmentList, setEquipmentList] = useState(() => {
    try {
      const deletedIds = new Set(
        JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]").map((x) => String(x).toLowerCase().trim())
      );
      const saved = JSON.parse(localStorage.getItem("erenthub_equipment") || "null");
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.filter((item) => !deletedIds.has(String(item.id).toLowerCase().trim()) && !deletedIds.has(String(item.name).toLowerCase().trim()));
      }
      return INITIAL_EQUIPMENT.filter((item) => !deletedIds.has(String(item.id).toLowerCase().trim()) && !deletedIds.has(String(item.name).toLowerCase().trim()));
    } catch (e) {
      return INITIAL_EQUIPMENT;
    }
  });
  const [customersList] = useState(INITIAL_CUSTOMERS);

  // Sync with MongoDB backend products on mount
  useEffect(() => {
    let isMounted = true;
    async function syncProductsFromBackend() {
      try {
        const serverProducts = await fetchProducts();
        if (!isMounted || !Array.isArray(serverProducts)) return;

        const deletedIds = new Set(
          JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]").map((x) => String(x).toLowerCase().trim())
        );

        if (serverProducts.length > 0) {
          const mapped = serverProducts
            .filter((sp) => !deletedIds.has(String(sp.id).toLowerCase().trim()) && !deletedIds.has(String(sp.name).toLowerCase().trim()))
            .map((sp) => ({
              id: sp.id || `EQ-${sp._id}`,
              name: sp.name,
              category: sp.category || "Electronics",
              dailyRate: Number(sp.dailyRate) || 150,
              securityDeposit: Number(sp.securityDeposit) || 1500,
              stock: sp.available !== false ? "Available" : "Out of Stock",
              totalUnits: sp.totalUnits || 5,
              availableUnits: sp.availableUnits || 5,
              specs: typeof sp.specs === "object" ? Object.entries(sp.specs).map(([k, v]) => `${k}: ${v}`).join(", ") : (sp.specs || (sp.features ? sp.features.join(", ") : "Verified rental equipment")),
              image: sp.image || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
            }));

          if (mapped.length > 0) {
            setEquipmentList(mapped);
            localStorage.setItem("erenthub_equipment", JSON.stringify(mapped));
          }
        }
      } catch (err) {
        console.warn("Failed to sync backend products:", err);
      }
    }
    syncProductsFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Read actual customer orders from localStorage or start fresh from []
  const [ordersList, setOrdersList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("erenthub_orders") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        const legacyMockIds = new Set([
          "#ERH-9402", "#ERH-8150", "#ERH-7920", "#ERH-7320", "#ERH-6840",
          "#ERH-6120", "#ERH-5890", "#ERH-5510", "#ERH-5210", "#ERH-4980",
          "#ERH-4750", "#ERH-4420", "#ERH-4110", "#ERH-3890", "#ERH-3560", "#ERH-3120",
          "ERH-9402", "ERH-8150"
        ]);
        const realOrders = saved.filter(o => !legacyMockIds.has(o.id ? (o.id.startsWith("#") ? o.id : `#${o.id}`) : ""));
        return realOrders.map((o) => ({
          id: o.id.startsWith("#") ? o.id : `#${o.id}`,
          customer: o.customerName || o.customer || "Balu Hithesh",
          customerPhone: o.customerPhone || "+91 98480 12345",
          customerCity: o.customerCity || "Eluru",
          equipment: o.name || o.equipment || "Epson 4K Ultra HD Home Cinema Projector",
          startDate: o.startDate || o.bookingDate || "Today",
          endDate: o.endDate || "3 Days later",
          duration: `${o.durationDays || o.days || 3} Days`,
          rentalFee: Number(o.rentalPrice || o.baseAmount || o.rentalFee || 420),
          securityDeposit: Number(o.securityDeposit || 1500),
          total: Number(o.totalAmount || o.total || 496),
          paymentMode: o.paymentStatus || o.paymentMode || "Cash on Delivery",
          status: o.status === "Cancelled" ? "Cancelled" : (o.trackingStage >= 3 ? "Active" : "Pending"),
          deliveryBoyName: o.assignedDeliveryBoyName || o.deliveryBoyName || "CH.N.V.S. Hithesh",
          deliveryBoyPhone: o.assignedDeliveryBoyPhone || o.deliveryBoyPhone || "+91 73963 48793",
          deliveryBoyVehicle: o.assignedDeliveryBoyVehicle || o.deliveryBoyVehicle || "EV Scooter (AP-37)",
          deliveryBoyHub: o.pickupHub || o.assignedDeliveryBoyHub || "Powerpet Central Logistics Hub, Eluru",
          deliveryStatus: o.deliveryStatus || (o.trackingStage >= 6 ? "Delivered" : o.trackingStage >= 4 ? "Out for Delivery" : o.trackingStage >= 2 ? "Heading to Pickup" : "Assigned"),
          trackingStage: o.trackingStage || 1,
          statusNote: o.statusNote || "Delivery Partner Assigned",
          destinationAddress: o.deliveryAddress || o.destinationAddress || "Powerpet Main Road, Eluru - 534002",
        }));
      }
    } catch (e) { }
    return [];
  });

  // Sync with MongoDB backend orders on mount
  useEffect(() => {
    let isMounted = true;
    async function syncOrdersFromBackend() {
      try {
        const serverOrders = await fetchOrders();
        if (!isMounted || !Array.isArray(serverOrders) || serverOrders.length === 0) return;
        const legacyMockIds = new Set([
          "#ERH-9402", "#ERH-8150", "#ERH-7920", "#ERH-7320", "#ERH-6840",
          "#ERH-6120", "#ERH-5890", "#ERH-5510", "#ERH-5210", "#ERH-4980",
          "#ERH-4750", "#ERH-4420", "#ERH-4110", "#ERH-3890", "#ERH-3560", "#ERH-3120",
          "ERH-9402", "ERH-8150"
        ]);
        const mapped = serverOrders
          .filter(o => !legacyMockIds.has(o.orderNumber ? (o.orderNumber.startsWith("#") ? o.orderNumber : `#${o.orderNumber}`) : (o.id || "")))
          .map((o) => {
            const rawId = o.orderNumber || o.id || `ERH-${o._id?.slice(-6) || "1001"}`;
            const id = rawId.startsWith("#") ? rawId : `#${rawId}`;
            return {
              id,
              customer: o.customerName || (o.customer && o.customer.name) || "Balu Hithesh",
              customerPhone: o.customerPhone || (o.customer && o.customer.phone) || "+91 98480 12345",
              customerCity: o.customerCity || "Eluru",
              equipment: o.items?.[0]?.product?.name || o.name || "Epson 4K Ultra HD Home Cinema Projector",
              startDate: o.rentalPeriod?.startDate ? new Date(o.rentalPeriod.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (o.startDate || "Today"),
              endDate: o.rentalPeriod?.endDate ? new Date(o.rentalPeriod.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (o.endDate || "3 Days later"),
              duration: `${o.rentalPeriod?.totalDays || o.durationDays || 3} Days`,
              rentalFee: Number(o.pricing?.rentalFee || o.rentalPrice || 420),
              securityDeposit: Number(o.pricing?.deposit || o.securityDeposit || 1500),
              total: Number(o.pricing?.totalPayable || o.totalAmount || 496),
              paymentMode: o.paymentDetails?.paymentMethod || o.paymentMode || "Cash on Delivery",
              status: o.status === "Cancelled" ? "Cancelled" : (o.trackingStage >= 3 ? "Active" : "Pending"),
              deliveryBoyName: o.assignedDeliveryBoyName || "CH.N.V.S. Hithesh",
              deliveryBoyPhone: o.assignedDeliveryBoyPhone || "+91 73963 48793",
              deliveryBoyVehicle: o.assignedDeliveryBoyVehicle || "EV Scooter (AP-37)",
              deliveryBoyHub: o.assignedDeliveryBoyHub || "Powerpet Central Logistics Hub, Eluru",
              deliveryStatus: o.deliveryStatus || (o.trackingStage >= 6 ? "Delivered" : o.trackingStage >= 4 ? "Out for Delivery" : o.trackingStage >= 2 ? "Heading to Pickup" : "Assigned"),
              trackingStage: o.trackingStage || 1,
              statusNote: o.statusNote || "Delivery Partner Assigned",
              destinationAddress: o.deliveryDetails?.address?.line1 || o.deliveryAddress || "Powerpet Main Road, Eluru - 534002",
            };
          });

        if (mapped.length > 0) {
          setOrdersList(mapped);
        }
      } catch (err) {
        console.warn("Backend orders sync error:", err);
      }
    }
    syncOrdersFromBackend();
    return () => { isMounted = false; };
  }, []);

  // FILTERS FOR ORDERS (MONTH, YEAR, PRODUCT, STATUS, SEARCH)
  const [orderYearFilter, setOrderYearFilter] = useState("All");
  const [orderMonthFilter, setOrderMonthFilter] = useState("All");
  const [orderProductFilter, setOrderProductFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Product Filters
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Customer Search
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Reports State & Filters
  const [reportYearFilter, setReportYearFilter] = useState("2026");
  const [reportViewMode, setReportViewMode] = useState("monthlyLedger"); // "monthlyLedger" | "transactions"
  const [reportMonthFilter, setReportMonthFilter] = useState("All"); // "All" | "1" - "12"

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Projectors");
  const [newProdRate, setNewProdRate] = useState("");
  const [newProdDeposit, setNewProdDeposit] = useState("");
  const [newProdUnits, setNewProdUnits] = useState("5");
  const [newProdSpecs, setNewProdSpecs] = useState("");

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newObj = {
      id: `EQ-${100 + equipmentList.length + 1}`,
      name: newProdName.trim(),
      category: newProdCategory,
      dailyRate: Number(newProdRate) || 150,
      securityDeposit: Number(newProdDeposit) || 1200,
      stock: "Available",
      totalUnits: Number(newProdUnits) || 5,
      availableUnits: Number(newProdUnits) || 5,
      specs: newProdSpecs.trim() || "Verified rental equipment",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
    };

    const updated = [newObj, ...equipmentList];
    setEquipmentList(updated);
    localStorage.setItem("erenthub_equipment", JSON.stringify(updated));

    // Remove from deleted list if re-added
    try {
      const deletedIds = JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]");
      const filtered = deletedIds.filter(
        (x) => x !== String(newObj.id).toLowerCase() && x !== String(newObj.name).toLowerCase()
      );
      localStorage.setItem("erenthub_deleted_product_ids", JSON.stringify(filtered));
    } catch (err) { }

    setShowAddModal(false);
    setNewProdName("");
    setNewProdRate("");
    setNewProdDeposit("");
    setNewProdSpecs("");

    // Persist to MongoDB Compass backend
    try {
      await createProduct({
        id: newObj.id,
        name: newObj.name,
        category: newObj.category,
        dailyRate: newObj.dailyRate,
        securityDeposit: newObj.securityDeposit,
        specs: { details: newObj.specs },
        image: newObj.image,
      });
    } catch (err) {
      console.warn("Backend product creation error:", err);
    }
  };

  const handleDeleteProduct = async (eq) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${eq.name}" (${eq.id}) from the catalog?`)) {
      return;
    }

    // 1. Immediately update React state
    const updated = equipmentList.filter((item) => item.id !== eq.id && item.name !== eq.name);
    setEquipmentList(updated);

    // 2. Persist updated list to localStorage
    localStorage.setItem("erenthub_equipment", JSON.stringify(updated));

    // 3. Add to global deleted products list (ID + Name) so Home catalog, Cart, ProductDetail remove it
    try {
      const existingDeleted = JSON.parse(localStorage.getItem("erenthub_deleted_product_ids") || "[]");
      const newDeleted = Array.from(
        new Set([
          ...existingDeleted,
          String(eq.id).toLowerCase().trim(),
          String(eq.name).toLowerCase().trim(),
        ])
      );
      localStorage.setItem("erenthub_deleted_product_ids", JSON.stringify(newDeleted));
    } catch (err) { }

    // 4. Send DELETE request to MongoDB Compass backend
    try {
      await deleteProduct(eq.id);
    } catch (err) {
      console.warn("Backend product deletion error:", err);
    }
  };

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const dateInfo = parseOrderDate(order);

      if (orderYearFilter !== "All" && dateInfo.year !== orderYearFilter) return false;
      if (orderMonthFilter !== "All" && String(dateInfo.monthNum) !== String(orderMonthFilter)) return false;
      if (orderProductFilter !== "All" && !order.equipment.toLowerCase().includes(orderProductFilter.toLowerCase())) return false;
      if (orderStatusFilter !== "All" && order.status.toLowerCase() !== orderStatusFilter.toLowerCase()) return false;

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchCust = order.customer.toLowerCase().includes(q);
        const matchEquip = order.equipment.toLowerCase().includes(q);
        if (!matchId && !matchCust && !matchEquip) return false;
      }

      return true;
    });
  }, [ordersList, orderYearFilter, orderMonthFilter, orderProductFilter, orderStatusFilter, orderSearchQuery]);

  const filteredRevenueSum = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.rentalFee || o.total || 0), 0);
  }, [filteredOrders]);

  const filteredDepositsSum = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.securityDeposit || 0), 0);
  }, [filteredOrders]);

  // Monthly Reports Calculation (Month, How Many Orders, Which Type Products)
  const monthlyReportData = useMemo(() => {
    const monthsData = MONTH_NAMES.map((name, idx) => {
      const monthNum = idx + 1;
      const matching = ordersList.filter((o) => {
        const d = parseOrderDate(o);
        return d.year === reportYearFilter && d.monthNum === monthNum;
      });

      const valid = matching.filter((o) => o.status !== "Cancelled");
      const totalOrders = matching.length;
      const completedCount = matching.filter((o) => o.status === "Completed" || o.status === "Returned").length;
      const activeCount = matching.filter((o) => o.status === "Active" || o.status === "Pending").length;
      const cancelledCount = matching.filter((o) => o.status === "Cancelled").length;
      const grossSales = valid.reduce((sum, o) => sum + (o.rentalFee || o.total || 0), 0);
      const completedSales = valid
        .filter((o) => o.status === "Completed" || o.status === "Returned")
        .reduce((sum, o) => sum + (o.rentalFee || o.total || 0), 0);
      const deposits = valid.reduce((sum, o) => sum + (o.securityDeposit || 0), 0);
      const avgSale = valid.length > 0 ? Math.round(grossSales / valid.length) : 0;

      // Group by Product Types (Categories)
      const categoryCounts = {};
      const productCounts = {};

      matching.forEach((o) => {
        const cat = getProductCategory(o.equipment, equipmentList);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        productCounts[o.equipment] = (productCounts[o.equipment] || 0) + 1;
      });

      const categories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const products = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        monthIndex: idx,
        monthNum,
        monthName: name,
        monthShort: MONTH_SHORT[idx],
        totalOrders,
        completedCount,
        activeCount,
        cancelledCount,
        grossSales,
        completedSales,
        deposits,
        avgSale,
        categories,
        products,
        matchingOrders: matching,
      };
    });

    const totalAnnualOrders = monthsData.reduce((sum, m) => sum + m.totalOrders, 0);
    const totalAnnualRevenue = monthsData.reduce((sum, m) => sum + m.grossSales, 0);
    const totalAnnualCompleted = monthsData.reduce((sum, m) => sum + m.completedSales, 0);
    const totalAnnualDeposits = monthsData.reduce((sum, m) => sum + m.deposits, 0);
    const maxOrdersInMonth = Math.max(...monthsData.map((m) => m.totalOrders), 1);
    const peakMonthObj = [...monthsData].sort((a, b) => b.totalOrders - a.totalOrders)[0];
    const peakMonth = peakMonthObj?.monthName || "October";

    // All Annual Product Types Rented
    const annualCatMap = {};
    const allProdNames = new Set();
    ordersList.filter((o) => {
      const d = parseOrderDate(o);
      return d.year === reportYearFilter;
    }).forEach((o) => {
      const cat = getProductCategory(o.equipment, equipmentList);
      annualCatMap[cat] = (annualCatMap[cat] || 0) + 1;
      if (o.equipment) allProdNames.add(o.equipment);
    });

    const annualCategories = Object.entries(annualCatMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topCategory = annualCategories[0]?.category || "Projectors";

    return {
      months: monthsData,
      totalAnnualOrders,
      totalAnnualRevenue,
      totalAnnualCompleted,
      totalAnnualDeposits,
      maxOrdersInMonth,
      peakMonth,
      annualCategories,
      topCategory,
      uniqueProductsCount: allProdNames.size,
      avgOrders: (totalAnnualOrders / 12).toFixed(1),
    };
  }, [ordersList, reportYearFilter, equipmentList]);

  // Itemized transactions for selected month in Monthly Reports
  const monthlyReportTransactions = useMemo(() => {
    return ordersList.filter((o) => {
      const d = parseOrderDate(o);
      if (d.year !== reportYearFilter) return false;
      if (reportMonthFilter !== "All" && String(d.monthNum) !== String(reportMonthFilter)) return false;
      return true;
    });
  }, [ordersList, reportYearFilter, reportMonthFilter]);

  const totalGrossSales = useMemo(() => {
    return ordersList
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.rentalFee || o.total || 0), 0);
  }, [ordersList]);

  const totalActiveBookings = useMemo(() => {
    return ordersList.filter((o) => o.status === "Active").length;
  }, [ordersList]);

  const topProductsLeaderboard = useMemo(() => {
    const counts = {};
    ordersList.forEach((o) => {
      if (o.status !== "Cancelled") {
        counts[o.equipment] = (counts[o.equipment] || 0) + 1;
      }
    });

    return equipmentList.map((eq) => ({
      ...eq,
      rentCount: counts[eq.name] || 2,
      estimatedRevenue: (counts[eq.name] || 2) * eq.dailyRate * 4,
    })).sort((a, b) => b.rentCount - a.rentCount);
  }, [equipmentList, ordersList]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const getBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "badge-pending";
      case "active":
        return "badge-active";
      case "completed":
        return "badge-completed";
      case "returned":
        return "badge-returned";
      case "cancelled":
        return "badge-cancelled";
      default:
        return "badge-active";
    }
  };

  return (
    <div className="adm-layout">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="adm-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* 1. SIDEBAR (Sales, Orders, Products, Customers, Reports) */}
      <aside className={`adm-sidebar ${mobileMenuOpen ? "drawer-open" : ""}`}>
        <div className="adm-sidebar-brand">
          <Link to="/home" className="adm-logo-wrap">
            <img src={logo} alt="E-RentHub" className="adm-logo" />
            <div className="adm-brand-text">
              <span>E-Rent<span>Hub</span></span>
              <small>Admin Portal</small>
            </div>
          </Link>
          <button
            type="button"
            className="adm-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-label">Management</div>

          <button
            type="button"
            className={`adm-nav-btn ${activeTab === "Orders" ? "active" : ""}`}
            onClick={() => handleTabChange("Orders")}
          >
            <i className="ri-file-list-3-line"></i>
            <span>Orders & Bookings</span>
            {ordersList.length > 0 && <span className="adm-nav-pill">{ordersList.length}</span>}
          </button>

          <button
            type="button"
            className={`adm-nav-btn ${activeTab === "Products" ? "active" : ""}`}
            onClick={() => handleTabChange("Products")}
          >
            <i className="ri-box-3-line"></i>
            <span>Products</span>
            <span className="adm-nav-pill">{equipmentList.length}</span>
          </button>

          <button
            type="button"
            className={`adm-nav-btn ${activeTab === "Customers" ? "active" : ""}`}
            onClick={() => handleTabChange("Customers")}
          >
            <i className="ri-group-line"></i>
            <span>Customers</span>
            <span className="adm-nav-pill">{customersList.length}</span>
          </button>

          <button
            type="button"
            className={`adm-nav-btn ${activeTab === "Reports" ? "active" : ""}`}
            onClick={() => handleTabChange("Reports")}
          >
            <i className="ri-file-chart-line"></i>
            <span>Monthly Reports</span>
          </button>

          <button
            type="button"
            className={`adm-nav-btn ${activeTab === "Delivery" ? "active" : ""}`}
            onClick={() => handleTabChange("Delivery")}
          >
            <i className="ri-riding-line"></i>
            <span>Delivery Fleet</span>
            <span className="adm-nav-pill" style={{ backgroundColor: "#10b981", color: "#ffffff" }}>1 Online</span>
          </button>

          <div className="adm-nav-label" style={{ marginTop: "16px" }}>Account</div>

          <button
            type="button"
            className="adm-nav-btn adm-logout-btn"
            onClick={() => {
              if (window.confirm("Log out of Admin Dashboard?")) {
                navigate("/");
              }
            }}
          >
            <i className="ri-logout-box-r-line"></i>
            <span>Logout</span>
          </button>
        </nav>

        <div className="adm-sidebar-user">
          <div className="adm-avatar-circle">AD</div>
          <div className="adm-user-details">
            <span className="adm-user-name">Hithesh Chaluvadi</span>
            <span className="adm-user-sub">Administrator</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="adm-workspace">
        {/* Top Header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <button
              type="button"
              className="adm-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              title="Open Navigation Menu"
            >
              <i className="ri-menu-line"></i>
            </button>
            <h1 className="adm-page-title">
              {activeTab === "Orders" && "Orders & Bookings"}
              {activeTab === "Products" && "Products Catalog"}
              {activeTab === "Customers" && "Customer Directory"}
              {activeTab === "Reports" && "Monthly Reports"}
              {activeTab === "Delivery" && "Delivery Fleet & Partners"}
            </h1>
          </div>

          <div className="adm-header-right">
            <Link to="/home" className="adm-btn-store">
              <i className="ri-store-2-line"></i>
              <span>Customer Store</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="adm-body">
          {/* ========================================================
              TAB 2: ORDERS (WITH MONTHLY & YEAR-WISE + PRODUCT FILTERS)
             ======================================================== */}
          {activeTab === "Orders" && (
            <div className="adm-tab-content">
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h3 className="adm-panel-title">Rental Orders & Bookings</h3>
                    <p className="adm-panel-sub">
                      Filter by Month, Year, and specific Product.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="adm-btn-subtle"
                    onClick={() => {
                      setOrderYearFilter("All");
                      setOrderMonthFilter("All");
                      setOrderProductFilter("All");
                      setOrderStatusFilter("All");
                      setOrderSearchQuery("");
                    }}
                  >
                    <i className="ri-refresh-line"></i>
                    <span>Reset Filters</span>
                  </button>
                </div>

                {/* MULTI-DIMENSION FILTER STRIP */}
                <div className="adm-filter-bar">
                  <div className="adm-filter-top-row">
                    <div className="adm-search-field">
                      <i className="ri-search-line"></i>
                      <input
                        type="text"
                        placeholder="Search customer, order ID, product name..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                      />
                      {orderSearchQuery && (
                        <button
                          type="button"
                          className="adm-search-clear"
                          onClick={() => setOrderSearchQuery("")}
                          title="Clear search"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      )}
                    </div>

                    {(orderYearFilter !== "All" || orderMonthFilter !== "All" || orderProductFilter !== "All" || orderStatusFilter !== "All" || orderSearchQuery) && (
                      <button
                        type="button"
                        className="adm-btn-subtle adm-filter-reset-inline"
                        onClick={() => {
                          setOrderYearFilter("All");
                          setOrderMonthFilter("All");
                          setOrderProductFilter("All");
                          setOrderStatusFilter("All");
                          setOrderSearchQuery("");
                        }}
                        title="Reset all filters"
                      >
                        <i className="ri-refresh-line"></i>
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>

                  <div className="adm-filter-grid">
                    {/* Year Filter */}
                    <div className="adm-filter-group">
                      <label htmlFor="filter-year">Year</label>
                      <div className="adm-select-wrapper">
                        <select
                          id="filter-year"
                          value={orderYearFilter}
                          onChange={(e) => setOrderYearFilter(e.target.value)}
                        >
                          <option value="All">All Years</option>
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                        </select>
                        <i className="ri-arrow-down-s-line adm-select-arrow"></i>
                      </div>
                    </div>

                    {/* Month Filter */}
                    <div className="adm-filter-group">
                      <label htmlFor="filter-month">Month</label>
                      <div className="adm-select-wrapper">
                        <select
                          id="filter-month"
                          value={orderMonthFilter}
                          onChange={(e) => setOrderMonthFilter(e.target.value)}
                        >
                          <option value="All">All Months (1-12)</option>
                          {MONTH_NAMES.map((m, idx) => (
                            <option key={m} value={idx + 1}>
                              {m} ({MONTH_SHORT[idx]})
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line adm-select-arrow"></i>
                      </div>
                    </div>

                    {/* Product Filter */}
                    <div className="adm-filter-group">
                      <label htmlFor="filter-product">Product</label>
                      <div className="adm-select-wrapper">
                        <select
                          id="filter-product"
                          value={orderProductFilter}
                          onChange={(e) => setOrderProductFilter(e.target.value)}
                        >
                          <option value="All">All Products ({equipmentList.length})</option>
                          {equipmentList.map((eq) => (
                            <option key={eq.id} value={eq.name}>
                              {eq.name}
                            </option>
                          ))}
                        </select>
                        <i className="ri-arrow-down-s-line adm-select-arrow"></i>
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="adm-filter-group">
                      <label htmlFor="filter-status">Status</label>
                      <div className="adm-select-wrapper">
                        <select
                          id="filter-status"
                          value={orderStatusFilter}
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                        >
                          <option value="All">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <i className="ri-arrow-down-s-line adm-select-arrow"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Summary Metrics */}
                <div className="adm-summary-strip">
                  <div className="adm-summary-item">
                    <span>Matching Orders:</span>
                    <strong>{filteredOrders.length}</strong>
                  </div>
                  <span className="adm-sep">|</span>
                  <div className="adm-summary-item">
                    <span>Rental Revenue:</span>
                    <strong>₹{filteredRevenueSum.toLocaleString("en-IN")}</strong>
                  </div>
                  <span className="adm-sep">|</span>
                  <div className="adm-summary-item">
                    <span>Deposits Held:</span>
                    <strong>₹{filteredDepositsSum.toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="adm-table-wrap">
                  <div className="adm-mobile-scroll-hint">
                    <i className="ri-arrow-left-right-line"></i>
                    <span>Swipe table sideways to view all columns</span>
                  </div>
                  {filteredOrders.length === 0 ? (
                    <div className="adm-empty-table">
                      <i className="ri-filter-off-line"></i>
                      <h4>No orders match your filter</h4>
                      <p>Try resetting the month, year, or product filters.</p>
                      <button
                        type="button"
                        className="adm-btn-primary"
                        onClick={() => {
                          setOrderYearFilter("All");
                          setOrderMonthFilter("All");
                          setOrderProductFilter("All");
                          setOrderStatusFilter("All");
                          setOrderSearchQuery("");
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Rented Product</th>
                          <th>Rental Period</th>
                          <th>Rent Fee</th>
                          <th>Deposit</th>
                          <th>Payment</th>
                          <th>Delivery Partner</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => (
                          <tr key={o.id}>
                            <td className="adm-code-cell">{o.id}</td>
                            <td>
                              <strong>{o.customer}</strong>
                              <div className="adm-date-hint">{o.customerCity} • {o.customerPhone}</div>
                            </td>
                            <td>{o.equipment}</td>
                            <td>
                              <span>{o.startDate}</span>
                              <div className="adm-date-hint">{o.duration}</div>
                            </td>
                            <td className="adm-cell-price">₹{Number(o.rentalFee || o.total || 0).toLocaleString("en-IN")}</td>
                            <td className="adm-cell-deposit">₹{Number(o.securityDeposit || 0).toLocaleString("en-IN")}</td>
                            <td>
                              <span className="adm-payment-pill">{o.paymentMode}</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "11px", border: "1px solid #bfdbfe", flexShrink: 0 }}>
                                  CH
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: "12.5px", color: "#0f172a" }}>{o.deliveryBoyName || "CH.N.V.S. Hithesh"}</div>
                                  <div className="adm-date-hint" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span>{o.deliveryBoyVehicle || "EV Scooter (AP-37)"}</span>
                                    <span>•</span>
                                    <a href={`tel:${(o.deliveryBoyPhone || "+917396348793").replace(/\s+/g, "")}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                                      {o.deliveryBoyPhone || "+91 73963 48793"}
                                    </a>
                                  </div>
                                  <div style={{ marginTop: "3px" }}>
                                    <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#f0fdf4", color: "#166534", fontWeight: "600", border: "1px solid #bbf7d0" }}>
                                      {o.deliveryStatus || (o.trackingStage >= 6 ? "Delivered" : o.trackingStage >= 4 ? "Out for Delivery" : o.trackingStage >= 2 ? "Heading to Pickup" : "Assigned")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`adm-badge ${getBadgeClass(o.status)}`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: PRODUCTS INVENTORY (WHAT ARE THE PRODUCTS)
             ======================================================== */}
          {activeTab === "Products" && (
            <div className="adm-tab-content">
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h3 className="adm-panel-title">Rental Products Catalog ({equipmentList.length})</h3>
                    <p className="adm-panel-sub">
                      Products in catalog: Projectors, Cameras, Sound Boxes, and Laptops with daily rates & security deposits.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="adm-btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="ri-add-line"></i>
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="adm-filter-bar">
                  <div className="adm-search-field">
                    <i className="ri-search-line"></i>
                    <input
                      type="text"
                      placeholder="Search gadget name or specs..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="adm-filter-grid">
                    <div className="adm-filter-group">
                      <label>Category</label>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                      >
                        <option value="All">All Categories</option>
                        <option value="Projectors">Projectors</option>
                        <option value="Cameras">Cameras</option>
                        <option value="Sound Boxes">Sound Boxes</option>
                        <option value="Laptops">Laptops</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Daily Rate</th>
                        <th>Deposit</th>
                        <th>Units</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentList
                        .filter((eq) => {
                          const matchesCat = productCategoryFilter === "All" || eq.category === productCategoryFilter;
                          const matchesQ =
                            productSearchQuery === "" ||
                            eq.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            eq.specs.toLowerCase().includes(productSearchQuery.toLowerCase());
                          return matchesCat && matchesQ;
                        })
                        .map((eq) => (
                          <tr key={eq.id}>
                            <td className="adm-code-cell">{eq.id}</td>
                            <td>
                              <div className="adm-product-cell">
                                <img src={eq.image} alt={eq.name} className="adm-product-thumb" />
                                <div>
                                  <strong>{eq.name}</strong>
                                  <div className="adm-product-specs">{eq.specs}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="adm-pill">{eq.category}</span>
                            </td>
                            <td className="adm-cell-price">₹{eq.dailyRate} / day</td>
                            <td className="adm-cell-deposit">₹{eq.securityDeposit}</td>
                            <td>{eq.availableUnits} / {eq.totalUnits} Units</td>
                            <td>
                              <span className="adm-badge badge-completed">{eq.stock}</span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="adm-btn-delete"
                                onClick={() => handleDeleteProduct(eq)}
                              >
                                <i className="ri-delete-bin-line"></i>
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: CUSTOMERS DIRECTORY (CUSTOMER VIEW)
             ======================================================== */}
          {activeTab === "Customers" && (
            <div className="adm-tab-content">
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h3 className="adm-panel-title">Customer Base ({customersList.length})</h3>
                    <p className="adm-panel-sub">
                      Customer view: Registered profiles, verified contact details, and rental histories.
                    </p>
                  </div>
                  <span className="adm-badge badge-active">{customersList.length} Verified Users</span>
                </div>

                <div className="adm-filter-bar">
                  <div className="adm-search-field">
                    <i className="ri-search-line"></i>
                    <input
                      type="text"
                      placeholder="Search customer name, email, or city..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Active Rentals</th>
                        <th>Total Bookings</th>
                        <th>Total Spend</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersList
                        .filter((c) => {
                          if (!customerSearchQuery.trim()) return true;
                          const q = customerSearchQuery.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q) ||
                            c.city.toLowerCase().includes(q)
                          );
                        })
                        .map((c) => (
                          <tr key={c.id}>
                            <td>
                              <strong>{c.name}</strong>
                              <div className="adm-date-hint">Joined: {c.joinedDate}</div>
                            </td>
                            <td>{c.email}</td>
                            <td>{c.phone}</td>
                            <td>
                              <span className="adm-city-pill">
                                <i className="ri-map-pin-line"></i> {c.city}
                              </span>
                            </td>
                            <td>
                              <span className={`adm-badge ${c.activeRentals > 0 ? "badge-active" : "badge-returned"}`}>
                                {c.activeRentals} Active
                              </span>
                            </td>
                            <td><strong>{c.totalRentals} Rentals</strong></td>
                            <td className="adm-cell-price">₹{c.totalSpend.toLocaleString("en-IN")}</td>
                            <td>
                              <span className="adm-badge badge-completed">
                                <i className="ri-shield-check-line"></i> {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: MONTHLY REPORTS (TABLE FORMAT OF ORDERS & PRODUCTS)
             ======================================================== */}
          {activeTab === "Reports" && (
            <div className="adm-tab-content">
              {/* Annual Financial & Volume KPIs */}
              <div className="adm-sales-kpis">
                <div className="adm-sales-kpi-card">
                  <span className="adm-sales-kpi-title">Total Revenue ({reportYearFilter})</span>
                  <div className="adm-sales-kpi-val text-primary">₹{monthlyReportData.totalAnnualRevenue.toLocaleString("en-IN")}</div>
                  <span className="adm-sales-kpi-note">Across {monthlyReportData.totalAnnualOrders} total orders</span>
                </div>

                <div className="adm-sales-kpi-card">
                  <span className="adm-sales-kpi-title">How Many Orders ({reportYearFilter})</span>
                  <div className="adm-sales-kpi-val text-success">{monthlyReportData.totalAnnualOrders} Total Orders</div>
                  <span className="adm-sales-kpi-note">{monthlyReportData.totalAnnualCompleted} Completed • {monthlyReportData.totalAnnualOrders - monthlyReportData.totalAnnualCompleted} In-Progress</span>
                </div>

                <div className="adm-sales-kpi-card">
                  <span className="adm-sales-kpi-title">Top Product Type</span>
                  <div className="adm-sales-kpi-val text-deposit">{monthlyReportData.topCategory}</div>
                  <span className="adm-sales-kpi-note">{monthlyReportData.annualCategories[0]?.count || 0} items rented in {reportYearFilter}</span>
                </div>

                <div className="adm-sales-kpi-card">
                  <span className="adm-sales-kpi-title">Peak Order Month</span>
                  <div className="adm-sales-kpi-val">{monthlyReportData.peakMonth}</div>
                  <span className="adm-sales-kpi-note">Highest monthly order volume</span>
                </div>
              </div>

              {/* Main Monthly Report Panel */}
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h3 className="adm-panel-title">Monthly Orders & Product Types Report Table</h3>
                    <p className="adm-panel-sub">
                      Monthly breakdown of order counts, equipment product types rented, and tariff revenue for {reportYearFilter}.
                    </p>
                  </div>

                  <div className="adm-view-controls">
                    <div className="adm-year-selector">
                      <label>Report Year:</label>
                      <select
                        value={reportYearFilter}
                        onChange={(e) => {
                          setReportYearFilter(e.target.value);
                          setReportMonthFilter("All");
                        }}
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>

                    <div className="adm-view-toggle">
                      <button
                        type="button"
                        className={`adm-toggle-btn ${reportViewMode === "monthlyLedger" ? "active" : ""}`}
                        onClick={() => setReportViewMode("monthlyLedger")}
                      >
                        <i className="ri-table-line"></i>
                        <span>Monthly Orders & Products Table</span>
                      </button>
                      <button
                        type="button"
                        className={`adm-toggle-btn ${reportViewMode === "transactions" ? "active" : ""}`}
                        onClick={() => setReportViewMode("transactions")}
                      >
                        <i className="ri-file-list-3-line"></i>
                        <span>Order Transactions Ledger ({monthlyReportTransactions.length})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="adm-btn-subtle"
                      onClick={() => window.print()}
                      title="Print Monthly Orders & Products Report"
                    >
                      <i className="ri-printer-line"></i>
                      <span>Print Report</span>
                    </button>
                  </div>
                </div>

                {/* Table View 1: Month, How Many Orders, Which Type Products Table */}
                {reportViewMode === "monthlyLedger" && (
                  <div className="adm-table-wrap">
                    <div className="adm-mobile-scroll-hint">
                      <i className="ri-arrow-left-right-line"></i>
                      <span>Swipe table sideways to view all columns</span>
                    </div>
                    <table className="adm-table adm-sales-table adm-reports-table">
                      <thead>
                        <tr>
                          <th>Month ({reportYearFilter})</th>
                          <th>How Many Orders</th>
                          <th>Which Type Products (Categories)</th>
                          <th>Products Rented (Itemized)</th>
                          <th>Rental Revenue</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyReportData.months.map((m) => (
                          <tr key={m.monthName} className={m.totalOrders > 0 ? "has-data-row" : "empty-row"}>
                            {/* 1. Month */}
                            <td>
                              <strong>{m.monthName} {reportYearFilter}</strong>
                              {m.monthName === monthlyReportData.peakMonth && m.totalOrders > 0 && (
                                <span className="adm-pill-peak">Peak Month</span>
                              )}
                            </td>

                            {/* 2. How Many Orders */}
                            <td>
                              {m.totalOrders > 0 ? (
                                <div className="adm-orders-cell">
                                  <span className="adm-order-count-pill">
                                    <i className="ri-shopping-bag-3-line"></i>
                                    {m.totalOrders} {m.totalOrders === 1 ? "Order" : "Orders"}
                                  </span>
                                  <div className="adm-date-hint">
                                    {m.completedCount} Completed • {m.activeCount} Active{m.cancelledCount > 0 ? ` • ${m.cancelledCount} Cancelled` : ""}
                                  </div>
                                </div>
                              ) : (
                                <span className="adm-text-muted">0 orders</span>
                              )}
                            </td>

                            {/* 3. Which Type Products (Categories) */}
                            <td>
                              {m.categories && m.categories.length > 0 ? (
                                <div className="adm-cat-pills-wrap">
                                  {m.categories.map((c) => (
                                    <span
                                      key={c.category}
                                      className={`adm-category-tag cat-${c.category.toLowerCase().replace(/\s+/g, "-")}`}
                                    >
                                      {c.category} <strong>{c.count}</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="adm-text-muted">- No equipment rented</span>
                              )}
                            </td>

                            {/* 4. Products Rented (Itemized) */}
                            <td>
                              {m.products && m.products.length > 0 ? (
                                <div className="adm-prod-itemized-list">
                                  {m.products.map((p, pIdx) => (
                                    <span key={p.name} className="adm-prod-chip">
                                      {p.name} <strong>(x{p.count})</strong>
                                      {pIdx < m.products.length - 1 ? " • " : ""}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="adm-text-muted">-</span>
                              )}
                            </td>

                            {/* 5. Total Revenue */}
                            <td className="adm-cell-price">
                              {m.grossSales > 0 ? (
                                <>
                                  <strong>₹{m.grossSales.toLocaleString("en-IN")}</strong>
                                  <div className="adm-date-hint">Deposits: ₹{m.deposits.toLocaleString("en-IN")}</div>
                                </>
                              ) : (
                                <span className="adm-text-muted">₹0</span>
                              )}
                            </td>

                            {/* 6. Action */}
                            <td>
                              {m.totalOrders > 0 ? (
                                <button
                                  type="button"
                                  className="adm-btn-subtle adm-btn-view-month"
                                  onClick={() => {
                                    setReportMonthFilter(String(m.monthNum));
                                    setReportViewMode("transactions");
                                  }}
                                  title={`View all ${m.totalOrders} orders in ${m.monthName}`}
                                >
                                  <i className="ri-file-list-3-line"></i>
                                  <span>View {m.totalOrders} Orders</span>
                                </button>
                              ) : (
                                <span className="adm-text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="adm-table-tfoot">
                          <td>
                            <strong>Annual Totals ({reportYearFilter}):</strong>
                          </td>
                          <td>
                            <strong>{monthlyReportData.totalAnnualOrders} Total Orders</strong>
                            <div className="adm-date-hint">
                              {monthlyReportData.totalAnnualCompleted} Completed • {monthlyReportData.totalAnnualOrders - monthlyReportData.totalAnnualCompleted} In-Progress
                            </div>
                          </td>
                          <td>
                            <div className="adm-cat-pills-wrap">
                              {monthlyReportData.annualCategories.map((c) => (
                                <span
                                  key={c.category}
                                  className={`adm-category-tag cat-${c.category.toLowerCase().replace(/\s+/g, "-")}`}
                                >
                                  {c.category} <strong>{c.count}</strong>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <strong>{monthlyReportData.uniqueProductsCount} Unique Equipment Models Rented</strong>
                          </td>
                          <td className="adm-cell-price">
                            <strong>₹{monthlyReportData.totalAnnualRevenue.toLocaleString("en-IN")}</strong>
                            <div className="adm-date-hint">Total Deposits: ₹{monthlyReportData.totalAnnualDeposits.toLocaleString("en-IN")}</div>
                          </td>
                          <td>
                            <span className="adm-date-hint">Peak: {monthlyReportData.peakMonth}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                {/* Table View 2: Itemized Monthly Sales Transactions Ledger */}
                {reportViewMode === "transactions" && (
                  <div className="adm-monthly-transactions-wrap">
                    <div className="adm-month-filter-ribbon">
                      <div className="adm-filter-group">
                        <label htmlFor="report-month-filter">Filter Month:</label>
                        <div className="adm-select-wrapper">
                          <select
                            id="report-month-filter"
                            value={reportMonthFilter}
                            onChange={(e) => setReportMonthFilter(e.target.value)}
                          >
                            <option value="All">All Months of {reportYearFilter} ({monthlyReportData.totalAnnualOrders} orders)</option>
                            {MONTH_NAMES.map((m, idx) => (
                              <option key={m} value={idx + 1}>
                                {m} {reportYearFilter} ({monthlyReportData.months[idx]?.totalOrders || 0} orders)
                              </option>
                            ))}
                          </select>
                          <i className="ri-arrow-down-s-line adm-select-arrow"></i>
                        </div>
                      </div>

                      <div className="adm-month-sales-badge">
                        <span>Orders Count:</span>
                        <strong>{monthlyReportTransactions.length} Orders</strong>
                        <span className="adm-sep">|</span>
                        <span>Total Revenue:</span>
                        <strong>
                          ₹{monthlyReportTransactions
                            .filter((o) => o.status !== "Cancelled")
                            .reduce((sum, o) => sum + (o.rentalFee || o.total || 0), 0)
                            .toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="adm-btn-subtle"
                        onClick={() => setReportViewMode("monthlyLedger")}
                      >
                        <i className="ri-arrow-left-line"></i>
                        <span>Back to 12-Month Table</span>
                      </button>
                    </div>

                    <div className="adm-table-wrap">
                      <div className="adm-mobile-scroll-hint">
                        <i className="ri-arrow-left-right-line"></i>
                        <span>Swipe table sideways to view all columns</span>
                      </div>
                      {monthlyReportTransactions.length === 0 ? (
                        <div className="adm-empty-table">
                          <i className="ri-calendar-line"></i>
                          <h4>No orders recorded in this month</h4>
                          <p>Choose another month from the selector above or return to the 12-month summary.</p>
                        </div>
                      ) : (
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>Order / Sale #</th>
                              <th>Date</th>
                              <th>Customer</th>
                              <th>Equipment Rented</th>
                              <th>Tenure</th>
                              <th>Rental Tariff</th>
                              <th>Deposit Held</th>
                              <th>Total Amount</th>
                              <th>Payment Mode</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthlyReportTransactions.map((sale) => (
                              <tr key={sale.id}>
                                <td className="adm-code-cell">{sale.id}</td>
                                <td>
                                  <span className="adm-date-cell">{sale.startDate}</span>
                                </td>
                                <td>
                                  <strong>{sale.customer}</strong>
                                  <div className="adm-date-hint">{sale.customerCity} • {sale.customerPhone}</div>
                                </td>
                                <td>
                                  <strong>{sale.equipment}</strong>
                                  <div>
                                    <span className={`adm-category-tag cat-${getProductCategory(sale.equipment, equipmentList).toLowerCase().replace(/\s+/g, "-")}`}>
                                      {getProductCategory(sale.equipment, equipmentList)}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="adm-pill">{sale.duration}</span>
                                </td>
                                <td className="adm-cell-price">
                                  ₹{Number(sale.rentalFee || sale.total || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="adm-cell-deposit">
                                  ₹{Number(sale.securityDeposit || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="adm-cell-total">
                                  <strong>₹{Number((sale.rentalFee || sale.total || 0) + (sale.securityDeposit || 0)).toLocaleString("en-IN")}</strong>
                                </td>
                                <td>
                                  <span className="adm-payment-pill">{sale.paymentMode}</span>
                                </td>
                                <td>
                                  <span className={`adm-badge ${getBadgeClass(sale.status)}`}>
                                    {sale.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="adm-table-tfoot">
                              <td colSpan="5">
                                <strong>Month's Total:</strong>
                              </td>
                              <td className="adm-cell-price">
                                <strong>
                                  ₹{monthlyReportTransactions
                                    .filter((o) => o.status !== "Cancelled")
                                    .reduce((sum, o) => sum + (o.rentalFee || o.total || 0), 0)
                                    .toLocaleString("en-IN")}
                                </strong>
                              </td>
                              <td className="adm-cell-deposit">
                                <strong>
                                  ₹{monthlyReportTransactions
                                    .filter((o) => o.status !== "Cancelled")
                                    .reduce((sum, o) => sum + (o.securityDeposit || 0), 0)
                                    .toLocaleString("en-IN")}
                                </strong>
                              </td>
                              <td className="adm-cell-total">
                                <strong>
                                  ₹{monthlyReportTransactions
                                    .filter((o) => o.status !== "Cancelled")
                                    .reduce((sum, o) => sum + (o.rentalFee || o.total || 0) + (o.securityDeposit || 0), 0)
                                    .toLocaleString("en-IN")}
                                </strong>
                              </td>
                              <td colSpan="2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: DELIVERY FLEET & LOGISTICS PARTNERS
             ======================================================== */}
          {activeTab === "Delivery" && (
            <div className="adm-tab-content">
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h3 className="adm-panel-title">Delivery Fleet & Partner Operations</h3>
                    <p className="adm-panel-sub">
                      Assigned delivery personnel, EV fleet dispatch status, and real-time order handover tracking.
                    </p>
                  </div>
                </div>

                {/* FLEET KPIS */}
                <div className="adm-sales-kpis" style={{ marginBottom: "20px" }}>
                  <div className="adm-kpi-card">
                    <span className="adm-kpi-label">Active Delivery Partners</span>
                    <strong className="adm-kpi-val" style={{ color: "#16a34a" }}>
                      1 Partner Online
                    </strong>
                    <div className="adm-kpi-sub">
                      <span>CH.N.V.S. Hithesh • On Duty</span>
                    </div>
                  </div>

                  <div className="adm-kpi-card">
                    <span className="adm-kpi-label">Eco Fleet</span>
                    <strong className="adm-kpi-val" style={{ color: "#2563eb" }}>
                      1 EV Scooter
                    </strong>
                    <div className="adm-kpi-sub">
                      <span>Registration: AP-37</span>
                    </div>
                  </div>

                  <div className="adm-kpi-card">
                    <span className="adm-kpi-label">Central Hub</span>
                    <strong className="adm-kpi-val" style={{ color: "#0f172a" }}>
                      Powerpet, Eluru
                    </strong>
                    <div className="adm-kpi-sub">
                      <span>Full City Doorstep Coverage</span>
                    </div>
                  </div>

                  <div className="adm-kpi-card">
                    <span className="adm-kpi-label">Handover Verification</span>
                    <strong className="adm-kpi-val" style={{ color: "#059669" }}>
                      Direct Handover
                    </strong>
                    <div className="adm-kpi-sub">
                      <span>No OTP Required • Cash/UPI</span>
                    </div>
                  </div>
                </div>

                {/* DELIVERY PARTNER PROFILE CARD */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "24px",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: "#eff6ff",
                          border: "2px solid #3b82f6",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          fontWeight: "800",
                          position: "relative",
                        }}
                      >
                        CH
                        <span
                          style={{
                            position: "absolute",
                            bottom: "1px",
                            right: "1px",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#16a34a",
                            borderRadius: "50%",
                            border: "2px solid #ffffff",
                          }}
                        ></span>
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                            CH.N.V.S. Hithesh
                          </h3>
                          <span
                            style={{
                              backgroundColor: "#f0fdf4",
                              color: "#166534",
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            <i className="ri-checkbox-circle-fill"></i> Primary Delivery Partner
                          </span>
                          <span
                            style={{
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #bfdbfe",
                            }}
                          >
                            4.9 ★ (180+ Deliveries)
                          </span>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                          Lead Field Operations & Doorstep Inspection Partner
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <a
                        href="tel:+917396348793"
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="ri-phone-fill"></i> Call Partner (+91 73963 48793)
                      </a>
                      <a
                        href="mailto:ch.n.v.s.hithesh@gmail.com"
                        style={{
                          backgroundColor: "#f8fafc",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="ri-mail-line"></i> Email Partner
                      </a>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px",
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <small style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Assigned Vehicle</small>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "2px" }}>
                        <i className="ri-riding-line" style={{ color: "#2563eb", marginRight: "4px" }}></i> EV Scooter (AP-37)
                      </div>
                    </div>

                    <div>
                      <small style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Operating Hub</small>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "2px" }}>
                        <i className="ri-store-2-line" style={{ color: "#2563eb", marginRight: "4px" }}></i> Powerpet Central Logistics Hub, Eluru
                      </div>
                    </div>

                    <div>
                      <small style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Partner Phone</small>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginTop: "2px" }}>
                        <i className="ri-phone-line" style={{ color: "#2563eb", marginRight: "4px" }}></i> +91 73963 48793
                      </div>
                    </div>

                    <div>
                      <small style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>Background Verification</small>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#166534", marginTop: "2px" }}>
                        <i className="ri-shield-check-fill" style={{ color: "#16a34a", marginRight: "4px" }}></i> Govt ID & Police Verified
                      </div>
                    </div>
                  </div>
                </div>

                {/* DISPATCH QUEUE TABLE */}
                <div className="adm-panel-head" style={{ marginBottom: "12px", borderBottom: "none", padding: "0 0 4px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                      Active Dispatches & Assigned Deliveries ({ordersList.filter(o => o.status !== "Cancelled").length})
                    </h4>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                      Orders routed to CH.N.V.S. Hithesh for doorstep delivery in Eluru.
                    </p>
                  </div>
                </div>

                <div className="adm-table-wrap">
                  {ordersList.filter(o => o.status !== "Cancelled").length === 0 ? (
                    <div className="adm-empty-table">
                      <i className="ri-truck-line"></i>
                      <h4>No active delivery dispatches</h4>
                      <p>All placed orders will be assigned to CH.N.V.S. Hithesh and shown here.</p>
                    </div>
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Gadget Rented</th>
                          <th>Destination Address</th>
                          <th>Assigned Rider</th>
                          <th>Vehicle</th>
                          <th>Live Delivery Stage</th>
                          <th>Navigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersList
                          .filter((o) => o.status !== "Cancelled")
                          .map((o) => (
                            <tr key={o.id}>
                              <td className="adm-code-cell">{o.id}</td>
                              <td>
                                <strong>{o.customer}</strong>
                                <div className="adm-date-hint">{o.customerPhone}</div>
                              </td>
                              <td>{o.equipment}</td>
                              <td>
                                <div style={{ fontSize: "12px", color: "#334155", maxWidth: "220px" }}>
                                  {o.destinationAddress || "Powerpet Main Road, Eluru - 534002"}
                                </div>
                              </td>
                              <td>
                                <strong>{o.deliveryBoyName || "CH.N.V.S. Hithesh"}</strong>
                                <div className="adm-date-hint">{o.deliveryBoyPhone || "+91 73963 48793"}</div>
                              </td>
                              <td>
                                <span className="adm-pill">{o.deliveryBoyVehicle || "EV Scooter (AP-37)"}</span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    backgroundColor: o.trackingStage >= 6 ? "#f0fdf4" : o.trackingStage >= 4 ? "#eff6ff" : "#fffbeb",
                                    color: o.trackingStage >= 6 ? "#166534" : o.trackingStage >= 4 ? "#1d4ed8" : "#b45309",
                                    fontWeight: "700",
                                    border: `1px solid ${o.trackingStage >= 6 ? "#bbf7d0" : o.trackingStage >= 4 ? "#bfdbfe" : "#fef3c7"}`,
                                    display: "inline-block",
                                  }}
                                >
                                  {o.deliveryStatus || (o.trackingStage >= 6 ? "Delivered & Active" : o.trackingStage >= 4 ? "Out for Delivery" : o.trackingStage >= 2 ? "Heading to Pickup" : "Assigned")}
                                </span>
                              </td>
                              <td>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o.deliveryBoyHub || "Shop #4, Powerpet Main Road, Eluru")}&destination=${encodeURIComponent(o.destinationAddress || "Powerpet Main Road, Eluru")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    backgroundColor: "#eff6ff",
                                    color: "#2563eb",
                                    border: "1px solid #bfdbfe",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i className="ri-map-pin-2-fill"></i> Maps Route
                                </a>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          ADD PRODUCT MODAL
         ======================================================== */}
      {showAddModal && (
        <div className="adm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>Add Product to Catalog</h3>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="adm-modal-form">
              <div className="adm-form-field">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sony Alpha A7 IV Mirrorless Camera"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div className="adm-form-grid">
                <div className="adm-form-field">
                  <label>Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                  >
                    <option value="Projectors">Projectors</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Sound Boxes">Sound Boxes</option>
                    <option value="Laptops">Laptops</option>
                  </select>
                </div>

                <div className="adm-form-field">
                  <label>Daily Rent (₹/day) *</label>
                  <input
                    type="number"
                    placeholder="199"
                    value={newProdRate}
                    onChange={(e) => setNewProdRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="adm-form-grid">
                <div className="adm-form-field">
                  <label>Refundable Deposit (₹)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={newProdDeposit}
                    onChange={(e) => setNewProdDeposit(e.target.value)}
                  />
                </div>

                <div className="adm-form-field">
                  <label>Stock Units</label>
                  <input
                    type="number"
                    value={newProdUnits}
                    onChange={(e) => setNewProdUnits(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-form-field">
                <label>Key Specifications</label>
                <textarea
                  rows="3"
                  placeholder="e.g. 33MP Full-Frame sensor, 4K 60p, dual card slots, with batteries."
                  value={newProdSpecs}
                  onChange={(e) => setNewProdSpecs(e.target.value)}
                ></textarea>
              </div>

              <div className="adm-modal-actions">
                <button
                  type="button"
                  className="adm-btn-subtle"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Publish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
