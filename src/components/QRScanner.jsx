import React, { useEffect, useRef, useState } from "react";
import { X, Loader } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScan, onClose, isOpen }) {
  const scannerId = useRef("qr-scanner-container");
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !scannerId.current) return;

    setScanning(true);
    setError(null);

    const scanner = new Html5QrcodeScanner(
      scannerId.current,
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Extract event_id from QR data (assumes format: event_id or URL containing id)
        const match = decodedText.match(/event[_-]?id[=:]?([a-zA-Z0-9]+)|([a-zA-Z0-9]+)$/);
        const eventId = match ? (match[1] || match[2]) : decodedText;
        
        scanner.clear();
        setScanning(false);
        onScan(eventId);
      },
      (error) => {
        if (error && error.type !== "AbortError") {
          setError("Erro ao ler QR Code");
          setScanning(false);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-5 animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-bold text-lg" style={{ color: "#071D33" }}>
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} style={{ color: "#6B7280" }} />
          </button>
        </div>

        {/* Scanner */}
        <div 
          id={scannerId.current}
          className="rounded-2xl overflow-hidden"
          style={{ 
            background: "#000",
            aspectRatio: "1/1",
            minHeight: 300,
          }}
        />

        {error && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(180,35,24,0.1)" }}>
            <p className="font-inter text-sm" style={{ color: "#B42318" }}>
              {error}
            </p>
          </div>
        )}

        {scanning && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Loader size={16} className="animate-spin" style={{ color: "#B8872A" }} />
            <span className="font-inter text-sm" style={{ color: "#6B7280" }}>
              Apontar câmera para o QR Code...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}