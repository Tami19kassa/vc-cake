"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Settings,
  Users,
  Cake,
  FileText,
  MessageSquare,
  LogOut,
  Landmark,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  QrCode,
  Layers
} from "lucide-react";
import AdminScannerModal from "@/components/AdminScannerModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("registrations");
  
  // Dashboard Data State
  const [data, setData] = useState({ registrations: [], orders: [], contacts: [], mockTransactions: [] });
  const [loading, setLoading] = useState(true);
  
  // Hero Edit State (bilingual splits + dynamic configs)
  const [heroForm, setHeroForm] = useState({
    titleEn: "", titleAm: "",
    subtitleEn: "", subtitleAm: "",
    ctaTextEn: "", ctaTextAm: "",
    imageUrl: "",
    cbeAccountNo: "",
    cbeAccountHolder: "",
    telebirrPhone: "",
    telebirrAccountHolder: "",
    contactPhone1: "",
    contactPhone2: "",
    contactEmail: "",
    contactAddressEn: "",
    contactAddressAm: "",
    coursePrice: "",
    layerPrice: "",
    coursesEnabled: true,
    ordersEnabled: true,
    morningShiftEnabled: true,
    afternoonShiftEnabled: true,
    nightShiftEnabled: true,
    morningShiftCapacity: "30",
    afternoonShiftCapacity: "30",
    nightShiftCapacity: "30"
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroMsg, setHeroMsg] = useState("");

  // Article Edit State (bilingual splits)
  const [articles, setArticles] = useState([]);
  const [artForm, setArtForm] = useState({
    id: null,
    titleEn: "", titleAm: "",
    contentEn: "", contentAm: "",
    type: "blog",
    mediaUrl: ""
  });
  const [artLoading, setArtLoading] = useState(false);
  const [artMsg, setArtMsg] = useState("");

  // Products / Catalog state
  const [products, setProducts] = useState([]);
  const [prodForm, setProdForm] = useState({
    id: null,
    name: "",
    category: "Cakes",
    basePrice: "",
    image: "",
    stock: "10",
    isEnabled: true
  });
  const [prodLoading, setProdLoading] = useState(false);
  const [prodMsg, setProdMsg] = useState("");

  // Filtering & Sorting State
  const [search, setSearch] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("all");
  const [regShiftFilter, setRegShiftFilter] = useState("all");
  const [regSort, setRegSort] = useState("date-desc");

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState("all");
  const [orderSort, setOrderSort] = useState("date-desc");
  const [orderDeliveryFilter, setOrderDeliveryFilter] = useState("all");
  const [orderDeliveryCustomDate, setOrderDeliveryCustomDate] = useState("");

  // Scraper action feedback
  const [scraperFeedback, setScraperFeedback] = useState({ id: null, type: "", message: "", error: "", loading: false });

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminUser");
    if (!savedToken) {
      router.push("/admin/login");
      return;
    }
    setToken(savedToken);
    setAdminUser(JSON.parse(savedUser));
  }, [router]);

  const fetchDashboardData = async (jwtToken) => {
    if (!jwtToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      const resData = await res.json();
      if (resData.success) {
        setArticles(resData.articles);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHeroSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const resData = await res.json();
      if (resData.success && resData.settings) {
        let tEn = "", tAm = "", sEn = "", sAm = "", cEn = "", cAm = "";
        try {
          const parsed = JSON.parse(resData.settings.title);
          tEn = parsed.en || ""; tAm = parsed.am || "";
        } catch (e) { tEn = resData.settings.title || ""; }
        
        try {
          const parsed = JSON.parse(resData.settings.subtitle);
          sEn = parsed.en || ""; sAm = parsed.am || "";
        } catch (e) { sEn = resData.settings.subtitle || ""; }

        try {
          const parsed = JSON.parse(resData.settings.ctaText);
          cEn = parsed.en || ""; cAm = parsed.am || "";
        } catch (e) { cEn = resData.settings.ctaText || ""; }

        setHeroForm({
          titleEn: tEn, titleAm: tAm,
          subtitleEn: sEn, subtitleAm: sAm,
          ctaTextEn: cEn, ctaTextAm: cAm,
          imageUrl: resData.settings.imageUrl || "",
          cbeAccountNo: resData.settings.cbeAccountNo || "",
          cbeAccountHolder: resData.settings.cbeAccountHolder || "",
          telebirrPhone: resData.settings.telebirrPhone || "",
          telebirrAccountHolder: resData.settings.telebirrAccountHolder || "",
          contactPhone1: resData.settings.contactPhone1 || "",
          contactPhone2: resData.settings.contactPhone2 || "",
          contactEmail: resData.settings.contactEmail || "",
          contactAddressEn: resData.settings.contactAddressEn || "",
          contactAddressAm: resData.settings.contactAddressAm || "",
          coursePrice: resData.settings.coursePrice !== undefined ? String(resData.settings.coursePrice) : "",
          layerPrice: resData.settings.layerPrice !== undefined ? String(resData.settings.layerPrice) : "",
          coursesEnabled: resData.settings.coursesEnabled !== false && resData.settings.coursesEnabled !== 0,
          ordersEnabled: resData.settings.ordersEnabled !== false && resData.settings.ordersEnabled !== 0,
          morningShiftEnabled: resData.settings.morningShiftEnabled !== false && resData.settings.morningShiftEnabled !== 0,
          afternoonShiftEnabled: resData.settings.afternoonShiftEnabled !== false && resData.settings.afternoonShiftEnabled !== 0,
          nightShiftEnabled: resData.settings.nightShiftEnabled !== false && resData.settings.nightShiftEnabled !== 0,
          morningShiftCapacity: resData.settings.morningShiftCapacity !== undefined ? String(resData.settings.morningShiftCapacity) : "30",
          afternoonShiftCapacity: resData.settings.afternoonShiftCapacity !== undefined ? String(resData.settings.afternoonShiftCapacity) : "30",
          nightShiftCapacity: resData.settings.nightShiftCapacity !== undefined ? String(resData.settings.nightShiftCapacity) : "30"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const resData = await res.json();
      if (resData.success) {
        setProducts(resData.products);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData(token);
      fetchArticles();
      fetchHeroSettings();
      fetchProducts();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  // Helper to extract JSON strings
  const getLocalVal = (jsonStr, key = "en") => {
    if (!jsonStr) return "";
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object") {
        return parsed[key] || parsed["en"] || "";
      }
    } catch (e) {
      return jsonStr;
    }
    return jsonStr;
  };

  // Run CBE Scraper payment verification
  const handleScraperVerification = async (item, type) => {
    setScraperFeedback({ id: item.id, type, message: "", error: "", loading: true });
    
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: item.id,
          type,
          reference: item.paymentReference,
          expectedAmount: item.amountPaid
        })
      });
      const resData = await res.json();
      
      if (resData.success) {
        setScraperFeedback({ id: item.id, type, message: resData.message, error: "", loading: false });
        fetchDashboardData(token);
      } else {
        setScraperFeedback({ id: item.id, type, message: "", error: resData.error, loading: false });
      }
    } catch (err) {
      setScraperFeedback({ id: item.id, type, message: "", error: "Verification crawler execution failed.", loading: false });
    }
  };

  // Manual Status Approval
  const handleManualStatus = async (id, type, action) => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, type, action })
      });
      const resData = await res.json();
      if (resData.success) {
        fetchDashboardData(token);
      } else {
        alert(resData.error || "Operation failed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings Form (serializes fields to JSON)
  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    setHeroMsg("");
    setHeroLoading(true);

    const payload = {
      title: JSON.stringify({ en: heroForm.titleEn, am: heroForm.titleAm }),
      subtitle: JSON.stringify({ en: heroForm.subtitleEn, am: heroForm.subtitleAm }),
      ctaText: JSON.stringify({ en: heroForm.ctaTextEn, am: heroForm.ctaTextAm }),
      imageUrl: heroForm.imageUrl,
      cbeAccountNo: heroForm.cbeAccountNo,
      cbeAccountHolder: heroForm.cbeAccountHolder,
      telebirrPhone: heroForm.telebirrPhone,
      telebirrAccountHolder: heroForm.telebirrAccountHolder,
      contactPhone1: heroForm.contactPhone1,
      contactPhone2: heroForm.contactPhone2,
      contactEmail: heroForm.contactEmail,
      contactAddressEn: heroForm.contactAddressEn,
      contactAddressAm: heroForm.contactAddressAm,
      coursePrice: heroForm.coursePrice !== "" ? Number(heroForm.coursePrice) : undefined,
      layerPrice: heroForm.layerPrice !== "" ? Number(heroForm.layerPrice) : undefined,
      coursesEnabled: heroForm.coursesEnabled,
      ordersEnabled: heroForm.ordersEnabled,
      morningShiftEnabled: heroForm.morningShiftEnabled,
      afternoonShiftEnabled: heroForm.afternoonShiftEnabled,
      nightShiftEnabled: heroForm.nightShiftEnabled,
      morningShiftCapacity: heroForm.morningShiftCapacity !== "" ? Number(heroForm.morningShiftCapacity) : 30,
      afternoonShiftCapacity: heroForm.afternoonShiftCapacity !== "" ? Number(heroForm.afternoonShiftCapacity) : 30,
      nightShiftCapacity: heroForm.nightShiftCapacity !== "" ? Number(heroForm.nightShiftCapacity) : 30
    };

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        setHeroMsg(resData.message);
      } else {
        setHeroMsg("Error: " + resData.error);
      }
    } catch (err) {
      setHeroMsg("Failed to update settings.");
    } finally {
      setHeroLoading(false);
    }
  };

  // Create or Update Article Form (serializes fields to JSON)
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setArtMsg("");
    setArtLoading(true);

    const isUpdate = artForm.id !== null;
    const url = "/api/articles";
    const method = isUpdate ? "PUT" : "POST";

    const payload = {
      id: artForm.id,
      title: JSON.stringify({ en: artForm.titleEn, am: artForm.titleAm }),
      content: JSON.stringify({ en: artForm.contentEn, am: artForm.contentAm }),
      type: artForm.type,
      mediaUrl: artForm.mediaUrl
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        setArtMsg(resData.message);
        setArtForm({ id: null, titleEn: "", titleAm: "", contentEn: "", contentAm: "", type: "blog", mediaUrl: "" });
        fetchArticles();
      } else {
        setArtMsg("Error: " + resData.error);
      }
    } catch (err) {
      setArtMsg("Failed to submit article.");
    } finally {
      setArtLoading(false);
    }
  };

  // Delete Article
  const handleArticleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/articles?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        fetchArticles();
      } else {
        alert(resData.error || "Delete failed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Edit Article trigger
  const handleArticleEditTrigger = (art) => {
    let tEn = "", tAm = "", cEn = "", cAm = "";
    try {
      const parsed = JSON.parse(art.title);
      tEn = parsed.en || ""; tAm = parsed.am || "";
    } catch (e) { tEn = art.title; }

    try {
      const parsed = JSON.parse(art.content);
      cEn = parsed.en || ""; cAm = parsed.am || "";
    } catch (e) { cEn = art.content; }

    setArtForm({
      id: art.id,
      titleEn: tEn,
      titleAm: tAm,
      contentEn: cEn,
      contentAm: cAm,
      type: art.type,
      mediaUrl: art.mediaUrl
    });
    setArtMsg("Editing article #" + art.id);
  };

  // Product Catalog CRUD methods
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProdMsg("");
    setProdLoading(true);

    const isUpdate = prodForm.id !== null;
    const url = "/api/products";
    const method = isUpdate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(prodForm)
      });
      const resData = await res.json();
      if (resData.success) {
        setProdMsg(resData.message);
        setProdForm({ id: null, name: "", category: "Cakes", basePrice: "", image: "", stock: "10", isEnabled: true });
        fetchProducts();
      } else {
        setProdMsg("Error: " + resData.error);
      }
    } catch (err) {
      setProdMsg("Failed to process product request.");
    } finally {
      setProdLoading(false);
    }
  };

  const handleProductToggle = async (prod) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: prod.id,
          isEnabled: !prod.isEnabled
        })
      });
      const resData = await res.json();
      if (resData.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to toggle product status:", err);
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this catalog item?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await res.json();
      if (resData.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // Filter lists based on advanced search, status, shift and category filters
  const filteredRegs = data.registrations
    .filter((r) => {
      const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          r.paymentReference.toLowerCase().includes(search.toLowerCase()) ||
                          r.studentPhone.toLowerCase().includes(search.toLowerCase());
      const matchStatus = regStatusFilter === "all" || r.status === regStatusFilter;
      const matchShift = regShiftFilter === "all" || r.shift.toLowerCase() === regShiftFilter;
      return matchSearch && matchStatus && matchShift;
    })
    .sort((a, b) => {
      if (regSort === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (regSort === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (regSort === "name-asc") return a.studentName.localeCompare(b.studentName);
      if (regSort === "name-desc") return b.studentName.localeCompare(a.studentName);
      return 0;
    });

  const filteredOrders = data.orders
    .filter((o) => {
      const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          o.paymentReference.toLowerCase().includes(search.toLowerCase()) ||
                          o.customerPhone.toLowerCase().includes(search.toLowerCase()) ||
                          o.cakeType.toLowerCase().includes(search.toLowerCase());
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const matchCategory = orderCategoryFilter === "all" || o.cakeType.toLowerCase().includes(orderCategoryFilter.toLowerCase());
      
      let matchDelivery = true;
      if (orderDeliveryFilter !== "all") {
        const todayStr = new Date().toISOString().split("T")[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        const oDateStr = o.deliveryDate;

        if (orderDeliveryFilter === "today") {
          matchDelivery = oDateStr === todayStr;
        } else if (orderDeliveryFilter === "tomorrow") {
          matchDelivery = oDateStr === tomorrowStr;
        } else if (orderDeliveryFilter === "this-week") {
          const diffTime = new Date(oDateStr) - new Date(todayStr);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          matchDelivery = diffDays >= 0 && diffDays <= 7;
        } else if (orderDeliveryFilter === "custom" && orderDeliveryCustomDate) {
          matchDelivery = oDateStr === orderDeliveryCustomDate;
        }
      }
      return matchSearch && matchStatus && matchCategory && matchDelivery;
    })
    .sort((a, b) => {
      if (orderSort === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (orderSort === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (orderSort === "delivery-asc") return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      if (orderSort === "delivery-desc") return new Date(b.deliveryDate) - new Date(a.deliveryDate);
      if (orderSort === "name-asc") return a.customerName.localeCompare(b.customerName);
      if (orderSort === "name-desc") return b.customerName.localeCompare(a.customerName);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0c0706] text-white flex flex-col font-sans">
      
      {/* Dashboard Top Header bar */}
      <header className="bg-[#120a09] border-b border-[#d4af37]/15 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4af37]/10 p-2 rounded border border-[#d4af37]/35 text-[#d4af37]">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold">VC CAKE ACADEMY</h1>
            <p className="text-[10px] text-[#c9bfbc] tracking-widest uppercase">Admin Panel Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#c9bfbc] hidden sm:inline">Logged in: <strong>{adminUser?.username}</strong></span>
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/35 text-[#d4af37] text-xs px-3 py-1.5 rounded transition cursor-pointer"
          >
            <QrCode size={13} /> Scan QR Code
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-300 text-xs px-3 py-1.5 rounded transition cursor-pointer"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Admin QR Code Scanner Modal */}
      <AdminScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      {/* Main Body container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#0e0807] border-b md:border-b-0 md:border-r border-[#d4af37]/10 p-4 space-y-2 shrink-0">
          {[
            { id: "registrations", label: "Course Registrations", icon: <Users size={16} />, count: data.registrations.length },
            { id: "orders", label: "Celebration Cake Orders", icon: <Cake size={16} />, count: data.orders.length },
            { id: "products", label: "Manage Catalog", icon: <Layers size={16} />, count: products.length },
            { id: "articles", label: "Vlogs & Blogs", icon: <FileText size={16} />, count: articles.length },
            { id: "settings", label: "Hero Settings", icon: <Settings size={16} /> },
            { id: "contacts", label: "User Inquiries", icon: <MessageSquare size={16} />, count: data.contacts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch("");
              }}
              className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded text-sm transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold border border-[#d4af37]/25"
                  : "text-[#c9bfbc] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              {tab.count !== undefined && (
                <span className="text-[10px] bg-white/10 text-white font-bold px-2 py-0.5 rounded-full font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          
          <div className="pt-8 border-t border-[#d4af37]/10 mt-8 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-[#8c7e7a] hover:text-[#d4af37] transition px-3 py-1"
            >
              ← Back to Main Website
            </Link>
            <Link
              href="/cbe-bank-portal"
              className="flex items-center gap-2 text-xs text-[#8c7e7a] hover:text-blue-400 transition px-3 py-1"
            >
              🏦 Open CBE Merchant Ledger
            </Link>
          </div>
        </aside>

        {/* Workspace panel */}
        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
              <div className="w-10 h-10 border-2 border-t-transparent border-[#d4af37] rounded-full animate-spin" />
              <span className="text-xs text-[#8c7e7a] font-mono">Fetching admin statistics...</span>
            </div>
          ) : (
            <>


              {/* TAB 1: COURSE REGISTRATIONS LIST */}
              {activeTab === "registrations" && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Total Registered</span>
                      <span className="text-xl font-bold font-serif text-white mt-1">{data.registrations.length}</span>
                    </div>
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Approved</span>
                      <span className="text-xl font-bold font-serif text-[#d4af37] mt-1">
                        {data.registrations.filter(r => r.status === "approved").length}
                      </span>
                    </div>
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Pending</span>
                      <span className="text-xl font-bold font-serif text-yellow-500/80 mt-1">
                        {data.registrations.filter(r => r.status === "pending").length}
                      </span>
                    </div>
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Total Tuition Revenue</span>
                      <span className="text-xl font-bold font-serif text-[#d4af37] mt-1">
                        {data.registrations.filter(r => r.status === "approved").reduce((sum, r) => sum + Number(r.amountPaid), 0).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg">
                    <div className="relative w-full md:flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Users size={15} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search student name, phone, email, or reference number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10 w-full"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <select
                        value={regStatusFilter}
                        onChange={(e) => setRegStatusFilter(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <select
                        value={regShiftFilter}
                        onChange={(e) => setRegShiftFilter(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="all">All Shifts</option>
                        <option value="morning">Morning Shift</option>
                        <option value="afternoon">Afternoon Shift</option>
                        <option value="night">Night Shift</option>
                      </select>

                      <select
                        value={regSort}
                        onChange={(e) => setRegSort(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#120a09] border border-[#d4af37]/10 rounded-lg p-5">
                    <h3 className="font-serif text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-3 mb-4">
                      Course Registrations List
                    </h3>
                  
                  {filteredRegs.length === 0 ? (
                    <div className="text-center text-[#8c7e7a] py-12">No registrations found matching search criteria.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#d4af37]/15 text-[#8c7e7a] text-xs uppercase font-semibold">
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Shift Details</th>
                            <th className="px-4 py-3">Reference ID</th>
                            <th className="px-4 py-3">Amount Paid</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRegs.map((reg) => (
                            <tr key={reg.id} className="border-b border-[#d4af37]/5 hover:bg-white/5 text-[#c9bfbc]">
                              <td className="px-4 py-3">
                                <span className="block font-bold text-white">{reg.studentName}</span>
                                <span className="block text-[10px] text-[#8c7e7a]">{reg.studentEmail} | {reg.studentPhone}</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-white capitalize">{reg.shift} shift</td>
                              <td className="px-4 py-3 font-mono font-bold text-white">{reg.paymentReference}</td>
                              <td className="px-4 py-3 font-mono">{Number(reg.amountPaid).toFixed(2)} ETB</td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    reg.status === "approved"
                                      ? "bg-green-500/10 text-green-400"
                                      : reg.status === "rejected"
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {reg.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-y-2">
                                {/* Scraper button */}
                                {reg.status === "pending" && (
                                  <button
                                    onClick={() => handleScraperVerification(reg, "course")}
                                    disabled={scraperFeedback.loading && scraperFeedback.id === reg.id}
                                    className="flex items-center justify-center gap-1.5 w-full bg-blue-900/60 hover:bg-blue-800 text-blue-300 text-[10px] py-1 px-2.5 rounded border border-blue-500/35 transition disabled:opacity-50 cursor-pointer"
                                  >
                                    <Landmark size={11} /> 
                                    {scraperFeedback.loading && scraperFeedback.id === reg.id ? "Scraping..." : "Verify via CBE Scraper"}
                                  </button>
                                )}

                                {/* Manual Override buttons */}
                                <div className="flex gap-1 justify-end">
                                  {reg.status !== "approved" && (
                                    <button
                                      onClick={() => handleManualStatus(reg.id, "course", "approved")}
                                      className="p-1 bg-green-950 text-green-400 border border-green-500/20 rounded hover:bg-green-900 cursor-pointer"
                                      title="Approve Payment Manually"
                                    >
                                      <Check size={11} />
                                    </button>
                                  )}
                                  {reg.status !== "rejected" && (
                                    <button
                                      onClick={() => handleManualStatus(reg.id, "course", "rejected")}
                                      className="p-1 bg-red-950 text-red-400 border border-red-500/20 rounded hover:bg-red-900 cursor-pointer"
                                      title="Reject Payment"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>

                                {/* Scraper feedback alert inside the row */}
                                {scraperFeedback.id === reg.id && scraperFeedback.type === "course" && (
                                  <div className="text-left mt-2">
                                    {scraperFeedback.message && (
                                      <span className="text-[10px] text-green-400 block whitespace-normal font-sans max-w-[200px] leading-tight">
                                        ✓ {scraperFeedback.message}
                                      </span>
                                    )}
                                    {scraperFeedback.error && (
                                      <span className="text-[10px] text-red-400 block whitespace-normal font-sans max-w-[200px] leading-tight flex items-start gap-1">
                                        <AlertCircle size={10} className="shrink-0 mt-0.5" />
                                        <span>{scraperFeedback.error}</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* TAB 2: CELEBRATION CAKE ORDERS LIST */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Total Orders Made</span>
                      <span className="text-xl font-bold font-serif text-white mt-1">{data.orders.length}</span>
                    </div>
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Approved Orders</span>
                      <span className="text-xl font-bold font-serif text-[#d4af37] mt-1">
                        {data.orders.filter(o => o.status === "approved").length}
                      </span>
                    </div>
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Pending Orders</span>
                      <span className="text-xl font-bold font-serif text-yellow-500/80 mt-1">
                        {data.orders.filter(o => o.status === "pending").length}
                      </span>
                    </div>
                    <div className="bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg flex flex-col justify-between">
                      <span className="text-[10px] text-[#8c7e7a] uppercase font-semibold">Total Cake Revenue</span>
                      <span className="text-xl font-bold font-serif text-[#d4af37] mt-1">
                        {data.orders.filter(o => o.status === "approved").reduce((sum, o) => sum + Number(o.amountPaid), 0).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#120a09] border border-[#d4af37]/10 p-4 rounded-lg">
                    <div className="relative w-full md:flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Cake size={15} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search customer name, phone, type, or reference number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10 w-full"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <select
                        value={orderCategoryFilter}
                        onChange={(e) => setOrderCategoryFilter(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="Cake">Cakes</option>
                        <option value="Cupcake">Cupcakes</option>
                      </select>

                      <select
                        value={orderDeliveryFilter}
                        onChange={(e) => setOrderDeliveryFilter(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="all">All Deliveries</option>
                        <option value="today">Today's Deliveries</option>
                        <option value="tomorrow">Tomorrow's Deliveries</option>
                        <option value="this-week">This Week's Deliveries</option>
                        <option value="custom">Custom Delivery Date</option>
                      </select>

                      {orderDeliveryFilter === "custom" && (
                        <input
                          type="date"
                          value={orderDeliveryCustomDate}
                          onChange={(e) => setOrderDeliveryCustomDate(e.target.value)}
                          className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none font-mono"
                        />
                      )}

                      <select
                        value={orderSort}
                        onChange={(e) => setOrderSort(e.target.value)}
                        className="input-field bg-[#0c0706] text-xs cursor-pointer flex-1 md:flex-none"
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="delivery-asc">Delivery Date (Earliest First)</option>
                        <option value="delivery-desc">Delivery Date (Latest First)</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#120a09] border border-[#d4af37]/10 rounded-lg p-5">
                    <h3 className="font-serif text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-3 mb-4">
                      Custom Celebration Cake Orders
                    </h3>
                  
                  {filteredOrders.length === 0 ? (
                    <div className="text-center text-[#8c7e7a] py-12">No custom cake orders found matching search criteria.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#d4af37]/15 text-[#8c7e7a] text-xs uppercase font-semibold">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Occasion & Flavor</th>
                            <th className="px-4 py-3">Weight & Layers</th>
                            <th className="px-4 py-3">Decoration Details</th>
                            <th className="px-4 py-3">Delivery</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b border-[#d4af37]/5 hover:bg-white/5 text-[#c9bfbc]">
                              <td className="px-4 py-3">
                                <span className="block font-bold text-white">{order.customerName}</span>
                                <span className="block text-[10px] text-[#8c7e7a]">{order.customerPhone}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="block font-medium text-white">{order.cakeType}</span>
                                <span className="block text-[10px] text-[#d4af37]">{order.flavor}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="block">{order.sizeKg} KG</span>
                                <span className="block text-[10px] text-[#8c7e7a]">{order.layers} Layer(s)</span>
                              </td>
                              <td className="px-4 py-3 max-w-xs whitespace-pre-line text-[10px] italic">
                                "{order.description}"
                              </td>
                              <td className="px-4 py-3 font-semibold text-white">{order.deliveryDate}</td>
                              <td className="px-4 py-3">
                                <span className="block font-mono font-bold text-white">{order.paymentReference}</span>
                                <span className="block text-xs font-bold text-[#d4af37]">{Number(order.amountPaid).toFixed(2)} ETB</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    order.status === "approved"
                                      ? "bg-green-500/10 text-green-400"
                                      : order.status === "rejected"
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {order.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-y-2">
                                {/* Scraper button */}
                                {order.status === "pending" && (
                                  <button
                                    onClick={() => handleScraperVerification(order, "order")}
                                    disabled={scraperFeedback.loading && scraperFeedback.id === order.id}
                                    className="flex items-center justify-center gap-1.5 w-full bg-blue-900/60 hover:bg-blue-800 text-blue-300 text-[10px] py-1 px-2.5 rounded border border-blue-500/35 transition disabled:opacity-50 cursor-pointer"
                                  >
                                    <Landmark size={11} /> 
                                    {scraperFeedback.loading && scraperFeedback.id === order.id ? "Scraping..." : "Verify via CBE Scraper"}
                                  </button>
                                )}

                                {/* Manual Override buttons */}
                                <div className="flex gap-1 justify-end">
                                  {order.status !== "approved" && (
                                    <button
                                      onClick={() => handleManualStatus(order.id, "order", "approved")}
                                      className="p-1 bg-green-950 text-green-400 border border-green-500/20 rounded hover:bg-green-900 cursor-pointer"
                                      title="Approve Payment Manually"
                                    >
                                      <Check size={11} />
                                    </button>
                                  )}
                                  {order.status !== "rejected" && (
                                    <button
                                      onClick={() => handleManualStatus(order.id, "order", "rejected")}
                                      className="p-1 bg-red-950 text-red-400 border border-red-500/20 rounded hover:bg-red-900 cursor-pointer"
                                      title="Reject Payment"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>

                                {/* Scraper feedback alert inside the row */}
                                {scraperFeedback.id === order.id && scraperFeedback.type === "order" && (
                                  <div className="text-left mt-2">
                                    {scraperFeedback.message && (
                                      <span className="text-[10px] text-green-400 block whitespace-normal font-sans max-w-[200px] leading-tight">
                                        ✓ {scraperFeedback.message}
                                      </span>
                                    )}
                                    {scraperFeedback.error && (
                                      <span className="text-[10px] text-red-400 block whitespace-normal font-sans max-w-[200px] leading-tight flex items-start gap-1">
                                        <AlertCircle size={10} className="shrink-0 mt-0.5" />
                                        <span>{scraperFeedback.error}</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* TAB 3: VLOGS & BLOGS CRUD MANAGER */}
              {activeTab === "articles" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Article Form Panel */}
                  <div className="bg-[#120a09] p-6 rounded-lg border border-[#d4af37]/15 h-fit">
                    <h3 className="font-serif text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-3 mb-4 flex items-center gap-2">
                      <Plus size={18} /> {artForm.id ? "Edit Article Post" : "Add Vlog or Blog Post"}
                    </h3>
                    
                    {artMsg && <div className="bg-[#d4af37]/10 border border-[#d4af37]/35 text-[#d4af37] p-3 rounded mb-4 text-xs font-semibold">{artMsg}</div>}
                    
                    <form onSubmit={handleArticleSubmit} className="space-y-4 text-sm">
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Post Category Type</label>
                        <select
                          value={artForm.type}
                          onChange={(e) => setArtForm({ ...artForm, type: e.target.value })}
                          className="input-field bg-[#0c0706]"
                        >
                          <option value="blog">Baking Blog (Reads image link)</option>
                          <option value="vlog">Video Vlog (Reads YouTube embed link)</option>
                        </select>
                      </div>

                      {/* Title inputs */}
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Article Title (English)</label>
                          <input
                            type="text"
                            value={artForm.titleEn}
                            onChange={(e) => setArtForm({ ...artForm, titleEn: e.target.value })}
                            placeholder="e.g. How to decorate custom cupcakes"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Article Title (Amharic)</label>
                          <input
                            type="text"
                            value={artForm.titleAm}
                            onChange={(e) => setArtForm({ ...artForm, titleAm: e.target.value })}
                            placeholder="ምሳሌ፡ ኬክን እንዴት በሚያምር ሁኔታ ማጌጥ ይቻላል"
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">
                          {artForm.type === "vlog" ? "YouTube Embed URL" : "Blog Image URL"}
                        </label>
                        <input
                          type="url"
                          value={artForm.mediaUrl}
                          onChange={(e) => setArtForm({ ...artForm, mediaUrl: e.target.value })}
                          placeholder={
                            artForm.type === "vlog"
                              ? "e.g. https://www.youtube.com/embed/v8yH7Boc9sw"
                              : "e.g. https://images.unsplash.com/photo-..."
                          }
                          className="input-field font-mono text-xs"
                          required
                        />
                      </div>

                      {/* Content textareas */}
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Content / Description (English)</label>
                        <textarea
                          value={artForm.contentEn}
                          onChange={(e) => setArtForm({ ...artForm, contentEn: e.target.value })}
                          placeholder="Write the body text in English..."
                          rows={4}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Content / Description (Amharic)</label>
                        <textarea
                          value={artForm.contentAm}
                          onChange={(e) => setArtForm({ ...artForm, contentAm: e.target.value })}
                          placeholder="የመጣጥፉን ዝርዝር መግለጫ እዚህ ይጻፉ..."
                          rows={4}
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={artLoading}
                          className="flex-1 gold-btn py-2 rounded text-xs font-semibold cursor-pointer"
                        >
                          {artLoading ? "Saving Post..." : artForm.id ? "Update Post" : "Publish Post"}
                        </button>
                        {artForm.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setArtForm({ id: null, titleEn: "", titleAm: "", contentEn: "", contentAm: "", type: "blog", mediaUrl: "" });
                              setArtMsg("");
                            }}
                            className="bg-gray-800 text-gray-400 hover:text-white px-3 py-2 rounded text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Articles Feed */}
                  <div className="xl:col-span-2 space-y-4">
                    {articles.length === 0 ? (
                      <div className="text-center text-[#8c7e7a] py-20 bg-[#120a09] rounded-lg border border-[#d4af37]/10">
                        No articles posted yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {articles.map((art) => (
                          <div key={art.id} className="bg-[#120a09] border border-[#d4af37]/10 rounded-lg p-5 flex flex-col justify-between space-y-4 relative">
                            <span className="absolute top-4 right-4 text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20 uppercase">
                              {art.type}
                            </span>
                            
                            <div className="space-y-2">
                              <h4 className="font-serif text-base font-bold text-white line-clamp-1">
                                {getLocalVal(art.title, "en")}
                              </h4>
                              <p className="text-[9px] text-[#8c7e7a] font-mono truncate">{art.mediaUrl}</p>
                              <p className="text-xs text-[#c9bfbc] line-clamp-3 leading-relaxed whitespace-pre-line">
                                {getLocalVal(art.content, "en")}
                              </p>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-3">
                              <span className="text-[10px] text-[#8c7e7a]">Post #{art.id}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleArticleEditTrigger(art)}
                                  className="p-1.5 bg-white/5 text-gray-300 rounded hover:bg-white/10 cursor-pointer"
                                  title="Edit Post"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleArticleDelete(art.id)}
                                  className="p-1.5 bg-red-950 text-red-400 rounded hover:bg-red-900 border border-red-500/10 cursor-pointer"
                                  title="Delete Post"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LANDING HERO TEXT EDITOR */}
              {activeTab === "settings" && (
                <div className="max-w-2xl bg-[#120a09] p-8 rounded-lg border border-[#d4af37]/15">
                  <h3 className="font-serif text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-3 mb-6 flex items-center gap-2">
                    <Settings size={18} /> Modify Frontend Hero Texts
                  </h3>

                  {heroMsg && <div className="bg-[#d4af37]/10 border border-[#d4af37]/35 text-[#d4af37] p-3 rounded mb-6 text-xs font-semibold">{heroMsg}</div>}

                  <form onSubmit={handleHeroSubmit} className="space-y-5 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Hero Main Title (English)</label>
                        <input
                          type="text"
                          value={heroForm.titleEn}
                          onChange={(e) => setHeroForm({ ...heroForm, titleEn: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Hero Main Title (Amharic)</label>
                        <input
                          type="text"
                          value={heroForm.titleAm}
                          onChange={(e) => setHeroForm({ ...heroForm, titleAm: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Hero Subtitle Paragraph (English)</label>
                        <textarea
                          value={heroForm.subtitleEn}
                          onChange={(e) => setHeroForm({ ...heroForm, subtitleEn: e.target.value })}
                          rows={3}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Hero Subtitle Paragraph (Amharic)</label>
                        <textarea
                          value={heroForm.subtitleAm}
                          onChange={(e) => setHeroForm({ ...heroForm, subtitleAm: e.target.value })}
                          rows={3}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">CTA Button Text (English)</label>
                        <input
                          type="text"
                          value={heroForm.ctaTextEn}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaTextEn: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">CTA Button Text (Amharic)</label>
                        <input
                          type="text"
                          value={heroForm.ctaTextAm}
                          onChange={(e) => setHeroForm({ ...heroForm, ctaTextAm: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Hero Image URL (Background removed PNG)</label>
                      <input
                        type="text"
                        value={heroForm.imageUrl}
                        onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                        placeholder="e.g. https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop"
                        className="input-field font-mono text-xs"
                      />
                      <span className="text-[10px] text-[#8c7e7a] block mt-1">Provide a transparent background PNG or high-quality image URL representing the chef.</span>
                    </div>

                    {/* SECTION: CBE CREDENTIALS */}
                    <div className="border-t border-[#d4af37]/15 pt-5 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Landmark size={15} /> Commercial Bank of Ethiopia (CBE) Merchant Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">CBE Account Number</label>
                          <input
                            type="text"
                            value={heroForm.cbeAccountNo}
                            onChange={(e) => setHeroForm({ ...heroForm, cbeAccountNo: e.target.value })}
                            placeholder="e.g. 1000444555666"
                            className="input-field font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">CBE Account Holder Name</label>
                          <input
                            type="text"
                            value={heroForm.cbeAccountHolder}
                            onChange={(e) => setHeroForm({ ...heroForm, cbeAccountHolder: e.target.value })}
                            placeholder="e.g. Biruk Tigistu Lugaba"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION: TELEBIRR CREDENTIALS */}
                    <div className="border-t border-[#d4af37]/15 pt-5 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-[#d4af37] flex items-center gap-1.5">
                        <QrCode size={15} /> Telebirr Mobile Pay Merchant Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Telebirr Merchant Phone / ID</label>
                          <input
                            type="text"
                            value={heroForm.telebirrPhone}
                            onChange={(e) => setHeroForm({ ...heroForm, telebirrPhone: e.target.value })}
                            placeholder="e.g. 251911378448"
                            className="input-field font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Telebirr Account Holder Name</label>
                          <input
                            type="text"
                            value={heroForm.telebirrAccountHolder}
                            onChange={(e) => setHeroForm({ ...heroForm, telebirrAccountHolder: e.target.value })}
                            placeholder="e.g. Kibrom Haileselassie Abreha"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION: ACADEMY CONTACT DETAILS */}
                    <div className="border-t border-[#d4af37]/15 pt-5 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-[#d4af37] flex items-center gap-1.5">
                        <MessageSquare size={15} /> Academy Contact Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Contact Phone 1</label>
                          <input
                            type="text"
                            value={heroForm.contactPhone1}
                            onChange={(e) => setHeroForm({ ...heroForm, contactPhone1: e.target.value })}
                            placeholder="e.g. 098 979 4444"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Contact Phone 2</label>
                          <input
                            type="text"
                            value={heroForm.contactPhone2}
                            onChange={(e) => setHeroForm({ ...heroForm, contactPhone2: e.target.value })}
                            placeholder="e.g. 093 480 2222"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Contact Email</label>
                          <input
                            type="email"
                            value={heroForm.contactEmail}
                            onChange={(e) => setHeroForm({ ...heroForm, contactEmail: e.target.value })}
                            placeholder="e.g. info@vccakeacademy.com"
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Academy Address (English)</label>
                          <input
                            type="text"
                            value={heroForm.contactAddressEn}
                            onChange={(e) => setHeroForm({ ...heroForm, contactAddressEn: e.target.value })}
                            placeholder="e.g. Bole, Addis Ababa"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Academy Address (Amharic)</label>
                          <input
                            type="text"
                            value={heroForm.contactAddressAm}
                            onChange={(e) => setHeroForm({ ...heroForm, contactAddressAm: e.target.value })}
                            placeholder="e.g. ቦሌ፣ አዲስ አበባ"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION: PRICING CONFIGURATION */}
                    <div className="border-t border-[#d4af37]/15 pt-5 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Landmark size={15} /> Pricing Configurations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Course Registration Fee (ETB)</label>
                          <input
                            type="number"
                            value={heroForm.coursePrice}
                            onChange={(e) => setHeroForm({ ...heroForm, coursePrice: e.target.value })}
                            placeholder="e.g. 2500"
                            className="input-field font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Additional Layer Price (ETB)</label>
                          <input
                            type="number"
                            value={heroForm.layerPrice}
                            onChange={(e) => setHeroForm({ ...heroForm, layerPrice: e.target.value })}
                            placeholder="e.g. 300"
                            className="input-field font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION: SYSTEM STATUS & SERVICE TOGGLES */}
                    <div className="border-t border-[#d4af37]/15 pt-5 space-y-4">
                      <h4 className="font-serif text-sm font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Settings size={15} /> Service Status & Course Shifts Enablement
                      </h4>
                      
                      <div className="bg-[#0c0706] p-4 rounded border border-[#d4af37]/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block font-medium text-white text-xs">Enable Course Registrations</span>
                            <span className="text-[10px] text-[#8c7e7a]">Globally allow new student registrations online</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={heroForm.coursesEnabled}
                            onChange={(e) => setHeroForm({ ...heroForm, coursesEnabled: e.target.checked })}
                            className="w-4 h-4 rounded text-[#d4af37] bg-black border-[#d4af37]/30 focus:ring-[#d4af37]/50"
                          />
                        </div>

                        <div className="flex items-center justify-between border-t border-[#d4af37]/5 pt-3">
                          <div>
                            <span className="block font-medium text-white text-xs">Enable Cake Ordering</span>
                            <span className="text-[10px] text-[#8c7e7a]">Globally allow customers to submit cake orders</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={heroForm.ordersEnabled}
                            onChange={(e) => setHeroForm({ ...heroForm, ordersEnabled: e.target.checked })}
                            className="w-4 h-4 rounded text-[#d4af37] bg-black border-[#d4af37]/30 focus:ring-[#d4af37]/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#0c0706] p-3 rounded border border-[#d4af37]/10 flex flex-col justify-between items-start gap-3">
                          <span className="text-xs font-medium text-white">Morning Shift</span>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-[#8c7e7a]">Active</span>
                            <input
                              type="checkbox"
                              checked={heroForm.morningShiftEnabled}
                              onChange={(e) => setHeroForm({ ...heroForm, morningShiftEnabled: e.target.checked })}
                              className="w-4 h-4 rounded text-[#d4af37] bg-black border-[#d4af37]/30"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-[10px] text-[#c9bfbc] mb-1">Seats Capacity</label>
                            <input
                              type="number"
                              value={heroForm.morningShiftCapacity || ""}
                              onChange={(e) => setHeroForm({ ...heroForm, morningShiftCapacity: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="30"
                            />
                          </div>
                        </div>

                        <div className="bg-[#0c0706] p-3 rounded border border-[#d4af37]/10 flex flex-col justify-between items-start gap-3">
                          <span className="text-xs font-medium text-white">Afternoon Shift</span>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-[#8c7e7a]">Active</span>
                            <input
                              type="checkbox"
                              checked={heroForm.afternoonShiftEnabled}
                              onChange={(e) => setHeroForm({ ...heroForm, afternoonShiftEnabled: e.target.checked })}
                              className="w-4 h-4 rounded text-[#d4af37] bg-black border-[#d4af37]/30"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-[10px] text-[#c9bfbc] mb-1">Seats Capacity</label>
                            <input
                              type="number"
                              value={heroForm.afternoonShiftCapacity || ""}
                              onChange={(e) => setHeroForm({ ...heroForm, afternoonShiftCapacity: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="30"
                            />
                          </div>
                        </div>

                        <div className="bg-[#0c0706] p-3 rounded border border-[#d4af37]/10 flex flex-col justify-between items-start gap-3">
                          <span className="text-xs font-medium text-white">Night Shift</span>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-[#8c7e7a]">Active</span>
                            <input
                              type="checkbox"
                              checked={heroForm.nightShiftEnabled}
                              onChange={(e) => setHeroForm({ ...heroForm, nightShiftEnabled: e.target.checked })}
                              className="w-4 h-4 rounded text-[#d4af37] bg-black border-[#d4af37]/30"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-[10px] text-[#c9bfbc] mb-1">Seats Capacity</label>
                            <input
                              type="number"
                              value={heroForm.nightShiftCapacity || ""}
                              onChange={(e) => setHeroForm({ ...heroForm, nightShiftCapacity: e.target.value })}
                              className="input-field text-xs py-1"
                              placeholder="30"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={heroLoading}
                      className="w-full gold-btn py-2.5 rounded font-semibold text-sm transition mt-8 cursor-pointer"
                    >
                      {heroLoading ? "Updating Settings..." : "Save Settings & Configurations"}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB: PRODUCTS CATALOG MANAGEMENT */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  {/* Create / Edit Form segment */}
                  <div className="bg-[#120a09] border border-[#d4af37]/10 rounded-lg p-5">
                    <h3 className="font-serif text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-3 mb-4 flex items-center gap-2">
                      <Layers size={18} /> {prodForm.id ? `Edit Catalog Item #${prodForm.id}` : "Add New Catalog Item / Product"}
                    </h3>

                    {prodMsg && <div className="bg-[#d4af37]/10 border border-[#d4af37]/35 text-[#d4af37] p-3 rounded mb-4 text-xs font-semibold">{prodMsg}</div>}

                    <form onSubmit={handleProductSubmit} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Product Category</label>
                          <select
                            value={prodForm.category}
                            onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                            className="input-field bg-[#0c0706] cursor-pointer"
                          >
                            <option value="Cakes">Cakes</option>
                            <option value="Cupcakes">Cupcakes</option>
                            <option value="Pastries">Pastries</option>
                            <option value="Cookies">Cookies</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Product / Item Name</label>
                          <input
                            type="text"
                            value={prodForm.name}
                            onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                            placeholder="e.g. Chocolate Fudge Velvet"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Base Price (ETB)</label>
                          <input
                            type="number"
                            value={prodForm.basePrice}
                            onChange={(e) => setProdForm({ ...prodForm, basePrice: e.target.value })}
                            placeholder="e.g. 800"
                            className="input-field font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Image URL</label>
                          <input
                            type="text"
                            value={prodForm.image || ""}
                            onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                            placeholder="e.g. https://images.unsplash.com/photo-..."
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Available Stock Quantity</label>
                          <input
                            type="number"
                            value={prodForm.stock || ""}
                            onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                            placeholder="e.g. 15"
                            className="input-field font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        {prodForm.id && (
                          <button
                            type="button"
                            onClick={() => setProdForm({ id: null, name: "", category: "Cakes", basePrice: "", image: "", stock: "10", isEnabled: true })}
                            className="bg-red-950/20 border border-red-500/30 text-red-400 py-2 px-4 text-xs rounded cursor-pointer transition hover:bg-red-900/40"
                          >
                            Cancel Edit
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={prodLoading}
                          className="gold-btn py-2 px-6 text-xs font-semibold cursor-pointer"
                        >
                          {prodForm.id ? "Save Changes" : "Create Product"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Products Grid List */}
                  <div className="bg-[#120a09] border border-[#d4af37]/10 rounded-lg p-5">
                    <h3 className="font-serif text-lg font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-3 mb-4">
                      Active Catalog Products List
                    </h3>

                    {products.length === 0 ? (
                      <div className="text-center text-[#8c7e7a] py-12">No products found in catalog database.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[#d4af37]/15 text-[#8c7e7a] text-xs uppercase font-semibold">
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Product Name</th>
                              <th className="px-4 py-3">Base Price</th>
                              <th className="px-4 py-3 text-center">Stock</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((prod) => (
                              <tr key={prod.id} className="border-b border-[#d4af37]/5 hover:bg-white/[0.02]">
                                <td className="px-4 py-3 font-medium text-[#d4af37]">{prod.category}</td>
                                <td className="px-4 py-3 text-white font-serif flex items-center gap-3">
                                  {prod.image ? (
                                    <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded object-cover border border-[#d4af37]/25" />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-[#0c0706] border border-[#d4af37]/15 flex items-center justify-center text-[9px] text-[#8c7e7a]">No Img</div>
                                  )}
                                  <span>{prod.name}</span>
                                </td>
                                <td className="px-4 py-3 font-mono">{Number(prod.basePrice).toLocaleString()} ETB</td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-white">{prod.stock !== undefined ? prod.stock : 10}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleProductToggle(prod)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                      prod.isEnabled
                                        ? "bg-green-500/10 border border-green-500/30 text-green-400"
                                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                                    }`}
                                  >
                                    {prod.isEnabled ? "Enabled" : "Disabled"}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => {
                                        setProdForm({ 
                                          id: prod.id, 
                                          name: prod.name, 
                                          category: prod.category, 
                                          basePrice: String(prod.basePrice), 
                                          image: prod.image || "", 
                                          stock: String(prod.stock !== undefined ? prod.stock : 10),
                                          isEnabled: prod.isEnabled 
                                        });
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                      className="border border-[#d4af37]/20 hover:bg-[#d4af37]/10 text-[#d4af37] p-1.5 rounded cursor-pointer"
                                      title="Edit Item"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleProductDelete(prod.id)}
                                      className="border border-red-500/20 hover:bg-red-500/10 text-red-400 p-1.5 rounded cursor-pointer"
                                      title="Delete Item"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CONTACT INQUIRIES */}
              {activeTab === "contacts" && (
                <div>
                  {data.contacts.length === 0 ? (
                    <div className="text-center text-[#8c7e7a] py-20 bg-[#120a09] rounded-lg border border-[#d4af37]/10">
                      No contact inquiries received.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.contacts.map((msg) => (
                        <div key={msg.id} className="bg-[#120a09] border border-[#d4af37]/10 rounded-lg p-6 space-y-4">
                          <div className="flex justify-between items-start border-b border-[#d4af37]/10 pb-3">
                            <div>
                              <h4 className="font-serif text-base font-bold text-white">{msg.name}</h4>
                              <span className="text-[10px] text-[#8c7e7a]">{msg.email}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-[#c9bfbc] leading-relaxed whitespace-pre-line">
                            "{msg.message}"
                          </div>
                          <div className="text-xs text-[#d4af37] font-semibold pt-2 border-t border-white/5">
                            Callback Phone: {msg.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </main>
      </div>

    </div>
  );
}
