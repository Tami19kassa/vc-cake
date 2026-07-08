"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, AlertCircle, Landmark } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.username || !form.password) {
      setError("Please fill all credentials.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Connection to auth server failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0706] flex items-center justify-center p-4 relative font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-[#d4af37]/5 blur-[80px]" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full bg-[#e8a7a1]/5 blur-[80px]" />

      <div className="glass-card max-w-md w-full p-8 rounded-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mx-auto border border-[#d4af37]/35">
            <Shield size={24} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-wide">Admin Control Panel</h1>
          <p className="text-xs text-[#c9bfbc]">VC Cake Academy Administrative Entrance</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs flex gap-2 items-start">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Username</label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter admin username"
                className="input-field pl-10"
                required
              />
              <User size={16} className="absolute left-3 top-3.5 text-[#8c7e7a]" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="input-field pl-10"
                required
              />
              <Lock size={16} className="absolute left-3 top-3.5 text-[#8c7e7a]" />
            </div>
            <span className="text-[10px] text-[#8c7e7a] block mt-1">
              Hint: Default seeded login is <strong className="text-[#d4af37]">admin</strong> / <strong className="text-[#d4af37]">admin123</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-btn py-2.5 rounded font-semibold text-sm transition mt-6 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login Dashboard"}
          </button>
        </form>

        <div className="border-t border-[#d4af37]/10 pt-4 text-center flex flex-col gap-2">
          <Link href="/" className="text-xs text-[#8c7e7a] hover:text-[#d4af37] transition">
            ← Return to Landing Website
          </Link>
          <Link href="/cbe-bank-portal" className="text-xs text-blue-400 hover:underline flex items-center justify-center gap-1">
            <Landmark size={12} /> Go to Mock CBE Bank Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
