
import { Html5Qrcode } from "html5-qrcode";
import { UserInfo } from "@/types/userInfo";

/**
 * Processes an uploaded QR code image and extracts data from it
 * @param file The uploaded image file containing a QR code
 * @returns Promise that resolves with the extracted QR code data
 */
export const processQRCodeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a unique element ID for this scan instance
    const scannerElementId = `qr-reader-hidden-${Date.now()}`;
    
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.id = scannerElementId;
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    const html5QrCode = new Html5Qrcode(scannerElementId);
    
    // Create a file URL that can be used by the QR code reader
    const fileUrl = URL.createObjectURL(file);
    
    // Attempt to decode the QR code from the image
    html5QrCode.scanFile(file, /* showImage */ false)
      .then(decodedText => {
        // Release the object URL when done to avoid memory leaks
        URL.revokeObjectURL(fileUrl);
        resolve(decodedText);
      })
      .catch(error => {
        // Release the object URL in case of error too
        URL.revokeObjectURL(fileUrl);
        reject(new Error(`Error scanning QR code: ${error}`));
      })
      .finally(() => {
        // Clean up the QR code scanner instance
        try {
          html5QrCode.clear();
        } catch (error) {
          console.error("Failed to clear html5QrCode", error);
        }
        
        // Remove the temporary element
        if (tempDiv && tempDiv.parentNode) {
          tempDiv.parentNode.removeChild(tempDiv);
        }
      });
  });
};
