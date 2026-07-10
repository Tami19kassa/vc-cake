"use client";

import { useEffect, useState } from "react";

export default function SaveLogoPage() {
  const [status, setStatus] = useState("Initializing canvas rendering...");

  useEffect(() => {
    const renderAndSave = async () => {
      try {
        const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#fdfbf7" stroke="#4a2c11" stroke-width="2.5" />
  <circle cx="50" cy="50" r="42" fill="none" stroke="#4a2c11" stroke-width="1" stroke-dasharray="2,2" />
  <path d="M38 36 C35 30, 43 24, 46 29 C48 24, 52 24, 54 29 C57 24, 65 30, 62 36 C64 39, 62 44, 58 44 L42 44 C38 44, 36 39, 38 36 Z" fill="#c5a059" />
  <rect x="42" y="41" width="16" height="3" rx="0.5" fill="#4a2c11" />
  <g transform="translate(0, 10)">
    <rect x="35" y="48" width="30" height="8" rx="1" fill="#4a2c11" />
    <rect x="40" y="41" width="20" height="7" rx="1" fill="#fdfbf7" />
    <rect x="44" y="35" width="12" height="6" rx="1" fill="#4a2c11" />
    <path d="M32 56 L68 56 L60 59 L40 59 Z" fill="#fdfbf7" />
    <path d="M50 31 C49 29, 47 29, 47 31 C47 33, 50 34, 50 34 C50 34, 53 33, 53 31 C53 29, 51 29, 50 31 Z" fill="red" />
  </g>
  <polygon points="18,50 20,44 22,50 17,46 23,46" fill="#c5a059" />
  <polygon points="82,50 80,44 78,50 83,46 77,46" fill="#c5a059" />
</svg>
        `.trim();

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Render 512x512
          const canvas512 = document.createElement("canvas");
          canvas512.width = 512;
          canvas512.height = 512;
          const ctx512 = canvas512.getContext("2d");
          ctx512.drawImage(img, 0, 0, 512, 512);
          const dataUrl512 = canvas512.toDataURL("image/png");

          // Render 192x192
          const canvas192 = document.createElement("canvas");
          canvas192.width = 192;
          canvas192.height = 192;
          const ctx192 = canvas192.getContext("2d");
          ctx192.drawImage(img, 0, 0, 192, 192);
          const dataUrl192 = canvas192.toDataURL("image/png");

          // Post to server
          fetch("/api/save-logo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl512, dataUrl192 })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setStatus("Success! PWA PNG icons saved to public/icons/.");
              } else {
                setStatus("Error: " + data.error);
              }
            })
            .catch(err => setStatus("Error: " + err.message));

          URL.revokeObjectURL(url);
        };

        img.src = url;
      } catch (err) {
        setStatus("Error loading renderer: " + err.message);
      }
    };

    renderAndSave();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center text-[#4a2c11] font-sans p-8">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl border border-[#4a2c11]/15">
        <h2 className="text-xl font-bold font-serif">PWA Icon Renderer</h2>
        <p className="text-sm text-[#5c4638]">{status}</p>
      </div>
    </div>
  );
}
