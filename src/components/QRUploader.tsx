
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { processQRCodeImage } from "@/services/qrUploadService";
import { toast } from "sonner";

interface QRUploaderProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
}

const QRUploader: React.FC<QRUploaderProps> = ({ onScan, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const qrData = await processQRCodeImage(file);
      onScan(qrData);
      toast.success("QR code from image processed successfully!");
    } catch (error) {
      console.error("Error processing QR code image:", error);
      onError(error instanceof Error ? error : new Error(String(error)));
      toast.error("Failed to process QR code from image. Please try another image.");
    } finally {
      setIsUploading(false);
      // Reset the file input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        <Upload size={16} />
        {isUploading ? "Processing..." : "Upload QR Code"}
      </Button>
      {/* Hidden element for html5-qrcode library to use */}
      <div id="qr-reader-hidden" className="hidden"></div>
    </div>
  );
};

export default QRUploader;
