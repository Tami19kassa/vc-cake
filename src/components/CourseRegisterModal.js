"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Landmark } from "lucide-react";
import { translations } from "@/lib/translations";
import { ShinyButton } from "@/components/ShinyButton";

export default function CourseRegisterModal({ isOpen, onClose, lang: propLang, settings }) {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState({
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    shift: "morning",
    paymentReference: "",
    amountPaid: "2500",
    paymentMethod: "cbe"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Sync language configuration
  useEffect(() => {
    if (isOpen) {
      setLang(propLang || localStorage.getItem("lang") || "en");
    }
  }, [propLang, isOpen]);

  // Auto-trigger print when success becomes available
  useEffect(() => {
    if (success) {
      handlePrintReceipt();
    }
  }, [success]);

  if (!isOpen) return null;

  const t = translations[lang] || translations["en"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePrintReceipt = () => {
    if (!success) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      window.location.origin + `/admin/verify?type=registration&id=${success.id}&ref=${success.paymentReference}`
    )}&color=4a2c11&bgcolor=fdfbf7`;

    const printWindow = window.open("", "_blank");
    
    const rowsHtml = [
      { label: "Student Name", value: success.studentName },
      { label: "Phone Number", value: success.studentPhone },
      { label: "Payment Method", value: (success.paymentMethod || "cbe").toUpperCase() },
      { label: "Transaction ID / Ref", value: success.paymentReference },
      { label: "Course Shift", value: success.shift.toUpperCase() },
      { label: "Amount Paid", value: `${Number(success.amountPaid).toLocaleString()} ETB` }
    ].map(row => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e7e3dd; font-size: 13px;">
        <span style="color: #8c7e7a; font-weight: 500;">${row.label}:</span>
        <span style="font-weight: bold; color: #4a2c11;">${row.value}</span>
      </div>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - VC Cake Academy</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #2c1d11; background: #fdfbf7; text-align: center; }
            .receipt-card { border: 2px dashed #4a2c11; padding: 30px; border-radius: 16px; max-width: 440px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(74, 44, 17, 0.05); }
            .logo { font-size: 24px; font-weight: 800; color: #4a2c11; font-family: Georgia, serif; letter-spacing: 2px; margin-bottom: 4px; }
            .sub { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8c7e7a; font-weight: bold; }
            .title { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #c5a059; margin: 15px 0; font-weight: bold; background: rgba(74,44,17,0.03); padding: 8px; border-radius: 6px; }
            .qr-code { margin: 25px 0; display: flex; justify-content: center; }
            .qr-code img { border: 4px solid #4a2c11; border-radius: 8px; }
            .footer { font-size: 11px; color: #8c7e7a; margin-top: 25px; border-top: 1px solid #f0ece6; padding-top: 15px; font-style: italic; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div>
              <div class="logo">VC CAKE ACADEMY</div>
              <div class="sub">Addis Ababa, Ethiopia</div>
              <div class="title">Class Registration Receipt</div>
            </div>
            <div style="text-align: left; margin: 20px 0;">
              ${rowsHtml}
            </div>
            <div class="qr-code">
              <img src="${qrUrl}" width="160" height="160" alt="Verification QR Code" />
            </div>
            <div class="footer">
              Thank you for choosing VC Cake Academy!<br>Verify payment status on the site or scan this code.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

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
        setSuccess(data.registration);
        setForm({
          studentName: "",
          studentPhone: "",
          studentEmail: "",
          shift: "morning",
          paymentReference: "",
          amountPaid: "2500",
          paymentMethod: "cbe"
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
          <div className="text-center py-4 space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/25">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">{t.regSuccess}</h3>
            
            {/* Visual Receipt Card */}
            <div className="bg-[#170e0c] border border-[#d4af37]/20 p-5 rounded-xl text-left max-w-sm mx-auto space-y-4 text-xs font-sans relative">
              <div className="text-center border-b border-[#d4af37]/10 pb-2">
                <span className="font-serif text-sm font-bold text-[#d4af37] tracking-wider uppercase block">VC CAKE ACADEMY</span>
                <span className="text-[9px] text-[#8c7e7a] tracking-widest uppercase block mt-0.5">Registration Receipt</span>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Name:</span>
                  <span className="text-white font-bold">{success.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Phone:</span>
                  <span className="text-white font-bold">{success.studentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Method:</span>
                  <span className="text-white font-bold uppercase">{success.paymentMethod || "cbe"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Reference ID:</span>
                  <span className="text-[#d4af37] font-bold">{success.paymentReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Course Shift:</span>
                  <span className="text-white font-bold uppercase">{success.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Amount:</span>
                  <span className="text-green-400 font-bold">{Number(success.amountPaid).toLocaleString()} ETB</span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    window.location.origin + `/admin/verify?type=registration&id=${success.id}&ref=${success.paymentReference}`
                  )}&color=4a2c11&bgcolor=fdfbf7`}
                  width="120"
                  height="120"
                  alt="QR Verification Code"
                  className="border-2 border-[#d4af37]/30 rounded-lg p-1 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <button onClick={handlePrintReceipt} className="gold-btn px-6 py-2.5 rounded text-sm font-semibold cursor-pointer">
                Print / Download Receipt
              </button>
              <button onClick={onClose} className="border border-white/10 hover:border-white/20 text-[#c9bfbc] px-6 py-2 rounded text-xs cursor-pointer">
                {t.closeBtn}
              </button>
            </div>
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
                <Landmark size={14} /> {form.paymentMethod === "cbe" ? "CBE Payment Details" : "Telebirr Payment Details"}
              </h3>
              <p className="text-xs text-[#c9bfbc] leading-relaxed mb-2">
                {form.paymentMethod === "cbe" 
                  ? "Please complete a transfer to our Commercial Bank of Ethiopia (CBE) account, then copy the transaction reference number below."
                  : "Please complete a Telebirr transfer to our registered mobile account, then copy the transaction Reference ID below."
                }
              </p>
              
              {form.paymentMethod === "cbe" ? (
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#d4af37]/10 pt-2 font-mono">
                  <div>
                    <span className="text-[#8c7e7a] block">Bank Name:</span>
                    <span className="text-white block font-sans">Commercial Bank of Ethiopia</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Account Number:</span>
                    <span className="text-white block">{settings?.cbeAccountNo || "1000444555666"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Account Name:</span>
                    <span className="text-white block font-sans">{settings?.cbeAccountHolder || "Biruk Tigistu Lugaba"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Registration Fee:</span>
                    <span className="text-[#d4af37] block font-bold">2,500.00 ETB</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#d4af37]/10 pt-2 font-mono">
                  <div>
                    <span className="text-[#8c7e7a] block">Mobile Provider:</span>
                    <span className="text-white block font-sans">Ethio Telecom (Telebirr)</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Phone / Merchant ID:</span>
                    <span className="text-white block">{settings?.telebirrPhone || "0989794444"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Account Name:</span>
                    <span className="text-white block font-sans">{settings?.telebirrAccountHolder || "Kibrom Haileselassie Abreha"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Registration Fee:</span>
                    <span className="text-[#d4af37] block font-bold">2,500.00 ETB</span>
                  </div>
                </div>
              )}
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
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Payment Option</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="input-field bg-[#0c0706] cursor-pointer"
                >
                  <option value="cbe">CBE Bank Transfer</option>
                  <option value="telebirr">Telebirr Mobile Pay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">
                  {form.paymentMethod === "cbe" ? "CBE Reference Code" : "Telebirr Transaction ID"}
                </label>
                <input
                  type="text"
                  name="paymentReference"
                  value={form.paymentReference}
                  onChange={handleChange}
                  placeholder={form.paymentMethod === "cbe" ? "e.g. FT2608123456" : "e.g. TX2608111222"}
                  className="input-field font-mono uppercase font-bold text-[#d4af37]"
                  required
                />
                <span className="text-[10px] text-[#8c7e7a] block mt-1">
                  {form.paymentMethod === "cbe" 
                    ? "Enter the 10-12 character reference starting with FT" 
                    : "Enter the reference code starting with TX"
                  }
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded flex gap-2 items-start mt-4">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <ShinyButton
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? "Verifying Payment & Submitting..." : "Verify Payment & Register"}
            </ShinyButton>
          </form>
        )}
      </div>
    </div>
  );
}
