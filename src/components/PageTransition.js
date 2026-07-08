"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isWiping, setIsWiping] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // 1. Slide curtain in to cover screen
    setIsWiping(true);
    
    // 2. Swap page children when screen is covered (at 350ms)
    const swapTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 350);

    // 3. Slide curtain away (at 700ms total)
    const endTimer = setTimeout(() => {
      setIsWiping(false);
    }, 700);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, children]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Active Page Content */}
      <div className="w-full min-h-screen">
        {displayChildren}
      </div>

      {/* Slide Curtain Wipe Overlay */}
      <div
        className={`fixed inset-y-0 right-0 w-full h-screen z-[9999] pointer-events-none transition-transform duration-700 cubic-bezier(0.85, 0, 0.15, 1) ${
          isWiping ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "linear-gradient(135deg, #180f0d 0%, #090504 100%)",
          borderLeft: "2.5px solid #d4af37",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
        }}
      >
        {/* Secondary Overlay Stripe */}
        <div
          className={`absolute inset-0 bg-[#d4af37] transition-transform duration-500 delay-[50ms] cubic-bezier(0.85, 0, 0.15, 1) ${
            isWiping ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ opacity: 0.12 }}
        />

        {/* Loading Spinner & Branding */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
          {/* Circular Gold Spinner */}
          <div className="w-12 h-12 border-2 border-t-transparent border-[#d4af37] rounded-full animate-spin" />
          
          <div className="text-center">
            <span className="font-serif text-sm font-bold tracking-[0.2em] text-[#d4af37] block uppercase">
              VC CAKE
            </span>
            <span className="text-[9px] tracking-[0.3em] text-white block uppercase opacity-75">
              Academy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
