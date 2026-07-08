"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Landmark, Cake } from "lucide-react";
import { translations } from "@/lib/translations";
import { ShinyButton } from "@/components/ShinyButton";

export default function CakeOrderModal({ isOpen, onClose, lang: propLang }) {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    cakeType: "Wedding Cake",
    sizeKg: "2",
    layers: "1",
    flavor: "Chocolate Fudge",
    description: "",
    deliveryDate: "",
    paymentReference: "",
    amountPaid: "1600"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync language configuration
  useEffect(() => {
    if (isOpen) {
      setLang(propLang || localStorage.getItem("lang") || "en");
    }
  }, [propLang, isOpen]);

  // Calculate cost dynamically
  useEffect(() => {
    const size = parseFloat(form.sizeKg) || 1;
    const layers = parseInt(form.layers) || 1;
    const price = size * 800 + (layers - 1) * 300;
    setForm((f) => ({ ...f, amountPaid: price.toString() }));
  }, [form.sizeKg, form.layers]);

  if (!isOpen) return null;

  const t = translations[lang] || translations["en"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.customerName ||
      !form.customerPhone ||
      !form.deliveryDate ||
      !form.paymentReference ||
      !form.description
    ) {
      setError(lang === "en" ? "Please fill out all fields, including details on decoration text/design." : "እባክዎን የኬክ ማስዋቢያ ጽሁፍን ጨምሮ ሁሉንም መስኮች ይሙሉ።");
      return;
    }

    const selectedDate = new Date(form.deliveryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      setError(lang === "en" ? "Delivery date must be at least 24 hours in advance." : "ኬኩን የሚረከቡበት ቀን ቢያንስ ከ24 ሰዓት በፊት መሆን አለበት።");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cake-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setForm({
          customerName: "",
          customerPhone: "",
          cakeType: "Wedding Cake",
          sizeKg: "2",
          layers: "1",
          flavor: "Chocolate Fudge",
          description: "",
          deliveryDate: "",
          paymentReference: "",
          amountPaid: "1600"
        });
      } else {
        setError(data.error || (lang === "en" ? "Order placement failed." : "ትዕዛዙን ማስገባት አልተሳካም።"));
      }
    } catch (err) {
      setError(lang === "en" ? "Connection to server failed. Please try again." : "ከአገልጋዩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X size={22} />
        </button>

        <h2 className="font-serif text-xl font-bold text-[#d4af37] mb-2 flex items-center gap-2">
          <Cake size={20} /> {t.orderTitle}
        </h2>
        <p className="text-xs text-[#c9bfbc] mb-4">
          {t.orderDesc}
        </p>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">{t.orderSuccess}</h3>
            <p className="text-sm text-[#c9bfbc] max-w-sm mx-auto leading-relaxed">
              {lang === "en"
                ? `Your custom cake order is registered. Payment reference is being verified via CBE web scraping.`
                : `የኬክ ማዘዣዎ ተመዝግቧል። የክፍያ ማጣቀሻ ቁጥርዎ በCBE ድረ-ገጽ ፍተሻ አማካኝነት እየተረጋገጠ ነው።`
              }
            </p>
            <button onClick={onClose} className="gold-btn px-6 py-2 rounded text-sm mt-4 cursor-pointer">
              {t.closeBtn}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded flex gap-2 items-start">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Bank details info */}
            <div className="bg-[#1a100e] border border-[#d4af37]/20 p-4 rounded">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <Landmark size={14} /> {t.payInstructions}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[#8c7e7a] block">{t.accNoLabel}:</span>
                  <span className="text-white block font-bold">1000444555666</span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block">{t.accNameLabel}:</span>
                  <span className="text-white block">VC Cake Academy</span>
                </div>
                <div className="col-span-2 border-t border-[#d4af37]/10 pt-2 flex justify-between items-center font-sans">
                  <span className="text-[#c9bfbc]">{t.calcCostLabel}:</span>
                  <span className="text-[#d4af37] text-sm font-bold">
                    {Number(form.amountPaid).toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelName}</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder={t.placeholderName}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelPhone}</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder={t.placeholderPhone}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelCakeType}</label>
                <select
                  name="cakeType"
                  value={form.cakeType}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706] cursor-pointer"
                >
                  <option value="Wedding Cake">{lang === "en" ? "Wedding Cake" : "የሰርግ ኬክ"}</option>
                  <option value="Birthday Cake">{lang === "en" ? "Birthday Cake" : "የልደት ኬክ"}</option>
                  <option value="Roll Cake / Pastries">{lang === "en" ? "Roll Cake / Pastries" : "ሮል ኬክ / ኬኮች"}</option>
                  <option value="Anniversary Cake">{lang === "en" ? "Anniversary Cake" : "የዓመት በዓል ኬክ"}</option>
                  <option value="Holiday Custom Cake">{lang === "en" ? "Holiday Custom Cake" : "የበዓል ልዩ ኬክ"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelSize}</label>
                <select
                  name="sizeKg"
                  value={form.sizeKg}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706]"
                >
                  <option value="1">{lang === "en" ? "1 KG (800 Birr)" : "1 ኪሎ (800 ብር)"}</option>
                  <option value="2">{lang === "en" ? "2 KG (1600 Birr)" : "2 ኪሎ (1600 ብር)"}</option>
                  <option value="3">{lang === "en" ? "3 KG (2400 Birr)" : "3 ኪሎ (2400 ብር)"}</option>
                  <option value="4">{lang === "en" ? "4 KG (3200 Birr)" : "4 ኪሎ (3200 ብር)"}</option>
                  <option value="5">{lang === "en" ? "5 KG (4000 Birr)" : "5 ኪሎ (4000 ብር)"}</option>
                  <option value="6">{lang === "en" ? "6 KG (4800 Birr)" : "6 ኪሎ (4800 ብር)"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelLayers}</label>
                <select
                  name="layers"
                  value={form.layers}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706]"
                >
                  <option value="1">{lang === "en" ? "1 Layer" : "1 ደረጃ"}</option>
                  <option value="2">{lang === "en" ? "2 Layers (+300 Birr)" : "2 ደረጃ (+300 ብር)"}</option>
                  <option value="3">{lang === "en" ? "3 Layers (+600 Birr)" : "3 ደረጃ (+600 ብር)"}</option>
                  <option value="4">{lang === "en" ? "4 Layers (+900 Birr)" : "4 ደረጃ (+900 ብር)"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelFlavor}</label>
                <select
                  name="flavor"
                  value={form.flavor}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706] cursor-pointer"
                >
                  <option value="Chocolate Fudge">{lang === "en" ? "Chocolate Fudge" : "ቸኮሌት ፉጅ"}</option>
                  <option value="Classic Vanilla Cream">{lang === "en" ? "Classic Vanilla Cream" : "ቫኒላ ክሬም"}</option>
                  <option value="Strawberry Shortcake">{lang === "en" ? "Strawberry Shortcake" : "ስትሮቤሪ ሾርትኬክ"}</option>
                  <option value="Red Velvet Cream Cheese">{lang === "en" ? "Red Velvet Cream Cheese" : "ሬድ ቬልቬት ክሬም ቺዝ"}</option>
                  <option value="Salted Caramel Fudge">{lang === "en" ? "Salted Caramel Fudge" : "ሶልትድ ካራሜል"}</option>
                  <option value="Mocha Coffee Buttercream">{lang === "en" ? "Mocha Coffee Buttercream" : "ሞካ ቡና በቅቤ ክሬም"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelDeliveryDate}</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={form.deliveryDate}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">
                {t.labelDecoDetails}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t.placeholderDeco}
                rows={3}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">
                  {t.cbeRefLabel}
                </label>
                <input
                  type="text"
                  name="paymentReference"
                  value={form.paymentReference}
                  onChange={handleChange}
                  placeholder="e.g. FT2608987654"
                  className="input-field font-mono uppercase font-bold text-[#d4af37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelAmountTransferred}</label>
                <input
                  type="text"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  className="input-field bg-white/5 font-bold text-gray-300 select-none"
                  readOnly
                />
              </div>
            </div>

            <ShinyButton
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? t.submittingOrder : t.submitOrderBtn}
            </ShinyButton>
          </form>
        )}
      </div>
    </div>
  );
}
