"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, Download, Search } from "lucide-react";
import { translations } from "@/lib/translations";
import ReceiptLookupModal from "@/components/ReceiptLookupModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState("en");

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Receipt lookup modal state
  const [lookupOpen, setLookupOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);

    const handleLanguageChange = () => {
      setLang(localStorage.getItem("lang") || "en");
    };
    window.addEventListener("languageChange", handleLanguageChange);

    // Capture install prompt for PWA installation
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "am" : "en";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  const t = translations[lang] || translations["en"];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#4a2c11]/10 py-3 shadow-md"
            : "bg-[#fdfbf7]/70 backdrop-blur-md py-4 border-b border-[#4a2c11]/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <svg
                viewBox="0 0 100 100"
                className="w-10 h-10 text-[#4a2c11] fill-current group-hover:scale-105 transition-transform duration-300"
              >
                <path d="M50 15 C30 15, 20 30, 20 45 C20 60, 30 75, 50 85 C70 75, 80 60, 80 45 C80 30, 70 15, 50 15 Z M50 25 C55 25, 60 30, 60 37 C60 45, 50 55, 50 55 C50 55, 40 45, 40 37 C40 30, 45 25, 50 25 Z" />
                <path d="M30 65 C40 70, 60 70, 70 65" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
              <div>
                <span className="font-serif text-lg font-extrabold tracking-widest text-[#4a2c11] block">
                  VC CAKE
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#c5a059] block font-semibold">
                  {lang === "en" ? "Boutique & Academy" : "ቡቲክ እና አካዳሚ"}
                </span>
              </div>
            </Link>

            {/* Navigation links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[#2c1d11]">
              <Link href="#courses" className="text-sm font-medium hover:text-[#c5a059] transition duration-200">
                {t.shiftsLink}
              </Link>
              <Link href="#orders" className="text-sm font-medium hover:text-[#c5a059] transition duration-200">
                {t.orderLink}
              </Link>
              <Link href="#blogs" className="text-sm font-medium hover:text-[#c5a059] transition duration-200">
                {t.blogsLink}
              </Link>
              <Link href="#contact" className="text-sm font-medium hover:text-[#c5a059] transition duration-200">
                {t.contactLink}
              </Link>

              {/* Find Receipt Button */}
              <button
                onClick={() => setLookupOpen(true)}
                className="text-xs font-bold text-[#4a2c11] hover:text-[#c5a059] transition duration-200 cursor-pointer flex items-center gap-1.5 bg-[#4a2c11]/5 border border-[#4a2c11]/15 hover:border-[#c5a059] px-3 py-2 rounded-full"
              >
                <Search size={13} /> {lang === "en" ? "Find Receipt" : "ደረሰኝ ፈልግ"}
              </button>
              
              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-xs font-semibold text-[#4a2c11] bg-[#4a2c11]/5 border border-[#4a2c11]/10 px-3 py-2 rounded-full hover:bg-[#4a2c11]/10 transition cursor-pointer"
              >
                <Globe size={13} />
                <span>{lang === "en" ? "አማርኛ" : "English"}</span>
              </button>

              {/* Custom PWA Install Button */}
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1 text-xs font-bold bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#4a2c11] px-3.5 py-2 rounded-full hover:bg-[#c5a059]/20 transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>{lang === "en" ? "Install App" : "መተግበሪያ ጫን"}</span>
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center gap-3">
              {/* Language Switcher for Mobile */}
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center p-2 rounded-full bg-[#4a2c11]/5 text-[#4a2c11] hover:bg-[#4a2c11]/10 transition cursor-pointer"
              >
                <Globe size={18} />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#4a2c11] hover:text-[#c5a059] transition cursor-pointer"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isOpen && (
          <div className="md:hidden bg-[#fdfbf7] border-b border-[#4a2c11]/10 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <Link
              href="#courses"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-base font-medium text-[#2c1d11] hover:bg-[#4a2c11]/5 hover:text-[#4a2c11] transition"
            >
              {t.shiftsLink}
            </Link>
            <Link
              href="#orders"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-base font-medium text-[#2c1d11] hover:bg-[#4a2c11]/5 hover:text-[#4a2c11] transition"
            >
              {t.orderLink}
            </Link>
            <Link
              href="#blogs"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-base font-medium text-[#2c1d11] hover:bg-[#4a2c11]/5 hover:text-[#4a2c11] transition"
            >
              {t.blogsLink}
            </Link>
            <Link
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded text-base font-medium text-[#2c1d11] hover:bg-[#4a2c11]/5 hover:text-[#4a2c11] transition"
            >
              {t.contactLink}
            </Link>

            {/* Find Receipt Button for Mobile */}
            <button
              onClick={() => {
                setIsOpen(false);
                setLookupOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 text-center px-3 py-2.5 rounded text-base font-semibold text-[#4a2c11] bg-[#4a2c11]/5 border border-[#4a2c11]/15 mt-2 cursor-pointer"
            >
              <Search size={15} /> {lang === "en" ? "Find My Receipt" : "ደረሰኝ ፈልግ"}
            </button>

            {/* Custom PWA Install Button for Mobile */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-1.5 bg-[#c5a059]/10 border border-[#c5a059]/30 px-3 py-2.5 rounded text-base font-semibold text-[#4a2c11] mt-2 cursor-pointer"
              >
                <Download size={16} /> {lang === "en" ? "Install App" : "መተግበሪያውን ጫን"}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Lookup Receipt Modal */}
      <ReceiptLookupModal isOpen={lookupOpen} onClose={() => setLookupOpen(false)} />
    </>
  );
}
