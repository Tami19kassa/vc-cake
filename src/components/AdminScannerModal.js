"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle, Upload } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminScannerModal({ isOpen, onClose }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const scannerInstanceRef = useRef(null);

  const stopCamera = async () => {
    if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setError("");
    setSuccess("");
    const scannerId = "qr-reader-container";

    try {
      if (!scannerInstanceRef.current) {
        scannerInstanceRef.current = new Html5Qrcode(scannerId);
      }
      
      const html5QrCode = scannerInstanceRef.current;
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setSuccess(decodedText);
          if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
            window.location.href = decodedText;
          } else {
            setError(`Scanned code: ${decodedText} (Not a valid verification URL)`);
          }
        },
        () => {
          // Silence noise frame errors
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.error("Camera init error:", err);
      setError("Failed to start camera. Please ensure permissions are granted, or upload a photo below.");
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Wait slightly for DOM to render the container
    const timer = setTimeout(() => {
      startCamera();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen]);

  const preprocessImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          
          ctx.drawImage(img, 0, 0, w, h);
          
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;
          
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
            sum += brightness;
          }
          const avgBrightness = sum / (data.length / 4);
          const threshold = avgBrightness > 128 ? avgBrightness - 30 : avgBrightness + 30;
          
          for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
            const val = brightness < threshold ? 0 : 255;
            data[i] = val;
            data[i+1] = val;
            data[i+2] = val;
            data[i+3] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, { type: "image/png" });
              resolve(processedFile);
            } else {
              resolve(file);
            }
          }, "image/png");
        };
        img.onerror = () => reject(new Error("Failed to load image element."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("FileReader failed."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

    try {
      // Stop the camera if running
      await stopCamera();

      const scannerId = "qr-reader-container";
      if (!scannerInstanceRef.current) {
        scannerInstanceRef.current = new Html5Qrcode(scannerId);
      }

      const html5QrCode = scannerInstanceRef.current;

      let processedFile = file;
      try {
        processedFile = await preprocessImage(file);
      } catch (err) {
        console.warn("Preprocessing failed, using original file:", err);
      }

      html5QrCode.scanFile(processedFile, false)
        .then((decodedText) => {
          setSuccess(decodedText);
          if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
            window.location.href = decodedText;
          } else {
            setError(`Scanned code: ${decodedText} (Not a valid verification URL)`);
          }
        })
        .catch((err) => {
          console.log("Processed scan failed, trying original:", err);
          html5QrCode.scanFile(file, false)
            .then((decodedText) => {
              setSuccess(decodedText);
              if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
                window.location.href = decodedText;
              } else {
                setError(`Scanned code: ${decodedText} (Not a valid verification URL)`);
              }
            })
            .catch((err2) => {
              console.error(err2);
              setError("Could not find a valid QR code in the uploaded image. Please ensure the image is clear and contains a single QR code.");
            });
        });
    } catch (err) {
      console.error(err);
      setError("Failed to process uploaded file scanner.");
    }
  };

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
          
          {!success && !error && !cameraActive && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-xs text-[#c9bfbc]/80 mb-2">Camera scanner stopped or failed to load.</span>
              <button 
                onClick={startCamera} 
                className="bg-[#d4af37]/20 border border-[#d4af37]/45 text-[#d4af37] text-xs py-1 px-3 rounded cursor-pointer hover:bg-[#d4af37]/35 transition"
              >
                Retry Camera
              </button>
            </div>
          )}

          {!success && !error && cameraActive && (
            <div className="absolute inset-0 border-2 border-dashed border-[#d4af37]/45 pointer-events-none rounded-xl m-8 flex items-center justify-center">
              <span className="text-[10px] text-[#c9bfbc]/60 uppercase tracking-widest text-center px-4">Center receipt QR code inside box</span>
            </div>
          )}
        </div>

        {/* File upload option */}
        <div className="mt-4 pt-4 border-t border-[#d4af37]/15">
          <label className="block text-xs font-semibold text-center text-[#c9bfbc] mb-2">
            Or upload a screenshot / photo of the receipt QR Code:
          </label>
          <div className="flex justify-center">
            <label className="gold-btn py-2 px-5 rounded text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition hover:bg-[#d4af37]/25">
              <Upload size={14} />
              <span>Choose Photo to Scan</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <p className="text-[10px] text-[#8c7e7a] text-center mt-4">
          Allows administrative scanning using laptop webcam, phone camera, or receipt file upload.
        </p>

      </div>
    </div>
  );
}
