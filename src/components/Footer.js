"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, MapPin, Mail } from "lucide-react";
import { translations } from "@/lib/translations";

export default function Footer({ settings }) {
  const [lang, setLang] = useState("en");
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(localStorage.getItem("lang") || "en");
    };

    handleLanguageChange(); // set initial
    window.addEventListener("languageChange", handleLanguageChange, { passive: true });
    return () => window.removeEventListener("languageChange", handleLanguageChange);
  }, []);

  const handleBrandClick = () => {
    setClickCount(c => {
      const nextCount = c + 1;
      if (nextCount >= 5) {
        window.location.href = "/admin/login";
        return 0;
      }
      return nextCount;
    });
  };

  const t = translations[lang] || translations["en"];

  const phone1 = settings?.contactPhone1 || "098 979 4444";
  const phone2 = settings?.contactPhone2 || "093 480 2222";
  const email = settings?.contactEmail || "info@vccakeacademy.com";
  const addressText = lang === "en" 
    ? (settings?.contactAddressEn || "Bole, Addis Ababa") 
    : (settings?.contactAddressAm || "ቦሌ፣ አዲስ አበባ");

  return (
    <footer className="bg-[#090504] border-t border-[#d4af37]/10 pt-16 pb-8 text-[#c9bfbc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div onClick={handleBrandClick} className="flex items-center gap-3 cursor-pointer select-none active:opacity-75 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-serif font-bold text-sm">
                VC
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-wide">
                VC Cake Academy
              </span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed text-[#8c7e7a]">
              {t.brandDesc}
            </p>
            <p className="text-[#d4af37] text-xs font-semibold uppercase tracking-wide">
              {t.motto}
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-serif font-semibold text-base mb-4 border-b border-[#d4af37]/20 pb-2 inline-block">
              {t.getInTouch}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="text-[#d4af37] mt-1 shrink-0" />
                <div>
                  <span className="block font-medium text-white">{phone1}</span>
                  <span className="block text-xs text-[#8c7e7a]">{phone2}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#d4af37] mt-1 shrink-0" />
                <div>
                  <span className="block text-white">{addressText}</span>
                  <span className="block text-xs text-[#8c7e7a]">{lang === "en" ? "Addis Ababa, Ethiopia" : "አዲስ አበባ፣ ኢትዮጵያ"}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="text-[#d4af37] mt-1 shrink-0" />
                <span className="block">{email}</span>
              </li>
            </ul>
          </div>

          {/* Quick Access links */}
          <div>
            <h3 className="text-white font-serif font-semibold text-base mb-4 border-b border-[#d4af37]/20 pb-2 inline-block">
              {t.quickLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#courses" className="hover:text-[#d4af37] transition">{t.shiftsLink}</Link>
              </li>
              <li>
                <Link href="#orders" className="hover:text-[#d4af37] transition">{t.orderLink}</Link>
              </li>
              <li>
                <Link href="#blogs" className="hover:text-[#d4af37] transition">{t.blogsLink}</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-[#d4af37]/5 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#8c7e7a] gap-4">
          <p>© {new Date().getFullYear()} VC Cake Academy. {t.allRights}</p>
          <div className="flex gap-4">
            <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="hover:text-[#d4af37] transition">Call</a>
            <a href="#" className="hover:text-[#d4af37] transition flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>VC Cake Academy</span>
            </a>
            <a href="#" className="hover:text-[#d4af37] transition">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
