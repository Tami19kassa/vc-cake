"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    // Disable service worker in development to prevent intercepting hot module reloads (HMR)
    if (process.env.NODE_ENV === "development") {
      return;
    }

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handleRegister = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("ServiceWorker registration successful with scope: ", registration.scope);
        } catch (err) {
          console.error("ServiceWorker registration failed: ", err);
        }
      };

      if (document.readyState === "complete") {
        handleRegister();
      } else {
        window.addEventListener("load", handleRegister);
        return () => window.removeEventListener("load", handleRegister);
      }
    }
  }, []);

  return null;
}
