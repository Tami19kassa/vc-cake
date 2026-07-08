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
    imageUrl: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop"
  });

  const [articles, setArticles] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState("morning");

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
  const dbImageUrl = heroSettings.imageUrl || "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2c1d11] relative overflow-hidden grid-bg">
      {/* Background spotlights */}
      <div className="aurora-glow top-[10%] left-[20%]" />
      <div className="aurora-glow top-[50%] left-[80%]" />
      <div className="aurora-glow top-[80%] left-[10%]" />

      <Navbar />

      <div className="relative z-10 w-full min-h-screen">
        
        {/* Section 1: Hero Section (CraveLane Unified Poster Design) */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          
          {/* Main Poster Container Card */}
          <div className="max-w-6xl mx-auto w-full rounded-[32px] overflow-hidden border border-[#4a2c11]/15 bg-[#fdfbf7] shadow-2xl relative lg:h-[650px] flex flex-col lg:flex-row p-0">
            
            {/* Double Border Frame Overlay (Desktop only for precision bounds) */}
            <div className="absolute inset-1.5 border border-[#4a2c11]/10 rounded-[26px] pointer-events-none z-40 hidden lg:block" />

            {/* Left Side: Info details & Category icons */}
            <div className="w-full lg:w-[58%] p-8 sm:p-12 md:p-16 flex flex-col justify-center space-y-6 relative z-10 lg:pb-36">
              
              {/* Badge */}
              <div className="text-center lg:text-left">
                <span className="academy-badge text-[#4a2c11] border-[#4a2c11]/15 bg-[#4a2c11]/5">
                  {t.badgeHero}
                </span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-[#2c1d11] font-serif tracking-tight text-center lg:text-left">
                {lang === "en" ? (
                  <>
                    Made with <span className="text-[#c5a059] italic font-normal font-serif">love</span>, baked to perfection.
                  </>
                ) : (
                  <>
                    በፍቅር ተዘጋጅቶ፣ <span className="text-[#c5a059] italic font-normal font-serif">በደስታ</span> የተጋገረ።
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

              {/* Category Bubbles */}
              <div className="flex items-center justify-center lg:justify-start gap-6 py-2">
                {[
                  { label: lang === "en" ? "CAKES" : "ኬኮች", icon: <Cake size={20} /> },
                  { label: lang === "en" ? "CUPCAKES" : "ኩባያ ኬክ", icon: <Sparkles size={20} /> },
                  { label: lang === "en" ? "PASTRIES" : "ጣፋጮች", icon: <Award size={20} /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-[#4a2c11] text-[#fdfbf7] flex items-center justify-center border border-[#c5a059]/30 shadow-md transition-transform duration-300 hover:scale-105">
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#4a2c11] font-sans">{item.label}</span>
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

              {/* Mobile Contact Row (displays at bottom of text block under lg width) */}
              <div className="lg:hidden border-t border-[#4a2c11]/10 pt-6 flex flex-wrap gap-4 text-[#5c4638] text-xs justify-center">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#c5a059]" />
                  <span className="font-semibold">098 979 4444</span>
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

            {/* Right Side: Full-bleed shelves background + Chef portrait */}
            <div className="w-full lg:w-[42%] relative h-[350px] lg:h-full overflow-hidden bg-[#fbf9f4]">
              {/* Bakery shelves image (fills frame completely) */}
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"
                alt="Bakery showcase backdrop"
                className="absolute inset-0 w-full h-full object-cover filter blur-[0.5px] opacity-35 scale-105"
              />
              
              {/* Fade gradient transitioning left edge into cream background (Desktop only) */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fdfbf7] to-transparent z-10" />
              
              {/* Dark vignette overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c1d11]/45 via-transparent to-transparent z-10" />

              {/* Chef Photo (fills block completely, scaling proportionally) */}
              <img
                src={dbImageUrl}
                alt="Academy Chef"
                className="absolute inset-0 w-full h-full object-cover object-top z-20 transition-transform duration-500 hover:scale-102"
              />

              {/* Baked Stamp Label */}
              <div className="absolute top-6 right-6 z-30 bg-[#4a2c11] text-[#fdfbf7] px-2.5 py-1.5 rounded-md border border-[#c5a059]/30 text-[8px] font-bold tracking-widest uppercase transform rotate-6 shadow-md font-sans">
                {lang === "en" ? "Baked with Love" : "በፍቅር የተጋገረ"}
              </div>
            </div>

            {/* Absolute bottom curved banner wave (Desktop only, anchors layout) */}
            <div className="absolute bottom-0 left-0 right-0 z-30 hidden lg:block">
              {/* Curved SVG divider wave */}
              <svg className="w-full h-10 text-[#4a2c11] fill-current -mb-[1px]" viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path d="M0,50 C360,95 720,95 1080,50 L1440,30 L1440,100 L0,100 Z"></path>
              </svg>
              
              {/* Chocolate bottom contact banner */}
              <div className="bg-[#4a2c11] px-12 py-5 text-white flex justify-between items-center text-xs border-t border-[#c5a059]/10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#c5a059]" />
                    <span className="font-semibold">098 979 4444</span>
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
                  TASTE THE DIFFERENCE. <span className="text-white italic">Love</span> EVERY BITE.
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
                ].map((s, i) => (
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
                        <span className="block text-xs font-bold text-[#4a2c11]">2,500 ETB</span>
                        <span className="block text-[9px] text-[#8c7366]">/ {t.month}</span>
                      </div>
                      <ShinyButton
                        onClick={() => openRegisterWithShift(s.shift)}
                        className="py-2 px-5 text-[10px]"
                      >
                        {t.registerBtn}
                      </ShinyButton>
                    </div>
                  </div>
                ))}
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

              {/* Bento Image Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    title: t.weddingCakes,
                    desc: t.weddingDesc,
                    img: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=400&auto=format&fit=crop",
                    span: "md:col-span-2"
                  },
                  {
                    title: t.birthdayCakes,
                    desc: t.birthdayDesc,
                    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop",
                    span: "md:col-span-2"
                  },
                  {
                    title: t.pastries,
                    desc: t.pastriesDesc,
                    img: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop",
                    span: "md:col-span-2"
                  },
                  {
                    title: t.rolls,
                    desc: t.rollsDesc,
                    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&auto=format&fit=crop",
                    span: "md:col-span-2"
                  }
                ].map((cake, i) => (
                  <div key={i} className={`bento-card p-0 rounded-2xl overflow-hidden group relative min-h-[220px] ${cake.span}`}>
                    <img
                      src={cake.img}
                      alt={cake.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                      <h3 className="font-serif text-xl font-bold text-white">{cake.title}</h3>
                      <p className="text-xs text-[#c9bfbc] leading-relaxed max-w-md">{cake.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <ShinyButton onClick={() => setOrderOpen(true)} className="mx-auto">
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

        <Footer />
      </div>

      {/* Course Registration Modal */}
      <CourseRegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        lang={lang}
      />

      {/* Cake Order Modal */}
      <CakeOrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        lang={lang}
      />
    </div>
  );
}
