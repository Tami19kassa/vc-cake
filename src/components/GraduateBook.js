"use client";

import { useEffect, useRef, useState } from "react";
import { Star, ChevronRight, BookOpen, Quote } from "lucide-react";
import { translations, getTranslation } from "@/lib/translations";

export default function GraduateBook({ testimonies, lang }) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.IntersectionObserver) {
      setIsOpen(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsOpen(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const t = translations[lang] || translations["en"];

  // First 3 testimonies go inside the book
  const bookTestimonies = testimonies.slice(0, 3);
  // The rest scroll horizontally
  const extraTestimonies = testimonies.slice(3);

  return (
    <div ref={containerRef} className="w-full space-y-12 py-12">
      {/* 3D Storybook Wrapper */}
      <div className="relative max-w-4xl mx-auto perspective-2000 px-4">
        
        {/* Book Container with folding animation */}
        <div
          className={`relative w-full min-h-[500px] md:min-h-[460px] grid grid-cols-1 md:grid-cols-2 gap-0.5 rounded-2xl transition-all duration-1000 ease-out origin-left shadow-2xl ${
            isOpen 
              ? "opacity-100 rotate-y-0 scale-100" 
              : "opacity-0 -rotate-y-[45deg] scale-95"
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Background Book Spine spine binding */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-[#1f1311] z-30 shadow-inner hidden md:block" />

          {/* PAGE 1: LEFT PAGE (Graduate 1) */}
          <div 
            className="relative bg-[#fcf9f2] text-[#2c1d11] p-6 md:p-8 rounded-t-xl md:rounded-tr-none md:rounded-l-xl shadow-[inset_-10px_0_20px_rgba(0,0,0,0.06)] border-r border-black/5 flex flex-col justify-between"
            style={{
              backgroundImage: "radial-gradient(#f7f2e8 1px, transparent 0), radial-gradient(#f7f2e8 1px, transparent 0)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px"
            }}
          >
            {/* Page header and decorative quote mark */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#2c1d11]/15 pb-2">
                <span className="font-serif text-xs font-bold tracking-widest text-[#d4af37] uppercase flex items-center gap-1">
                  <BookOpen size={12} /> {lang === "en" ? "Graduates Chronicle" : "የባለሙያዎች ታሪክ"}
                </span>
                <span className="text-[10px] text-[#8c7e7a] font-mono">Page 1</span>
              </div>
              
              <Quote className="text-[#d4af37]/25 w-10 h-10 -ml-2" />
              
              {bookTestimonies[0] ? (
                <div className="space-y-4 -mt-4">
                  <p className="font-serif text-sm md:text-base leading-relaxed italic text-[#3d2e24]">
                    "{getTranslation(bookTestimonies[0].text, lang)}"
                  </p>
                  
                  {/* Rating */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < bookTestimonies[0].rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#8c7e7a] italic">Baking graduate details loading...</p>
              )}
            </div>

            {/* Author footer */}
            {bookTestimonies[0] && (
              <div className="flex items-center gap-4 pt-4 border-t border-[#2c1d11]/10 mt-6">
                <img
                  src={bookTestimonies[0].avatarUrl}
                  alt={bookTestimonies[0].clientName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#d4af37]"
                />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1f1311]">{bookTestimonies[0].clientName}</h4>
                  <span className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider">{t.verifiedStudent}</span>
                </div>
              </div>
            )}
          </div>

          {/* PAGE 2: RIGHT PAGE (Graduate 2 & 3) */}
          <div 
            className="relative bg-[#fcf9f2] text-[#2c1d11] p-6 md:p-8 rounded-b-xl md:rounded-bl-none md:rounded-r-xl shadow-[inset_10px_0_20px_rgba(0,0,0,0.06)] flex flex-col justify-between"
            style={{
              backgroundImage: "radial-gradient(#f7f2e8 1px, transparent 0), radial-gradient(#f7f2e8 1px, transparent 0)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px"
            }}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#2c1d11]/15 pb-2">
                <span className="font-serif text-xs font-bold tracking-widest text-[#d4af37] uppercase">
                  {lang === "en" ? "VC Success Memoirs" : "የቪሲ የስኬት ማስታወሻዎች"}
                </span>
                <span className="text-[10px] text-[#8c7e7a] font-mono">Page 2</span>
              </div>

              {/* Testimony 2 */}
              {bookTestimonies[1] && (
                <div className="space-y-2 border-b border-[#2c1d11]/10 pb-4">
                  <p className="text-xs md:text-sm leading-relaxed italic text-[#3d2e24] line-clamp-3">
                    "{getTranslation(bookTestimonies[1].text, lang)}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={bookTestimonies[1].avatarUrl}
                      alt={bookTestimonies[1].clientName}
                      className="w-6 h-6 rounded-full object-cover border border-[#d4af37]"
                    />
                    <div>
                      <span className="font-serif text-xs font-bold block leading-none">{bookTestimonies[1].clientName}</span>
                      <span className="text-[8px] text-[#8c7e7a]">{t.verifiedStudent}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Testimony 3 */}
              {bookTestimonies[2] && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs md:text-sm leading-relaxed italic text-[#3d2e24] line-clamp-3">
                    "{getTranslation(bookTestimonies[2].text, lang)}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={bookTestimonies[2].avatarUrl}
                      alt={bookTestimonies[2].clientName}
                      className="w-6 h-6 rounded-full object-cover border border-[#d4af37]"
                    />
                    <div>
                      <span className="font-serif text-xs font-bold block leading-none">{bookTestimonies[2].clientName}</span>
                      <span className="text-[8px] text-[#8c7e7a]">{t.verifiedStudent}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hint to scroll horizontally */}
            {extraTestimonies.length > 0 && (
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#8c7e7a] font-mono mt-4">
                <span>{lang === "en" ? "Swipe for more stories" : "ተጨማሪ ታሪኮችን ለማየት ያንሸራትቱ"}</span>
                <ChevronRight size={12} className="animate-bounce-horizontal" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* HORIZONTAL CAROUSEL (For the remaining testimonies) */}
      {extraTestimonies.length > 0 && (
        <div className="space-y-4">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="font-serif text-base font-bold text-[#d4af37] border-b border-[#d4af37]/10 pb-2 mb-4">
              {lang === "en" ? "More Graduate Chronicles" : "ተጨማሪ የባለሙያዎች ታሪኮች"}
            </h3>
          </div>

          {/* Horizontal scroll strip */}
          <div className="w-full overflow-x-auto snap-x snap-mandatory py-4 px-4 flex gap-6 scrollbar-thin scrollbar-thumb-[#d4af37]/20 scrollbar-track-transparent">
            {extraTestimonies.map((tItem, index) => (
              <div
                key={tItem.id}
                className="shrink-0 w-[290px] sm:w-[320px] bg-[#fdfbf7] text-[#2c1d11] p-6 rounded-xl border border-[#2c1d11]/10 shadow-md snap-start flex flex-col justify-between"
                style={{
                  backgroundImage: "linear-gradient(#2c1d11/5 1px, transparent 1px)",
                  backgroundSize: "100% 24px"
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#2c1d11]/10 pb-2">
                    <span className="text-[9px] font-mono font-bold text-[#d4af37] uppercase">Story #{index + 4}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < tItem.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                  <Quote className="text-[#d4af37]/20 w-8 h-8 -ml-1" />
                  <p className="text-xs leading-relaxed italic text-[#3d2e24] -mt-2">
                    "{getTranslation(tItem.text, lang)}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#2c1d11]/10 mt-4">
                  <img
                    src={tItem.avatarUrl}
                    alt={tItem.clientName}
                    className="w-8 h-8 rounded-full object-cover border border-[#d4af37]"
                  />
                  <div>
                    <h5 className="font-serif text-xs font-bold text-[#1f1311]">{tItem.clientName}</h5>
                    <span className="text-[8px] text-[#8c7e7a] uppercase">{t.verifiedStudent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
