"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, ShieldAlert, Landmark, ShieldCheck, ArrowRight, Home, Calendar } from "lucide-react";

export default function AdminVerify() {
  const router = useRouter();
  const [params, setParams] = useState({ type: "", id: "", ref: "" });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  
  // Action approval state
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState("");
  const [approveError, setApproveError] = useState("");

  useEffect(() => {
    // 1. Check authentication first
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/admin/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    setToken(savedToken);

    // 2. Parse query parameters client-side
    const queryParams = new URLSearchParams(window.location.search);
    const type = queryParams.get("type") || "";
    const id = queryParams.get("id") || "";
    const ref = queryParams.get("ref") || "";

    setParams({ type, id, ref });

    if (!type || !id || !ref) {
      setError("Invalid verification URL. Parameters missing.");
      setLoading(false);
      return;
    }

    // 3. Fetch receipt details
    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/admin/verify?type=${type}&id=${id}&ref=${ref}`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (data.success) {
          setReceipt(data.data);
        } else {
          setError(data.error || "Receipt verification failed.");
        }
      } catch (err) {
        setError("Connection to verification server failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [router]);

  const handleApprove = async () => {
    if (!params.type || !params.id || !token) return;
    setApproveLoading(true);
    setApproveError("");
    setApproveSuccess("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: params.type, id: params.id })
      });
      const data = await res.json();
      if (data.success) {
        setApproveSuccess(data.message);
        // Refresh local receipt status state
        setReceipt({
          ...receipt,
          status: "approved",
          verifiedAt: data.data.verifiedAt || new Date().toISOString()
        });
      } else {
        setApproveError(data.error || "Failed to approve receipt payment.");
      }
    } catch (err) {
      setApproveError("Server connection error during approval.");
    } finally {
      setApproveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0706] text-white flex items-center justify-center p-4 relative font-sans">
      {/* Dynamic Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#d4af37]/5 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#e8a7a1]/5 blur-[100px]" />

      <div className="glass-card max-w-xl w-full p-8 rounded-2xl relative z-10 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-bold tracking-wide text-white">QR Receipt Verifier</h1>
          <p className="text-xs text-[#c9bfbc]">Administrative Scanning & Ledger Verification</p>
        </div>

        {loading ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 border-2 border-t-transparent border-[#d4af37] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#c9bfbc] font-medium">Validating receipt authenticity...</p>
          </div>
        ) : error ? (
          /* WRONG / INVALID RECEIPT STATE */
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center space-y-3">
              <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/25">
                <ShieldAlert size={28} />
              </div>
              <h2 className="font-serif text-lg font-bold text-red-400 uppercase tracking-wider">Invalid Receipt / WRONG</h2>
              <p className="text-sm text-[#c9bfbc] leading-relaxed">
                {error}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="w-full flex items-center justify-center gap-2 bg-[#2c1a16] hover:bg-[#3d2520] text-[#e8a7a1] border border-[#e8a7a1]/15 py-3 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                <Home size={16} /> Admin Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* RIGHT / VALID RECEIPT STATE */
          <div className="space-y-6">
            {receipt.status === "approved" ? (
              /* ALREADY SCANNED / DOUBLE-SCAN WARNING */
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/25 animate-pulse">
                  <AlertCircle size={24} />
                </div>
                <h2 className="font-serif text-base font-bold text-amber-400 uppercase tracking-wider">ALREADY VERIFIED / CLAIMED</h2>
                <p className="text-xs text-[#c9bfbc] leading-relaxed">
                  This receipt has already been verified and payment claimed. Double-scanning is blocked to prevent fraud.
                </p>
                {receipt.verifiedAt && (
                  <div className="inline-flex items-center gap-1.5 bg-[#2c1d11] text-[#d4af37] px-3 py-1 rounded-full text-[10px] font-mono mt-1 font-semibold border border-[#d4af37]/20">
                    <Calendar size={11} /> Verified on: {new Date(receipt.verifiedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              /* PENDING VERIFICATION - VALID */
              <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-xl text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/25">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="font-serif text-base font-bold text-green-400 uppercase tracking-wider">RIGHT / VALID RECEIPT</h2>
                <p className="text-xs text-[#c9bfbc]">
                  Receipt details match our system logs and are pending final approval.
                </p>
              </div>
            )}

            {/* Receipt Details Box */}
            <div className="bg-[#170e0c] border border-white/5 rounded-xl p-5 space-y-4 text-xs font-sans">
              <h3 className="font-serif text-sm font-bold text-[#d4af37] border-b border-white/5 pb-2 uppercase tracking-wider">
                {params.type === "registration" ? "Class Registration Details" : "Cake Order Details"}
              </h3>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                <div>
                  <span className="text-[#8c7e7a] block mb-0.5">Customer Name:</span>
                  <span className="text-white block font-medium text-sm">
                    {receipt.studentName || receipt.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block mb-0.5">Phone Number:</span>
                  <span className="text-white block font-medium">
                    {receipt.studentPhone || receipt.customerPhone}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block mb-0.5">Payment Method:</span>
                  <span className="text-white block font-medium uppercase font-mono">
                    {receipt.paymentMethod || "cbe"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c7e7a] block mb-0.5">Transaction ID / Ref:</span>
                  <span className="text-[#d4af37] block font-bold font-mono">
                    {receipt.paymentReference}
                  </span>
                </div>
                
                {params.type === "registration" ? (
                  <>
                    <div>
                      <span className="text-[#8c7e7a] block mb-0.5">Course Shift:</span>
                      <span className="text-white block font-medium uppercase">
                        {receipt.shift}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8c7e7a] block mb-0.5">Amount Verified:</span>
                      <span className="text-green-400 block font-bold">
                        {Number(receipt.amountPaid).toLocaleString()} ETB
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[#8c7e7a] block mb-0.5">Cake Type / Flavor:</span>
                      <span className="text-white block font-medium">
                        {receipt.cakeType} ({receipt.flavor})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8c7e7a] block mb-0.5">Size / Layers:</span>
                      <span className="text-white block font-medium">
                        {receipt.sizeKg} Kg ({receipt.layers} Layers)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8c7e7a] block mb-0.5">Delivery Date:</span>
                      <span className="text-white block font-medium">
                        {receipt.deliveryDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8c7e7a] block mb-0.5">Amount Verified:</span>
                      <span className="text-green-400 block font-bold">
                        {Number(receipt.amountPaid).toLocaleString()} ETB
                      </span>
                    </div>
                  </>
                )}
              </div>

              {receipt.description && (
                <div className="border-t border-white/5 pt-3">
                  <span className="text-[#8c7e7a] block mb-1">Custom Description / Decor Text:</span>
                  <p className="text-white italic bg-[#201411]/50 p-2.5 rounded border border-white/5">
                    "{receipt.description}"
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {approveError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{approveError}</span>
                </div>
              )}

              {approveSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded text-xs flex gap-2">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{approveSuccess}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {receipt.status === "pending" && (
                  <button
                    onClick={handleApprove}
                    disabled={approveLoading}
                    className="w-full bg-[#d4af37] hover:bg-[#b8952b] disabled:bg-gray-600 text-[#0c0706] font-bold py-3.5 rounded-lg text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10"
                  >
                    {approveLoading ? (
                      <div className="w-5 h-5 border-2 border-[#0c0706] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Verify & Approve Payment</>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="w-full bg-[#1a100e] hover:bg-[#281916] text-[#c9bfbc] border border-white/5 py-3.5 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
