"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe, Download } from "lucide-react";
import { translations } from "@/lib/translations";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState("en");

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "am" : "en";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  const t = translations[lang] || translations["en"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#4a2c11]/10 py-3 shadow-md"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg
              className="w-12 h-12 text-[#4a2c11] transition-transform duration-300 group-hover:scale-105"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke="#4a2c11" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#4a2c11" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Chef Hat */}
              <path
                d="M38 36 C35 30, 43 24, 46 29 C48 24, 52 24, 54 29 C57 24, 65 30, 62 36 C64 39, 62 44, 58 44 L42 44 C38 44, 36 39, 38 36 Z"
                fill="#c5a059"
              />
              <rect x="42" y="41" width="16" height="3" rx="0.5" fill="#4a2c11" />
              
              {/* Wedding Cake */}
              <g transform="translate(0, 10)">
                <rect x="35" y="48" width="30" height="8" rx="1" fill="#4a2c11" />
                <rect x="40" y="41" width="20" height="7" rx="1" fill="#fdfbf7" />
                <rect x="44" y="35" width="12" height="6" rx="1" fill="#4a2c11" />
                <path d="M32 56 L68 56 L60 59 L40 59 Z" fill="#fdfbf7" />
                <path d="M50 31 C49 29, 47 29, 47 31 C47 33, 50 34, 50 34 C50 34, 53 33, 53 31 C53 29, 51 29, 50 31 Z" fill="red" />
              </g>

              {/* Stars */}
              <polygon points="18,50 20,44 22,50 17,46 23,46" fill="#c5a059" />
              <polygon points="82,50 80,44 78,50 83,46 77,46" fill="#c5a059" />
            </svg>
            <div>
              <span className="font-serif text-lg font-bold tracking-wider text-[#4a2c11] block">
                VC CAKE
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#5c4638] block -mt-1 font-semibold">
                {lang === "en" ? "Academy" : "አካዳሚ"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
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
            
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-[#4a2c11]/5 border border-[#4a2c11]/15 hover:border-[#4a2c11] px-2.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer text-[#4a2c11]"
            >
              <Globe size={13} /> {t.langToggle}
            </button>

            {/* Custom PWA Install Button */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-[#c5a059]/10 border border-[#c5a059]/30 hover:border-[#c5a059] px-2.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer text-[#4a2c11]"
              >
                <Download size={13} /> {lang === "en" ? "Install App" : "መተግበሪያውን ጫን"}
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-[#4a2c11]/5 border border-[#4a2c11]/15 px-2 py-1.5 rounded text-xs text-[#4a2c11]"
            >
              <Globe size={12} /> {t.langToggle}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#4a2c11] focus:outline-none p-2 rounded-md hover:bg-[#4a2c11]/5"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
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
          {/* Custom PWA Install Button for Mobile */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-1.5 bg-[#c5a059]/10 border border-[#c5a059]/30 px-3 py-2 rounded text-base font-semibold text-[#4a2c11] mt-2 cursor-pointer"
            >
              <Download size={16} /> {lang === "en" ? "Install App" : "መተግበሪያውን ጫን"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
