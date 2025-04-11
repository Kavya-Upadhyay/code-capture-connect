
import { UserInfo } from "@/types/userInfo";

export const parseQRData = (data: string): UserInfo => {
  // Split the QR data by the pipe symbol
  const parts = data.split(" | ");
  
  if (parts.length < 9) {
    throw new Error("Invalid QR code format");
  }
  
  return {
    name: parts[0] || "",
    rollNumber: parts[1] || "",
    personalEmail: parts[2] || "",
    collegeEmail: parts[3] || "",
    phone: parts[4] || "",
    address: parts[5] || "",
    branch: parts[6] || "",
    year: parts[7] || "",
    isHosteller: parts[8] === "true",
  };
};
