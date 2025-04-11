
import React, { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const qrScannerId = "qr-reader";
    const qrContainer = document.getElementById(qrScannerId);
    
    if (!qrContainer) return;
    
    const html5QrCode = new Html5Qrcode(qrScannerId);
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        onScan(decodedText);
        html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err));
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    )
    .then(() => {
      setIsLoading(false);
    })
    .catch((err) => {
      setIsLoading(false);
      onError(err);
    });
    
    return () => {
      html5QrCode.stop().catch(err => console.error("Failed to stop scanner on cleanup:", err));
    };
  }, [onScan, onError]);
  
  return (
    <div className="w-full h-full relative">
      <div id="qr-reader" className="w-full h-full"></div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      )}
    </div>
  );
};

export default QRScanner;
