"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Landmark, Cake } from "lucide-react";
import { translations } from "@/lib/translations";
import { ShinyButton } from "@/components/ShinyButton";

export default function CakeOrderModal({ isOpen, onClose, lang: propLang, settings }) {
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
    amountPaid: "1600",
    paymentMethod: "cbe"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Sync language configuration
  useEffect(() => {
    if (isOpen) {
      setLang(propLang || localStorage.getItem("lang") || "en");
    }
  }, [propLang, isOpen]);

  // Fetch active products from catalog
  useEffect(() => {
    const fetchActiveProducts = async () => {
      try {
        const res = await fetch("/api/products?active=true");
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          if (data.products.length > 0) {
            const firstInStock = data.products.find(p => p.stock > 0) || data.products[0];
            setForm(f => ({ ...f, cakeType: firstInStock.name }));
          }
        }
      } catch (e) {
        console.error("Error loading products:", e);
      } finally {
        setProductsLoading(false);
      }
    };
    if (isOpen) {
      fetchActiveProducts();
    }
  }, [isOpen]);

  // Calculate cost dynamically
  useEffect(() => {
    const selectedProduct = products.find(p => p.name === form.cakeType);
    const isCake = selectedProduct ? selectedProduct.category === "Cakes" : true;
    
    const size = parseFloat(form.sizeKg) || 1;
    const layers = isCake ? (parseInt(form.layers) || 1) : 1;
    const basePrice = selectedProduct ? selectedProduct.basePrice : 800;
    const layerPrice = settings?.layerPrice || 300;
    
    const price = isCake 
      ? (size * basePrice + (layers - 1) * layerPrice)
      : (size * basePrice);
      
    setForm((f) => ({ ...f, amountPaid: price.toString() }));
  }, [form.sizeKg, form.layers, form.cakeType, products, settings]);

  // Auto-trigger print on success
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
      window.location.origin + `/admin/verify?type=order&id=${success.id}&ref=${success.paymentReference}`
    )}&color=4a2c11&bgcolor=fdfbf7`;

    const printWindow = window.open("", "_blank");
    
    const rowsHtml = [
      { label: "Customer Name", value: success.customerName },
      { label: "Phone Number", value: success.customerPhone },
      { label: "Payment Method", value: (success.paymentMethod || "cbe").toUpperCase() },
      { label: "Transaction ID / Ref", value: success.paymentReference },
      { label: "Cake Type", value: success.cakeType },
      { label: "Flavor / Design", value: `${success.flavor} (${success.sizeKg} Kg, ${success.layers} L)` },
      { label: "Delivery Date", value: success.deliveryDate },
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
              <div class="title">Cake Custom Order Receipt</div>
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
        setSuccess(data.order);
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
          amountPaid: "1600",
          paymentMethod: "cbe"
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
          <div className="text-center py-4 space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/25">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">{t.orderSuccess}</h3>
            
            {/* Visual Receipt Card */}
            <div className="bg-[#170e0c] border border-[#d4af37]/20 p-5 rounded-xl text-left max-w-sm mx-auto space-y-4 text-xs font-sans relative">
              <div className="text-center border-b border-[#d4af37]/10 pb-2">
                <span className="font-serif text-sm font-bold text-[#d4af37] tracking-wider uppercase block">VC CAKE ACADEMY</span>
                <span className="text-[9px] text-[#8c7e7a] tracking-widest uppercase block mt-0.5">Order Receipt</span>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Name:</span>
                  <span className="text-white font-bold">{success.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Phone:</span>
                  <span className="text-white font-bold">{success.customerPhone}</span>
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
                  <span className="text-[#8c7e7a]">Cake:</span>
                  <span className="text-white font-bold">{success.cakeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Size/Layers:</span>
                  <span className="text-white font-bold">{success.sizeKg} Kg ({success.layers} L)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Flavor:</span>
                  <span className="text-white font-bold">{success.flavor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Delivery:</span>
                  <span className="text-white font-bold">{success.deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Amount:</span>
                  <span className="text-green-400 font-bold">{Number(success.amountPaid).toLocaleString()} ETB</span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    window.location.origin + `/admin/verify?type=order&id=${success.id}&ref=${success.paymentReference}`
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
        ) : (settings?.ordersEnabled === false || settings?.ordersEnabled === 0) ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/25 animate-pulse">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">Custom Cake Orders Closed</h3>
            <p className="text-xs text-[#c9bfbc] max-w-sm mx-auto leading-relaxed">
              Custom cake orders are temporarily closed. Please check back later or contact us directly at our phone numbers.
            </p>
            <button onClick={onClose} className="border border-white/10 hover:border-white/20 text-[#c9bfbc] px-6 py-2 rounded text-xs cursor-pointer">
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
                <Landmark size={14} /> {form.paymentMethod === "cbe" ? t.payInstructions : "Telebirr Payment Details"}
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
                    <span className="text-white block font-bold">{settings?.cbeAccountNo || "1000444555666"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Account Name:</span>
                    <span className="text-white block font-sans">{settings?.cbeAccountHolder || "Biruk Tigistu Lugaba"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Order Amount:</span>
                    <span className="text-[#d4af37] block font-bold">{Number(form.amountPaid).toLocaleString()} ETB</span>
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
                    <span className="text-white block font-bold">{settings?.telebirrPhone || "0989794444"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Account Name:</span>
                    <span className="text-white block font-sans">{settings?.telebirrAccountHolder || "Kibrom Haileselassie Abreha"}</span>
                  </div>
                  <div>
                    <span className="text-[#8c7e7a] block">Order Amount:</span>
                    <span className="text-[#d4af37] block font-bold">{Number(form.amountPaid).toLocaleString()} ETB</span>
                  </div>
                </div>
              )}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Cake Category</label>
                {productsLoading ? (
                  <div className="input-field bg-[#0c0706] text-gray-400 text-xs flex items-center">
                    Loading items...
                  </div>
                ) : (
                  <select
                    name="cakeType"
                    value={form.cakeType}
                    onChange={handleChange}
                    className="input-field bg-[#0c0706] cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.name} disabled={p.stock <= 0}>
                        {p.name} {p.stock !== undefined ? (p.stock > 0 ? `(${p.stock} available)` : " (Out of Stock)") : ""}
                      </option>
                    ))}
                    {products.length === 0 && (
                      <>
                        <option value="Wedding Cake">Wedding Cake</option>
                        <option value="Birthday Cake">Birthday Cake</option>
                        <option value="Celebration Cake">Celebration Cake</option>
                        <option value="Baby Shower Cake">Baby Shower Cake</option>
                        <option value="Custom Cupcakes">Custom Cupcakes</option>
                      </>
                    )}
                  </select>
                )}
              </div>

              {(() => {
                const selectedProduct = products.find(p => p.name === form.cakeType);
                const isCake = selectedProduct ? selectedProduct.category === "Cakes" : true;

                return (
                  <>
                    {isCake ? (
                      <>
                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Weight (Size in Kg)</label>
                          <select
                            name="sizeKg"
                            value={form.sizeKg}
                            onChange={handleChange}
                            className="input-field bg-[#0c0706] cursor-pointer"
                          >
                            <option value="1">1 Kg (Small - {(products.find(p => p.name === form.cakeType)?.basePrice || 800)} ETB)</option>
                            <option value="2">2 Kg (Standard - {(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 2} ETB)</option>
                            <option value="3">3 Kg (Medium - {(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 3} ETB)</option>
                            <option value="4">4 Kg (Large - {(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 4} ETB)</option>
                            <option value="5">5 Kg (Extra Large - {(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 5} ETB)</option>
                            <option value="7">7 Kg (Grand Size - {(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 7} ETB)</option>
                            <option value="10">10 Kg (Premium Size - {(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 10} ETB)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Number of Layers</label>
                          <select
                            name="layers"
                            value={form.layers}
                            onChange={handleChange}
                            className="input-field bg-[#0c0706] cursor-pointer"
                          >
                            <option value="1">1 Layer (Flat)</option>
                            <option value="2">2 Layers (+{settings?.layerPrice || 300} ETB)</option>
                            <option value="3">3 Layers (+{(settings?.layerPrice || 300) * 2} ETB)</option>
                            <option value="4">4 Layers (+{(settings?.layerPrice || 300) * 3} ETB)</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Quantity (Packs / Units)</label>
                        <select
                          name="sizeKg"
                          value={form.sizeKg}
                          onChange={handleChange}
                          className="input-field bg-[#0c0706] cursor-pointer"
                        >
                          <option value="1">1 Pack ({(products.find(p => p.name === form.cakeType)?.basePrice || 800)} ETB)</option>
                          <option value="2">2 Packs ({(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 2} ETB)</option>
                          <option value="3">3 Packs ({(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 3} ETB)</option>
                          <option value="5">5 Packs ({(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 5} ETB)</option>
                          <option value="10">10 Packs ({(products.find(p => p.name === form.cakeType)?.basePrice || 800) * 10} ETB)</option>
                        </select>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {(() => {
              const selectedProduct = products.find(p => p.name === form.cakeType);
              const isCake = selectedProduct ? selectedProduct.category === "Cakes" : true;

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isCake && (
                      <div>
                        <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Flavor profile</label>
                        <select
                          name="flavor"
                          value={form.flavor}
                          onChange={handleChange}
                          className="input-field bg-[#0c0706] cursor-pointer"
                        >
                          <option value="Chocolate Fudge">Chocolate Fudge</option>
                          <option value="Vanilla Strawberry">Vanilla Strawberry Velvet</option>
                          <option value="Red Velvet Cream">Red Velvet Cream Cheese</option>
                          <option value="Salted Caramel Fudge">Salted Caramel Toffee</option>
                          <option value="Mocha Espresso">Mocha Coffee Espresso</option>
                          <option value="Bavarian Fruit Cream">Bavarian Fruit Mix Cream</option>
                        </select>
                      </div>
                    )}

                    <div className={isCake ? "" : "col-span-2"}>
                      <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Delivery/Pickup Date</label>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleChange}
                        className="input-field cursor-pointer text-white fill-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">
                      {isCake ? "Decoration Text & Custom Design Details" : "Special Requests / Delivery Notes (Optional)"}
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder={isCake ? "e.g. Write 'Happy 5th Birthday Aster!' with pink flowers design." : "e.g. Please pack in separate boxes, deliver after 2 PM."}
                      className="input-field min-h-[70px] py-2"
                      required={isCake}
                    />
                  </div>
                </>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Amount Due (ETB)</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  className="input-field bg-white/5 text-gray-300 font-bold select-none"
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
                    ? "Enter the CBE reference starting with FT" 
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
              className="w-full mt-4"
            >
              {loading ? "Verifying Payment & Submitting..." : "Verify Payment & Place Order"}
            </ShinyButton>
          </form>
        )}
      </div>
    </div>
  );
}
