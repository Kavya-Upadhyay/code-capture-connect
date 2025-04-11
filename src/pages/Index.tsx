
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRScanner from "@/components/QRScanner";
import QRUploader from "@/components/QRUploader";
import UserInfoCard from "@/components/UserInfoCard";
import StatusAlert from "@/components/StatusAlert";
import BulkImport from "@/components/BulkImport";
import { toast } from "sonner";
import { UserInfo } from "@/types/userInfo";
import { checkStudentExists, markStudentPresent } from "@/services/studentService";

const Index = () => {
  const [scanning, setScanning] = useState(false);
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
    details: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (data: string | null) => {
    if (data) {
      try {
        setIsProcessing(true);
        // Parse the QR code data and set it to the state
        import("@/utils/parseQRData").then(async ({ parseQRData }) => {
          const parsedData = parseQRData(data);
          setUserData(parsedData);
          setScanning(false);
          toast.success("QR code scanned successfully!");
          
          // Check if student exists in database
          const checkResult = await checkStudentExists(parsedData);
          
          if (checkResult.exists) {
            // Student found in database, mark as present
            const markResult = await markStudentPresent(parsedData.rollNumber);
            
            if (markResult.success) {
              setStatus({
                type: "success",
                message: "Valid Student!",
                details: `${parsedData.name} (${parsedData.rollNumber}) has been marked present.`
              });
              toast.success("Student marked as present!");
            } else {
              setStatus({
                type: "error",
                message: "Database Error",
                details: markResult.error || "Failed to mark student as present"
              });
              toast.error("Failed to mark student as present");
            }
          } else {
            // Student not found in database
            setStatus({
              type: "error",
              message: "Invalid Student!",
              details: checkResult.error || "Student not found in database"
            });
            toast.error("Student not found in database");
          }
          setIsProcessing(false);
        });
      } catch (error) {
        console.error("Error parsing QR data:", error);
        toast.error("Failed to parse QR code data. Please try again.");
        setIsProcessing(false);
      }
    }
  };

  const handleError = (err: Error) => {
    console.error(err);
    toast.error("Failed to access camera. Please check permissions.");
    setIsProcessing(false);
  };

  const handleSaveToDatabase = async () => {
    if (!userData) return;

    try {
      // Here we use dynamic import to avoid issues if Supabase isn't configured yet
      const { saveUserToSupabase } = await import("@/services/supabaseService");
      await saveUserToSupabase(userData);
      toast.success("User data saved to Supabase!");
      setUserData(null); // Reset after saving
      setStatus(null);
    } catch (error) {
      console.error("Failed to save data:", error);
      toast.error("Failed to save data to Supabase. Please connect Supabase first.");
    }
  };

  const resetScan = () => {
    setUserData(null);
    setStatus(null);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold">QR Code Scanner</CardTitle>
            <CardDescription className="text-blue-100">
              Scan QR codes and validate student information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {status && (
              <div className="mb-6">
                <StatusAlert 
                  type={status.type} 
                  title={status.message} 
                  description={status.details}
                />
              </div>
            )}
            
            {!scanning && !userData ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-medium text-gray-800">Ready to Scan</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Scan a QR code containing student information or upload a QR code image.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => setScanning(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                  >
                    Start Scanning
                  </Button>
                  <QRUploader 
                    onScan={handleScan} 
                    onError={handleError} 
                  />
                </div>
                <BulkImport />
              </div>
            ) : scanning ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden shadow-inner border-2 border-blue-300">
                  <QRScanner 
                    onScan={handleScan} 
                    onError={handleError} 
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setScanning(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            ) : userData ? (
              <div className="space-y-6">
                <UserInfoCard userData={userData} />
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={resetScan}
                    disabled={isProcessing}
                  >
                    Scan Another
                  </Button>
                  <Button 
                    onClick={handleSaveToDatabase}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                  >
                    Save to Database
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
