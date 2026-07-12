"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    // Disable service worker in development to prevent intercepting hot module reloads (HMR)
    if (process.env.NODE_ENV === "development") {
      return;
    }

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Monitor controller activation to trigger reload
      let refreshing = false;
      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          console.log("Service worker controller changed. Reloading page...");
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

      const handleRegister = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("ServiceWorker registration successful with scope: ", registration.scope);

          // Listen for new service worker installation
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // A new worker exists and is waiting to activate. Skip waiting is configured in sw.js install stage.
                  console.log("New service worker version detected.");
                }
              });
            }
          });
        } catch (err) {
          console.error("ServiceWorker registration failed: ", err);
        }
      };

      if (document.readyState === "complete") {
        handleRegister();
      } else {
        window.addEventListener("load", handleRegister);
        return () => {
          window.removeEventListener("load", handleRegister);
          navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        };
      }

      return () => {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      };
    }
  }, []);

  return null;
}
