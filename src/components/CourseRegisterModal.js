"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Landmark } from "lucide-react";
import { translations } from "@/lib/translations";
import { ShinyButton } from "@/components/ShinyButton";

export default function CourseRegisterModal({ isOpen, onClose, lang: propLang }) {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    shift: "morning",
    paymentReference: "",
    amountPaid: "2500"
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

  if (!isOpen) return null;

  const t = translations[lang] || translations["en"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.studentName || !form.studentPhone || !form.studentEmail || !form.paymentReference) {
      setError(lang === "en" ? "Please complete all fields on the registration form." : "እባክዎን ሁሉንም የምዝገባ መስኮች ያጠናቅቁ።");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/course-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setForm({
          studentName: "",
          studentPhone: "",
          studentEmail: "",
          shift: "morning",
          paymentReference: "",
          amountPaid: "2500"
        });
      } else {
        setError(data.error || (lang === "en" ? "Tuition registration failed." : "ምዝገባው አልተሳካም።"));
      }
    } catch (err) {
      setError(lang === "en" ? "Connection to server failed. Please try again." : "ከአገልጋዩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X size={22} />
        </button>

        <h2 className="font-serif text-xl font-bold text-[#d4af37] mb-2 flex items-center gap-2">
          {t.regTitle}
        </h2>
        <p className="text-xs text-[#c9bfbc] mb-6">
          {t.regDesc}
        </p>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">{t.regSuccess}</h3>
            <p className="text-sm text-[#c9bfbc] max-w-sm mx-auto leading-relaxed">
              {lang === "en" 
                ? `Your registration has been submitted. Payment reference is being verified via CBE web scraping.`
                : `የምዝገባ ማመልከቻዎ ገብቷል። የክፍያ ማጣቀሻ ቁጥርዎ በCBE ድረ-ገጽ ፍተሻ አማካኝነት እየተረጋገጠ ነው።`
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

            {/* Instruction bank box */}
            <div className="bg-[#1a100e] border border-[#d4af37]/20 p-4 rounded mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <Landmark size={14} /> {t.payInstructions}
              </h3>
              <p className="text-xs text-[#c9bfbc] leading-relaxed mb-2">
                {t.payDesc}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#d4af37]/10 pt-2 font-mono">
                <div>
                  <span className="text-[#8c7e7a] block">{t.bankNameLabel}:</span>
                  <span className="text-white block font-sans">{t.bankNameVal}</span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block">{t.accNoLabel}:</span>
                  <span className="text-white block">1000444555666</span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block">{t.accNameLabel}:</span>
                  <span className="text-white block font-sans">VC Cake Academy</span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block">{t.costLabel}:</span>
                  <span className="text-[#d4af37] block font-bold">2,500.00 ETB</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelName}</label>
                <input
                  type="text"
                  name="studentName"
                  value={form.studentName}
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
                  name="studentPhone"
                  value={form.studentPhone}
                  onChange={handleChange}
                  placeholder={t.placeholderPhone}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelEmail}</label>
              <input
                type="email"
                name="studentEmail"
                value={form.studentEmail}
                onChange={handleChange}
                placeholder={t.placeholderEmail}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.selectShiftLabel}</label>
                <select
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706] cursor-pointer"
                >
                  <option value="morning">{lang === "en" ? "Morning Shift (9 AM - 12 PM)" : "የጠዋት ፈረቃ (ከጠዋቱ 3 - 6 ሰዓት)"}</option>
                  <option value="afternoon">{lang === "en" ? "Afternoon Shift (2 PM - 5 PM)" : "ከሰዓት በኋላ ፈረቃ (ከከሰዓት 8 - 11 ሰዓት)"}</option>
                  <option value="night">{lang === "en" ? "Night Shift (6 PM - 9 PM)" : "የማታ ፈረቃ (ከምሽቱ 12 - 3 ሰዓት)"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.amountPaidLabel}</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  className="input-field bg-white/5 text-gray-300 select-none font-bold"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">
                {t.cbeRefLabel}
              </label>
              <input
                type="text"
                name="paymentReference"
                value={form.paymentReference}
                onChange={handleChange}
                placeholder="e.g. FT2608123456"
                className="input-field font-mono uppercase font-bold text-[#d4af37]"
                required
              />
              <span className="text-[10px] text-[#8c7e7a] block mt-1">
                {t.cbeRefHelper}
              </span>
            </div>

            <ShinyButton
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? t.submittingReg : t.submitRegBtn}
            </ShinyButton>
          </form>
        )}
      </div>
    </div>
  );
}
