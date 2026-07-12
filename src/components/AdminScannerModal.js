"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminScannerModal({ isOpen, onClose }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode;
    const scannerId = "qr-reader-container";

    // Wait slightly for DOM to render the target div
    const timer = setTimeout(() => {
      try {
        html5QrCode = new Html5Qrcode(scannerId);
        
        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            setSuccess(decodedText);
            
            // Auto redirect if valid url, otherwise notify
            if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
              window.location.href = decodedText;
            } else {
              setError(`Scanned code: ${decodedText} (Not a valid verification URL)`);
            }
          },
          (errorMessage) => {
            // Silence noise frame errors
          }
        ).catch(err => {
          console.error("Camera init error:", err);
          setError("Failed to start camera. Please ensure permissions are granted.");
        });

      } catch (err) {
        console.error("Scanner setup error:", err);
        setError("Setup error starting QR scanner.");
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
          }).catch(err => console.error("Error stopping scanner:", err));
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#120a09] border border-[#d4af37]/25 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#d4af37]/15 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="text-[#d4af37]" size={20} />
            <h3 className="font-serif text-lg font-bold text-white">Scan Receipt QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex gap-2 items-start text-xs mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-xs mb-4 font-mono break-all">
            Redirecting to: {success}
          </div>
        )}

        {/* Video Area */}
        <div className="relative bg-black aspect-square max-h-64 mx-auto rounded-xl overflow-hidden border border-[#d4af37]/10 flex items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full"></div>
          
          {!success && !error && (
            <div className="absolute inset-0 border-2 border-dashed border-[#d4af37]/45 pointer-events-none rounded-xl m-8 flex items-center justify-center">
              <span className="text-[10px] text-[#c9bfbc]/60 uppercase tracking-widest text-center px-4">Center receipt QR code inside box</span>
            </div>
          )}
        </div>

        <p className="text-[10px] text-[#8c7e7a] text-center mt-4">
          Allows administrative scanning using laptop webcam or phone camera. Scanned links will automatically open the verification status screen.
        </p>

      </div>
    </div>
  );
}
