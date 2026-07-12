"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseRegisterModal from "@/components/CourseRegisterModal";
import CakeOrderModal from "@/components/CakeOrderModal";
import ScrollReveal from "@/components/ScrollReveal";
import { ShinyButton } from "@/components/ShinyButton";
import GraduateBook from "@/components/GraduateBook";
import { translations, getTranslation } from "@/lib/translations";
import {
  Clock,
  Cake,
  Video,
  FileText,
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  Award,
  Users,
  GraduationCap,
  Sparkles,
  Phone
} from "lucide-react";

export default function Home() {
  const [lang, setLang] = useState("en");
  
  // Default fallback English texts
  const [heroSettings, setHeroSettings] = useState({
    title: JSON.stringify({
      en: "Made with love, baked to perfection.",
      am: "በፍቅር ተዘጋጅቶ፣ በደስታ የተጋገረ።"
    }),
    subtitle: JSON.stringify({
      en: "Become a certified professional cake baker in just one month! Join our flexible shifts: Morning, Afternoon, or Night. Learn cake design, decoration, pastry making, and start your own sweet business.",
      am: "በአንድ ወር ውስጥ የተረጋገጠ የኬክ ባለሙያ ይሁኑ! በእኛ አመቺ ፈረቃዎች ይሳተፉ፡ የጠዋት፣ ከሰዓት ወይም የማታ። የኬክ ዲዛይን፣ ማስጌጥ፣ ኬክ ጋገራ ይማሩና የራስዎን ስራ ይጀምሩ።"
    }),
    ctaText: JSON.stringify({
      en: "Register Now",
      am: "አሁን ይመዝገቡ"
    }),
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop"
  });

  const [articles, setArticles] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [products, setProducts] = useState([]);
  const [shiftCounts, setShiftCounts] = useState({ morning: 0, afternoon: 0, night: 0 });
  const [registerOpen, setRegisterOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState("morning");
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  const fetchData = async () => {
    try {
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        setHeroSettings(settingsData.settings);
        if (settingsData.shiftCounts) {
          setShiftCounts(settingsData.shiftCounts);
        }
      }

      const prodRes = await fetch("/api/products?active=true");
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }

      const articlesRes = await fetch("/api/articles");
      const articlesData = await articlesRes.json();
      if (articlesData.success) {
        setArticles(articlesData.articles);
      }

      const testRes = await fetch("/api/testimonies");
      const testData = await testRes.json();
      if (testData.success) {
        setTestimonies(testData.testimonies);
      }
    } catch (error) {
      console.error("Failed to load landing page data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const handleLanguageChange = () => {
      setLang(localStorage.getItem("lang") || "en");
    };

    handleLanguageChange();
    window.addEventListener("languageChange", handleLanguageChange, { passive: true });
    return () => window.removeEventListener("languageChange", handleLanguageChange);
  }, []);

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");

    if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.message) {
      setContactError(lang === "en" ? "Please complete all contact form fields." : "እባክዎን ሁሉንም የቅጽ መስኮች ይሙሉ።");
      return;
    }

    setContactLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (data.success) {
        setContactSuccess(data.message);
        setContactForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setContactError(data.error || (lang === "en" ? "Failed to submit message." : "መልዕክት መላክ አልተሳካም።"));
      }
    } catch (err) {
      setContactError(lang === "en" ? "Could not submit message. Connection failed." : "መገናኘት አልተቻለም።");
    } finally {
      setContactLoading(false);
    }
  };

  const openRegisterWithShift = (shift) => {
    setSelectedShift(shift);
    setRegisterOpen(true);
  };

  const t = translations[lang] || translations["en"];

  const dbSubtitle = getTranslation(heroSettings.subtitle, lang);
  const dbCtaText = getTranslation(heroSettings.ctaText, lang);
  const dbImageUrl = heroSettings.imageUrl || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2c1d11] relative overflow-hidden grid-bg">
      {/* Background spotlights */}
      <div className="aurora-glow top-[10%] left-[20%]" />
      <div className="aurora-glow top-[50%] left-[80%]" />
      <div className="aurora-glow top-[80%] left-[10%]" />

      <div className="relative z-10 w-full min-h-screen">
        <Navbar settings={heroSettings} />
        
        {/* Section 1: Hero Section (CraveLane Full-Screen Poster) */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden p-0 border-b border-[#4a2c11]/10 bg-[#fdfbf7]">
          
          {/* Double Border Frame Overlay (Resting nicely inside screen padding) */}
          <div className="absolute inset-4 sm:inset-6 border border-[#4a2c11]/10 rounded-3xl pointer-events-none z-40 hidden lg:block" />

          <div className="w-full h-full min-h-screen flex flex-col lg:flex-row relative">
            
            {/* Left Side: Poster content */}
            <div className="w-full lg:w-[56%] p-8 sm:p-12 md:p-16 lg:pl-24 flex flex-col justify-center space-y-6 relative z-10 pt-28 lg:pb-36">
              
              {/* Spacer to clear fixed navbar */}
              <div className="h-12 lg:h-20 shrink-0" />
              
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif text-[#2c1d11] tracking-tight text-center lg:text-left leading-[1.08] drop-shadow-sm font-light">
                {lang === "en" ? (
                  <>
                    Made with <span className="text-[#c5a059] italic font-serif font-semibold relative inline-block">love<span className="absolute bottom-1 left-0 right-0 h-[2px] bg-[#c5a059]/30 rounded-full" /></span>,<br />
                    <span className="font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-[#4a2c11] to-[#b89047]">baked to perfection.</span>
                  </>
                ) : (
                  <>
                    በፍቅር ተዘጋጅቶ፣<br />
                    <span className="font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-[#4a2c11] to-[#b89047]">በደስታ የተጋገረ።</span>
                  </>
                )}
              </h1>
              
              {/* Vintage Divider */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="h-[1px] w-12 bg-[#4a2c11]/20" />
                <span className="text-[10px] tracking-[0.25em] font-bold text-[#c5a059]">ACADEMY</span>
                <div className="h-[1px] w-12 bg-[#4a2c11]/20" />
              </div>

              {/* Subtitle description */}
              <p className="text-[#5c4638] text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans text-center lg:text-left">
                {dbSubtitle}
              </p>

              {/* Category Bubbles (Boutique Style) */}
              <div className="flex items-center justify-center lg:justify-start gap-8 py-2">
                {[
                  { label: lang === "en" ? "CAKES" : "ኬኮች", icon: <Cake size={18} /> },
                  { label: lang === "en" ? "CUPCAKES" : "ኩባያ ኬክ", icon: <Sparkles size={18} /> },
                  { label: lang === "en" ? "PASTRIES" : "ጣፋጮች", icon: <Award size={18} /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-14 h-14 rounded-full border border-[#4a2c11]/15 text-[#4a2c11] flex items-center justify-center bg-[#fdfbf7] shadow-md transition-all duration-300 group-hover:border-[#c5a059] group-hover:text-[#c5a059] group-hover:scale-110 group-hover:ring-4 group-hover:ring-[#c5a059]/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#c5a059]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">{item.icon}</div>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#4a2c11] font-sans transition-colors duration-300 group-hover:text-[#c5a059] uppercase">{item.label}</span>
                  </div>
                ))}
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <ShinyButton onClick={() => setRegisterOpen(true)}>
                  {dbCtaText}
                </ShinyButton>
                <button
                  onClick={() => setOrderOpen(true)}
                  className="relative overflow-hidden group rounded-full border border-[#4a2c11]/30 hover:border-[#4a2c11] px-8 py-3.5 text-sm font-semibold tracking-wider text-[#4a2c11] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-[#4a2c11]/5 hover:bg-[#4a2c11]/10"
                >
                  <span className="absolute inset-y-0 -left-[100%] w-[50%] bg-gradient-to-r from-transparent via-[#4a2c11]/10 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover:left-[150%] ease-in-out" />
                  <Cake size={16} className="text-[#4a2c11]" /> {t.ctaOrder}
                </button>
              </div>

              {/* Mobile Contact Row */}
              <div className="lg:hidden border-t border-[#4a2c11]/10 pt-6 flex flex-wrap gap-4 text-[#5c4638] text-xs justify-center">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#c5a059]" />
                  <span className="font-semibold">{heroSettings.contactPhone1 || "098 979 4444"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#c5a059]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>@VCCakeAcademy</span>
                </div>
              </div>
            </div>

            {/* Right Side: Visual Panel (Premium light gradient fallback) */}
            <div className="w-full lg:w-[44%] relative h-[450px] lg:h-screen overflow-hidden bg-gradient-to-br from-[#f8f5ee] to-[#ece5d8] border-l border-[#4a2c11]/5">
              {/* Bakery shelves image (fills frame completely) */}
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"
                alt="Bakery showcase backdrop"
                className="absolute inset-0 w-full h-full object-cover filter blur-[0.5px] opacity-25 scale-105"
              />
              
              {/* Fade gradient transitioning left edge into cream background (Desktop only) */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fdfbf7] to-transparent z-10" />
              
              {/* Inset card decorative border frame inside Right Column */}
              <div className="absolute inset-6 border border-[#4a2c11]/10 rounded-2xl pointer-events-none z-30 hidden lg:block" />

              {/* Chef Photo (fills block completely, scaling proportionally) */}
              <img
                src={dbImageUrl}
                alt="Academy Chef"
                className="absolute inset-0 w-full h-full object-cover object-center z-20 transition-transform duration-500 hover:scale-[1.01]"
              />

              {/* Floating Glassmorphic Stats Badge Card */}
              <div className="absolute bottom-8 left-8 right-8 lg:bottom-24 lg:left-12 lg:right-auto lg:w-[320px] z-35 bg-white/75 backdrop-blur-xl border border-[#d4af37]/35 p-5 rounded-2xl shadow-xl flex flex-col gap-3 animate-float transition duration-300 hover:bg-white/85">
                <div className="flex items-center justify-between border-b border-[#4a2c11]/15 pb-2">
                  <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-[#4a2c11] flex items-center gap-1.5">
                    <Award size={12} className="text-[#c5a059]" /> {lang === "en" ? "Academy Credentials" : "የአካዳሚው ስኬቶች"}
                  </span>
                  <span className="bg-[#c5a059]/20 text-[#2c1d11] text-[8px] font-bold uppercase px-2 py-0.5 rounded font-mono">5-STAR</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-0.5">
                    <span className="block font-serif text-lg font-bold text-[#4a2c11] leading-none">4.9 ★</span>
                    <span className="block text-[8px] uppercase tracking-wider text-[#8c7e7a]">Rating</span>
                  </div>
                  <div className="border-x border-[#4a2c11]/10 space-y-0.5">
                    <span className="block font-serif text-lg font-bold text-[#4a2c11] leading-none">2.5K+</span>
                    <span className="block text-[8px] uppercase tracking-wider text-[#8c7e7a]">{lang === "en" ? "Grads" : "ተመራቂዎች"}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block font-serif text-lg font-bold text-[#c5a059] leading-none">#1</span>
                    <span className="block text-[8px] uppercase tracking-wider text-[#8c7e7a]">{lang === "en" ? "Academy" : "አካዳሚ"}</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-[#5c4638] leading-tight text-center italic border-t border-[#4a2c11]/5 pt-2">
                  {lang === "en" ? "Empowering culinary artists since 2018." : "ከ2010 ጀምሮ የጣፋጭ ባለሙያዎችን ማብቃት።"}
                </p>
              </div>

              {/* Baked Stamp Label */}
              <div className="absolute top-8 right-12 z-30 bg-[#4a2c11] text-[#fdfbf7] px-2.5 py-1.5 rounded-md border border-[#c5a059]/30 text-[8px] font-bold tracking-widest uppercase transform rotate-6 shadow-md font-sans">
                {lang === "en" ? "Baked with Love" : "በፍቅር የተጋገረ"}
              </div>
            </div>

            {/* Absolute bottom curved banner wave (Desktop only, rests perfectly on the inner border frame) */}
            <div className="absolute bottom-6 left-6 right-6 z-30 hidden lg:block">
              {/* Curved SVG divider wave */}
              <svg className="w-full h-10 text-[#4a2c11] fill-current -mb-[1px]" viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 C360,95 720,95 1080,50 L1440,30 L1440,100 L0,100 Z"></path>
              </svg>
              
              {/* Chocolate bottom contact banner */}
              <div className="bg-[#4a2c11] px-12 py-5 text-white flex justify-between items-center text-xs rounded-b-2xl border-t border-[#c5a059]/10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#c5a059]" />
                    <span className="font-semibold">{heroSettings.contactPhone1 || "098 979 4444"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#c5a059]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>@VCCakeAcademy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#c5a059]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <span>VC Cake Academy</span>
                  </div>
                </div>

                <div className="font-serif italic text-[#c5a059] tracking-wide text-xs">
                  TASTE THE DIFFERENCE. <span className="text-white italic font-serif">Love</span> EVERY BITE.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Shift Offerings (Bento Grid Layout) */}
        <ScrollReveal>
          <section id="courses" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-[#4a2c11]/10 bg-[#fbf9f4]/60">
            <div className="max-w-7xl mx-auto w-full space-y-12">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <span className="text-[#c5a059] text-xs font-semibold uppercase tracking-widest block">{t.shiftsLink}</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1d11]">{t.shiftsLink}</h2>
                <div className="h-0.5 w-16 bg-[#4a2c11] mx-auto rounded" />
                <p className="text-[#5c4638] text-sm leading-relaxed">
                  {t.shiftsSubtitle}
                </p>
              </div>

              {/* Bento Asymmetric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: t.morningShift,
                    desc: t.morningDesc,
                    time: "9:00 AM - 12:00 PM",
                    shift: "morning",
                    badge: t.bakingEssentials
                  },
                  {
                    title: t.afternoonShift,
                    desc: t.afternoonDesc,
                    time: "2:00 PM - 5:00 PM",
                    shift: "afternoon",
                    badge: t.advancedDecoration
                  },
                  {
                    title: t.nightShift,
                    desc: t.nightDesc,
                    time: "6:00 PM - 9:00 PM",
                    shift: "night",
                    badge: t.pastryBusiness
                  }
                ].map((s, i) => {
                  const currentCount = shiftCounts[s.shift] || 0;
                  const capacity = s.shift === "morning" ? heroSettings.morningShiftCapacity || 30 :
                                   s.shift === "afternoon" ? heroSettings.afternoonShiftCapacity || 30 :
                                   heroSettings.nightShiftCapacity || 30;
                  const seatsLeft = Math.max(0, capacity - currentCount);
                  const isFull = seatsLeft <= 0;
                  
                  const isShiftOpen = (heroSettings.coursesEnabled !== false && heroSettings.coursesEnabled !== 0 && 
                    (s.shift === "morning" ? heroSettings.morningShiftEnabled !== false && heroSettings.morningShiftEnabled !== 0 :
                     s.shift === "afternoon" ? heroSettings.afternoonShiftEnabled !== false && heroSettings.afternoonShiftEnabled !== 0 :
                     heroSettings.nightShiftEnabled !== false && heroSettings.nightShiftEnabled !== 0) &&
                    !isFull);

                  return (
                    <div key={i} className="bento-card bg-[#fdfbf7] border-[#4a2c11]/15 hover:border-[#4a2c11]/45 flex flex-col justify-between min-h-[280px]">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="bg-[#4a2c11]/10 border border-[#4a2c11]/25 text-[#4a2c11] text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                            {s.badge}
                          </span>
                          <span className="text-[10px] text-[#8c7366] font-mono flex items-center gap-1">
                            <Clock size={12} /> {s.time}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-serif text-xl font-bold text-[#2c1d11]">{s.title}</h3>
                          <p className="text-xs text-[#5c4638] leading-relaxed">{s.desc}</p>
                        </div>
                      </div>

                      <div className="border-t border-[#4a2c11]/10 pt-4 flex justify-between items-center mt-6">
                        <div>
                          <span className="block text-xs font-bold text-[#4a2c11]">{Number(heroSettings.coursePrice || 2500).toLocaleString()} ETB</span>
                          <span className="block text-[9px] text-[#8c7366]">/ {t.month}</span>
                          <span className="block text-[9px] text-[#8c7366] mt-1 font-semibold">
                            {seatsLeft > 0 ? `${seatsLeft} seats left` : "Fully Booked"}
                          </span>
                        </div>
                        {isShiftOpen ? (
                          <ShinyButton
                            onClick={() => openRegisterWithShift(s.shift)}
                            className="py-2 px-5 text-[10px]"
                          >
                            {t.registerBtn}
                          </ShinyButton>
                        ) : (
                          <button
                            disabled
                            className="py-2 px-5 text-[10px] bg-red-950/20 border border-red-500/30 text-red-400 rounded-full font-semibold opacity-75 select-none"
                          >
                            {isFull ? "Fully Booked" : "Closed"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Section 3: Custom Cake Catalog (Bento Gallery Style) */}
        <ScrollReveal>
          <section id="orders" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-[#4a2c11]/10">
            <div className="max-w-7xl mx-auto w-full space-y-12">
              
              <div className="text-center max-w-xl mx-auto space-y-4">
                <span className="text-[#c5a059] text-xs font-semibold uppercase tracking-widest block">{t.orderLink}</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1d11]">{t.catalogTitle}</h2>
                <div className="h-0.5 w-16 bg-[#4a2c11] mx-auto rounded" />
                <p className="text-[#5c4638] text-sm leading-relaxed">
                  {lang === "en" ? "Order gourmet customized pastry and decorative layered cakes for your special milestone occasions." : "ለሚወዷቸው ክብረ በዓላት የሚሆኑ ልዩ ኬኮችን ያዘዙ።"}
                </p>
              </div>

              {/* Bento Image Catalog Grid grouped by Category */}
              <div className="space-y-16">
                {Object.keys(
                  (products.length > 0 ? products : [
                    {
                      name: t.weddingCakes || "Wedding Cakes",
                      category: "Cakes",
                      basePrice: 800,
                      image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=400&auto=format&fit=crop"
                    },
                    {
                      name: t.birthdayCakes || "Birthday Cakes",
                      category: "Cakes",
                      basePrice: 800,
                      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop"
                    },
                    {
                      name: "Celebration Cakes",
                      category: "Cakes",
                      basePrice: 800,
                      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop"
                    }
                  ]).reduce((acc, p) => {
                    const cat = p.category || "Cakes";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(p);
                    return acc;
                  }, {})
                ).map((catName) => {
                  const groupedList = (products.length > 0 ? products : [
                    {
                      name: t.weddingCakes || "Wedding Cakes",
                      category: "Cakes",
                      basePrice: 800,
                      image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=400&auto=format&fit=crop"
                    },
                    {
                      name: t.birthdayCakes || "Birthday Cakes",
                      category: "Cakes",
                      basePrice: 800,
                      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop"
                    },
                    {
                      name: "Celebration Cakes",
                      category: "Cakes",
                      basePrice: 800,
                      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop"
                    }
                  ]).filter(p => (p.category || "Cakes") === catName);

                  return (
                    <div key={catName} className="space-y-6">
                      <h3 className="font-serif text-lg font-bold text-[#c5a059] border-b border-[#4a2c11]/15 pb-2 inline-block uppercase tracking-wider">
                        {catName}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {groupedList.map((cake, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setSelectedProductForOrder(cake.name);
                              setOrderOpen(true);
                            }}
                            className="bento-card p-0 rounded-2xl overflow-hidden group relative min-h-[260px] cursor-pointer transform hover:scale-[1.01] transition-all duration-300 border border-[#4a2c11]/10 hover:border-[#d4af37]/30"
                          >
                            <img
                              src={cake.image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"}
                              alt={cake.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                              <span className="bg-[#d4af37]/20 border border-[#d4af37]/35 text-[#d4af37] text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block">
                                {cake.category}
                              </span>
                              <h3 className="font-serif text-xl font-bold text-white">{cake.name}</h3>
                              <p className="text-xs text-[#c9bfbc] font-mono">Starting at {Number(cake.basePrice).toLocaleString()} ETB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-8">
                <ShinyButton onClick={() => { setSelectedProductForOrder(null); setOrderOpen(true); }} className="mx-auto">
                  <Cake size={16} /> {t.customizerBtn}
                </ShinyButton>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Section 4: Blogs & Vlogs */}
        <ScrollReveal>
          <section id="blogs" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-[#4a2c11]/10 bg-[#fbf9f4]/60">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <div className="lg:col-span-4 space-y-4 text-center lg:text-left sticky top-28">
                <span className="text-[#c5a059] text-xs font-semibold uppercase tracking-widest block">{t.blogsLink}</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1d11]">{t.blogsLink}</h2>
                <div className="h-0.5 w-16 bg-[#4a2c11] lg:mx-0 mx-auto rounded" />
                <p className="text-[#5c4638] text-sm leading-relaxed">
                  {t.blogSubtitle}
                </p>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {articles.length === 0 ? (
                  <div className="text-center text-[#8c7366] py-12">{t.noArticles}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((art) => (
                      <div key={art.id} className="bento-card bg-[#fdfbf7] border-[#4a2c11]/15 p-0 rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div className="space-y-4">
                          {art.type === "vlog" ? (
                            <div className="relative aspect-video w-full bg-black">
                              <iframe
                                src={art.mediaUrl}
                                title={getTranslation(art.title, lang)}
                                className="absolute inset-0 w-full h-full border-none"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <div className="h-44 w-full overflow-hidden">
                              <img
                                src={art.mediaUrl}
                                alt={getTranslation(art.title, lang)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="p-6 space-y-2.5">
                            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-[#c5a059] uppercase">
                              {art.type === "vlog" ? <Video size={12} /> : <FileText size={12} />}
                              <span>{art.type === "vlog" ? t.vlogLabel : t.blogLabel}</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#2c1d11]">
                              {getTranslation(art.title, lang)}
                            </h3>
                            <p className="text-xs text-[#5c4638] leading-relaxed whitespace-pre-line line-clamp-4">
                              {getTranslation(art.content, lang)}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 border-t border-[#4a2c11]/10 flex justify-between items-center text-[10px] text-[#8c7366]">
                          <span>VC Cake Academy</span>
                          <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>
        </ScrollReveal>

        {/* Section 5: Testimonials (3D Storybook) */}
        <ScrollReveal>
          <section className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-[#4a2c11]/10">
            <div className="max-w-7xl mx-auto w-full space-y-8">
              <div className="text-center space-y-3">
                <span className="text-[#c5a059] text-xs font-semibold uppercase tracking-widest block">Success Stories</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1d11]">{t.testimoniesTitle}</h2>
                <div className="h-0.5 w-16 bg-[#4a2c11] mx-auto rounded" />
              </div>
              <GraduateBook testimonies={testimonies} lang={lang} />
            </div>
          </section>
        </ScrollReveal>

        {/* Section 6: Contact Form */}
        <ScrollReveal>
          <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative border-t border-[#4a2c11]/10 bg-[#fbf9f4]/60">
            <div className="max-w-3xl mx-auto w-full">
              <div className="bg-[#1a100e] text-[#fdfbf7] p-8 md:p-10 rounded-2xl border border-[#c5a059]/20 shadow-2xl">
                <h3 className="font-serif text-2xl font-bold text-[#c5a059] mb-2">{t.admissionsInquiry}</h3>
                <p className="text-xs text-[#c9bfbc] mb-6 leading-relaxed">
                  {t.contactSubtitle} <strong>098 979 4444</strong>.
                </p>

                {contactError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded mb-4 text-xs flex gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{contactError}</span>
                  </div>
                )}

                {contactSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded mb-4 text-xs flex gap-2">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{contactSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelName}</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder={t.placeholderName}
                      className="input-field text-white bg-black/40"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelEmail}</label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        placeholder={t.placeholderEmail}
                        className="input-field text-white bg-black/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelPhone}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        placeholder={t.placeholderPhone}
                        className="input-field text-white bg-black/40"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#c9bfbc] mb-1 font-medium">{t.labelMessage}</label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder={t.placeholderMessage}
                      rows={3}
                      className="input-field text-white bg-black/40"
                      required
                    />
                  </div>

                  <ShinyButton
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-2.5 rounded font-semibold text-sm transition mt-2 disabled:opacity-50"
                  >
                    <Send size={14} /> {contactLoading ? t.sendingMsg : t.submitMsgBtn}
                  </ShinyButton>
                </form>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <Footer settings={heroSettings} />
      </div>

      {/* Course Registration Modal */}
      <CourseRegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        lang={lang}
        settings={heroSettings}
        selectedShift={selectedShift}
        shiftCounts={shiftCounts}
      />

       {/* Cake Order Modal */}
      <CakeOrderModal
        isOpen={orderOpen}
        onClose={() => { setOrderOpen(false); setSelectedProductForOrder(null); }}
        lang={lang}
        settings={heroSettings}
        initialProduct={selectedProductForOrder}
      />
    </div>
  );
}
