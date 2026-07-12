"use client";

import { useState, useEffect } from "react";
import { X, Search, CheckCircle, FileText, Printer, AlertCircle } from "lucide-react";

export default function ReceiptLookupModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [settings, setSettings] = useState(null);
  
  // Selected receipt to view details
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          if (data.success) setSettings(data.settings);
        })
        .catch(e => console.error("Error loading settings in lookup modal:", e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResults(null);
    setSelectedReceipt(null);

    const cleanQuery = query.trim();
    if (cleanQuery.length < 3) {
      setError("Please enter at least 3 characters to search.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/receipt-lookup?query=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();
      if (data.success) {
        if (data.registrations.length === 0 && data.orders.length === 0) {
          setError("No matching receipts found. Please verify your phone number or reference ID.");
        } else {
          setResults(data);
        }
      } else {
        setError(data.error || "Search execution failed.");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (receipt, type) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      window.location.origin + `/admin/verify?type=${type}&id=${receipt.id}&ref=${receipt.paymentReference}`
    )}`;

    const printWindow = window.open("", "_blank");
    
    const rowsHtml = [
      { label: "Name", value: receipt.studentName || receipt.customerName },
      { label: "Phone Number", value: receipt.studentPhone || receipt.customerPhone },
      { label: "Payment Method", value: (receipt.paymentMethod || "cbe").toUpperCase() },
      { label: "Transaction ID / Ref", value: receipt.paymentReference },
      ...(type === "registration" ? [
        { label: "Course Shift", value: receipt.shift.toUpperCase() }
      ] : [
        { label: "Cake Type", value: receipt.cakeType },
        { label: "Flavor / Design", value: `${receipt.flavor} (${receipt.sizeKg} Kg, ${receipt.layers} L)` },
        { label: "Delivery Date", value: receipt.deliveryDate }
      ]),
      { label: "Total Price", value: `${Number(receipt.totalAmount || receipt.amountPaid).toLocaleString()} ETB` },
      { label: "Amount Paid", value: `${Number(receipt.amountPaid).toLocaleString()} ETB` },
      ...(Number(receipt.totalAmount || 0) > Number(receipt.amountPaid) ? [
        { label: "Remaining Balance", value: `${(Number(receipt.totalAmount) - Number(receipt.amountPaid)).toLocaleString()} ETB` }
      ] : [])
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
            .qr-code img { border: 4px solid #4a2c11; border-radius: 8px; padding: 12px; background: white; }
            .footer { font-size: 11px; color: #8c7e7a; margin-top: 25px; border-top: 1px solid #f0ece6; padding-top: 15px; font-style: italic; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div>
              <div class="logo">VC CAKE ACADEMY</div>
              <div class="sub">Addis Ababa, Ethiopia</div>
              <div class="title">${type === "registration" ? "Class Shift Registration" : "Custom Cake Order"} Receipt</div>
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

  const handleClose = () => {
    setQuery("");
    setError("");
    setResults(null);
    setSelectedReceipt(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X size={22} />
        </button>

        <h2 className="font-serif text-xl font-bold text-[#d4af37] mb-2 flex items-center gap-2">
          <Search size={20} /> Find My Receipt
        </h2>
        <p className="text-xs text-[#c9bfbc] mb-6">
          Lost your receipt? Search below using your registered phone number or CBE / Telebirr payment reference code.
        </p>

        {selectedReceipt ? (
          /* FULL RECEIPT DISPLAY STATE */
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 text-center py-2">
            {/* Visual Receipt Card */}
            <div className="bg-[#170e0c] border border-[#d4af37]/20 p-5 rounded-xl text-left max-w-sm mx-auto space-y-4 text-xs font-sans relative">
              <div className="text-center border-b border-[#d4af37]/10 pb-2">
                <span className="font-serif text-sm font-bold text-[#d4af37] tracking-wider uppercase block">VC CAKE ACADEMY</span>
                <span className="text-[9px] text-[#8c7e7a] tracking-widest uppercase block mt-0.5">
                  {selectedReceipt.type === "registration" ? "Registration Receipt" : "Order Receipt"}
                </span>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Name:</span>
                  <span className="text-white font-bold">
                    {selectedReceipt.data.studentName || selectedReceipt.data.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Phone:</span>
                  <span className="text-white font-bold">
                    {selectedReceipt.data.studentPhone || selectedReceipt.data.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Method:</span>
                  <span className="text-white font-bold uppercase">{selectedReceipt.data.paymentMethod || "cbe"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Reference ID:</span>
                  <span className="text-[#d4af37] font-bold">{selectedReceipt.data.paymentReference}</span>
                </div>
                {selectedReceipt.type === "registration" ? (
                  <div className="flex justify-between">
                    <span className="text-[#8c7e7a]">Course Shift:</span>
                    <span className="text-white font-bold uppercase">{selectedReceipt.data.shift}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8c7e7a]">Cake Type:</span>
                      <span className="text-white font-bold">{selectedReceipt.data.cakeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8c7e7a]">Size/Layers:</span>
                      <span className="text-white font-bold">{selectedReceipt.data.sizeKg} Kg ({selectedReceipt.data.layers} L)</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Total Cost:</span>
                  <span className="text-white font-bold">
                    {Number(selectedReceipt.data.totalAmount || selectedReceipt.data.amountPaid).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7e7a]">Amount Paid:</span>
                  <span className="text-green-400 font-bold">{Number(selectedReceipt.data.amountPaid).toLocaleString()} ETB</span>
                </div>
                {Number(selectedReceipt.data.totalAmount || 0) > Number(selectedReceipt.data.amountPaid) && (
                  <div className="flex justify-between">
                    <span className="text-[#8c7e7a]">Remaining:</span>
                    <span className="text-amber-400 font-bold">
                      {(Number(selectedReceipt.data.totalAmount) - Number(selectedReceipt.data.amountPaid)).toLocaleString()} ETB
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    window.location.origin + `/admin/verify?type=${selectedReceipt.type}&id=${selectedReceipt.data.id}&ref=${selectedReceipt.data.paymentReference}`
                  )}`}
                  width="120"
                  height="120"
                  alt="QR Verification Code"
                  className="border-2 border-[#d4af37]/30 rounded-lg p-3 bg-white"
                />
              </div>
            </div>

            {/* Pay Remaining Balance Form */}
            {Number(selectedReceipt.data.totalAmount || 0) > Number(selectedReceipt.data.amountPaid) && (
              <PayRemainingForm 
                receipt={selectedReceipt} 
                settings={settings}
                onSuccess={(updatedRecord) => {
                  setSelectedReceipt({
                    ...selectedReceipt,
                    data: updatedRecord
                  });
                  if (results) {
                    const listKey = selectedReceipt.type === "registration" ? "registrations" : "orders";
                    const newList = results[listKey].map(item => item.id === updatedRecord.id ? updatedRecord : item);
                    setResults({
                      ...results,
                      [listKey]: newList
                    });
                  }
                }}
              />
            )}

            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <button
                onClick={() => handlePrintReceipt(selectedReceipt.data, selectedReceipt.type)}
                className="gold-btn px-6 py-2.5 rounded text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer size={16} /> Print / Download Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="border border-white/10 hover:border-white/20 text-[#c9bfbc] px-6 py-2 rounded text-xs cursor-pointer"
              >
                Back to Search Results
              </button>
            </div>
          </div>
        ) : (
          /* SEARCH / RESULTS LIST STATE */
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter phone number or payment reference"
                className="input-field"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="gold-btn px-5 rounded-lg text-sm transition cursor-pointer flex items-center justify-center shrink-0"
              >
                {loading ? "Searching..." : <Search size={18} />}
              </button>
            </form>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs flex gap-2 items-start">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {results && (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                <h3 className="text-xs font-semibold text-[#8c7e7a] uppercase tracking-wider mb-2">Search Results</h3>
                
                {/* Class Registrations */}
                {results.registrations.map(reg => (
                  <div key={`reg-${reg.id}`} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#d4af37] font-semibold">
                        <FileText size={14} /> Class Shift: {reg.shift.toUpperCase()}
                      </div>
                      <div className="text-white font-bold">{reg.studentName}</div>
                      <div className="text-[#8c7e7a] font-mono">Ref: {reg.paymentReference}</div>
                    </div>
                    <button
                      onClick={() => setSelectedReceipt({ type: "registration", data: reg })}
                      className="bg-[#2c1d11] hover:bg-[#3d2a1a] text-[#d4af37] px-3.5 py-2 rounded text-xs font-semibold transition border border-[#d4af37]/25 cursor-pointer shrink-0"
                    >
                      View Receipt
                    </button>
                  </div>
                ))}

                {/* Cake Orders */}
                {results.orders.map(order => (
                  <div key={`order-${order.id}`} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#e8a7a1] font-semibold">
                        <Cake size={14} /> Cake Order: {order.cakeType}
                      </div>
                      <div className="text-white font-bold">{order.customerName}</div>
                      <div className="text-[#8c7e7a] font-mono">Ref: {order.paymentReference}</div>
                    </div>
                    <button
                      onClick={() => setSelectedReceipt({ type: "order", data: order })}
                      className="bg-[#2c1d11] hover:bg-[#3d2a1a] text-[#d4af37] px-3.5 py-2 rounded text-xs font-semibold transition border border-[#d4af37]/25 cursor-pointer shrink-0"
                    >
                      View Receipt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PayRemainingForm({ receipt, settings, onSuccess }) {
  const [refCode, setRefCode] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cbe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const remaining = Number(receipt.data.totalAmount) - Number(receipt.data.amountPaid);

  useEffect(() => {
    setPayAmount(String(remaining));
  }, [remaining]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!refCode || !payAmount) {
      setError("Please fill all fields.");
      return;
    }

    if (Number(payAmount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pay-remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: receipt.data.id,
          type: receipt.type,
          paymentMethod: payMethod,
          paymentReference: refCode,
          amountPaid: Number(payAmount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Payment processed successfully!");
        setRefCode("");
        setTimeout(() => {
          onSuccess(data.data);
        }, 1500);
      } else {
        setError(data.error || "Payment verification failed.");
      }
    } catch (err) {
      setError("Server connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const cbeAcc = settings?.cbeAccountNo || "1000444555666";
  const cbeHolder = settings?.cbeAccountHolder || "Biruk Tigistu Lugaba";
  const telePhone = settings?.telebirrPhone || "251911378448";
  const teleHolder = settings?.telebirrAccountHolder || "Kibrom Haileselassie Abreha";

  return (
    <div className="bg-[#0f0807] border border-[#d4af37]/20 p-4 rounded-xl max-w-sm mx-auto my-3 text-left text-xs space-y-3 font-sans">
      <h4 className="font-serif font-bold text-[#d4af37] text-sm uppercase tracking-wide">Pay Remaining Balance</h4>
      <p className="text-[10px] text-[#c9bfbc]">
        To pay the outstanding balance of <strong>{remaining.toLocaleString()} ETB</strong>, transfer through one of the accounts below and enter your new transaction code:
      </p>

      <div className="bg-black/40 p-2.5 rounded border border-[#d4af37]/10 space-y-1.5 text-[10px]">
        {payMethod === "cbe" ? (
          <div>
            <span className="block font-semibold text-[#d4af37]">CBE Bank Account:</span>
            <span className="block text-white font-mono">{cbeAcc}</span>
            <span className="block text-[#8c7e7a]">Holder: {cbeHolder}</span>
          </div>
        ) : (
          <div>
            <span className="block font-semibold text-[#e8a7a1]">Telebirr Merchant:</span>
            <span className="block text-white font-mono">+{telePhone}</span>
            <span className="block text-[#8c7e7a]">Name: {teleHolder}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-[9px] text-[#8c7e7a] mb-0.5">Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-[10px]"
            >
              <option value="cbe">CBE Transfer</option>
              <option value="telebirr">Telebirr</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-[9px] text-[#8c7e7a] mb-0.5">Amount Paid (ETB)</label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-[10px] font-mono text-[#d4af37]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] text-[#8c7e7a] mb-0.5">
            {payMethod === "cbe" ? "CBE Reference Code" : "Telebirr Transaction ID"}
          </label>
          <input
            type="text"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
            placeholder={payMethod === "cbe" ? "e.g. FT2608123456" : "e.g. TX2608111222"}
            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-[10px] font-mono uppercase font-bold text-[#d4af37]"
            required
          />
        </div>

        {error && <div className="text-red-400 text-[10px] bg-red-500/10 p-1.5 rounded">{error}</div>}
        {successMsg && <div className="text-green-400 text-[10px] bg-green-500/10 p-1.5 rounded">{successMsg}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4af37]/20 border border-[#d4af37]/45 text-[#d4af37] hover:bg-[#d4af37]/35 py-1.5 rounded font-semibold text-[10px] transition cursor-pointer"
        >
          {loading ? "Verifying..." : "Verify & Submit Payment"}
        </button>
      </form>
    </div>
  );
}
