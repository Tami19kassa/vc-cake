"use client";

import React from "react";

export const ShinyButton = React.forwardRef(
  ({ children, className = "", onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`group relative overflow-hidden rounded-full bg-gradient-to-r from-[#3a2016] to-[#200f09] px-8 py-3.5 text-sm font-semibold tracking-wider text-white border border-[#c5a059]/40 shadow-[0_0_15px_rgba(74,44,17,0.08)] hover:shadow-[0_0_25px_rgba(74,44,17,0.25)] hover:border-[#c5a059] transition-all duration-500 cursor-pointer ${className}`}
        {...props}
      >
        {/* Shimmer Sweep overlay */}
        <span className="absolute inset-y-0 -left-[100%] w-[50%] bg-gradient-to-r from-transparent via-white/18 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover:left-[150%] ease-in-out" />
        
        {/* Inner glow dot */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,transparent_70%)] transition-opacity duration-500" />

        {/* Content text */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";
