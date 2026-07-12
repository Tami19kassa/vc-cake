"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, Landmark, RefreshCw } from "lucide-react";

export default function CbeBankPortal() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ referenceId: "", amount: "", senderName: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/cbe-transactions");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.referenceId || !form.amount || !form.senderName) {
      setError("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("/api/cbe-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Transaction ${form.referenceId} credited successfully.`);
        setForm({ referenceId: "", amount: "", senderName: "" });
        fetchTransactions();
      } else {
        setError(data.error || "Failed to add transaction.");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  const filteredTx = transactions.filter((tx) =>
    tx.referenceId.toLowerCase().includes(search.toLowerCase()) ||
    tx.senderName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1f2937] font-sans">
      {/* CBE Blue Header */}
      <header className="bg-[#1e40af] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full text-[#1e40af]">
              <Landmark size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">CBE & TELEBIRR SIMULATOR</h1>
              <p className="text-xs text-blue-200">Merchant Payment simulation engine for automated verification</p>
            </div>
          </div>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition text-sm font-medium"
          >
            <RefreshCw size={16} /> Refresh Feeds
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Creator Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 self-start">
            <h2 className="text-lg font-semibold text-blue-900 border-b pb-3 mb-4 flex items-center gap-2">
              <PlusCircle size={20} /> Credit Mock Ledger
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Simulate an incoming CBE transfer (e.g. starting with FT) or Telebirr mobile payment (e.g. starting with TX). Once injected, customers can instantly verify it.
            </p>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm font-medium">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Transaction Reference (Ref ID)
                </label>
                <input
                  type="text"
                  name="referenceId"
                  placeholder="e.g. FT2608456789 or TX2608111222"
                  value={form.referenceId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-gray-50 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Transfer Amount (ETB)
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="e.g. 2500"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Sender Full Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  placeholder="e.g. Aster Kassa"
                  value={form.senderName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e40af] hover:bg-blue-800 text-white font-semibold py-2 rounded text-sm transition mt-2 shadow-sm"
              >
                Inject Transfer Data
              </button>
            </form>
          </div>

          {/* Transaction Ledger Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Incoming Payment Ledger</h2>
                <p className="text-xs text-gray-500">Live simulation feed scanned by the automated verify parser</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by Ref or Sender..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:border-blue-500"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTx.length === 0 ? (
              <div className="py-20 text-center text-gray-500">No mock transactions found. Use the panel on the left to inject transfers.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-semibold">
                      <th className="px-4 py-3">Transaction Reference</th>
                      <th className="px-4 py-3 text-right">Amount (ETB)</th>
                      <th className="px-4 py-3">Sender Name</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3 text-center">Scraper Tag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((tx) => (
                      <tr key={tx.referenceId} className="border-b border-gray-100 hover:bg-gray-50 text-gray-800">
                        <td className="px-4 py-3 font-mono font-bold text-blue-800">{tx.referenceId}</td>
                        <td className="px-4 py-3 text-right font-bold">{Number(tx.amount).toFixed(2)}</td>
                        <td className="px-4 py-3">{tx.senderName}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              tx.isClaimed
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {tx.isClaimed ? "CLAIMED" : "UNCLAIMED"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
