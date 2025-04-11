
import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef<boolean>(false);
  
  useEffect(() => {
    const qrScannerId = "qr-reader";
    const qrContainer = document.getElementById(qrScannerId);
    
    if (!qrContainer) return;
    
    // Initialize scanner
    try {
      scannerRef.current = new Html5Qrcode(qrScannerId);
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Start scanning
      scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          // Only attempt to stop if we're actually scanning
          if (scannerRef.current && isScanning.current) {
            try {
              scannerRef.current.stop()
                .then(() => {
                  console.log("Scanner stopped successfully");
                  isScanning.current = false;
                })
                .catch(err => {
                  console.error("Failed to stop scanner:", err);
                });
            } catch (err) {
              console.error("Error stopping scanner:", err);
            }
          }
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      )
      .then(() => {
        setIsLoading(false);
        isScanning.current = true;
      })
      .catch((err) => {
        setIsLoading(false);
        onError(err instanceof Error ? err : new Error(String(err)));
      });
    } catch (error) {
      console.error("Error initializing scanner:", error);
      setIsLoading(false);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
    
    // Cleanup function
    return () => {
      if (scannerRef.current && isScanning.current) {
        try {
          scannerRef.current.stop()
            .then(() => {
              console.log("Scanner cleanup successful");
              isScanning.current = false;
            })
            .catch(err => {
              console.error("Failed to stop scanner on cleanup:", err);
            });
        } catch (err) {
          console.error("Error stopping scanner on cleanup:", err);
        }
      }
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
