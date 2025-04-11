
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRScanner from "@/components/QRScanner";
import QRUploader from "@/components/QRUploader";
import UserInfoCard from "@/components/UserInfoCard";
import { toast } from "sonner";
import { UserInfo } from "@/types/userInfo";

const Index = () => {
  const [scanning, setScanning] = useState(false);
  const [userData, setUserData] = useState<UserInfo | null>(null);

  const handleScan = (data: string | null) => {
    if (data) {
      try {
        // Parse the QR code data and set it to the state
        import("@/utils/parseQRData").then(({ parseQRData }) => {
          const parsedData = parseQRData(data);
          setUserData(parsedData);
          setScanning(false);
          toast.success("QR code scanned successfully!");
        });
      } catch (error) {
        console.error("Error parsing QR data:", error);
        toast.error("Failed to parse QR code data. Please try again.");
      }
    }
  };

  const handleError = (err: Error) => {
    console.error(err);
    toast.error("Failed to access camera. Please check permissions.");
  };

  const handleSaveToDatabase = async () => {
    if (!userData) return;

    try {
      // Here we use dynamic import to avoid issues if Supabase isn't configured yet
      const { saveUserToSupabase } = await import("@/services/supabaseService");
      await saveUserToSupabase(userData);
      toast.success("User data saved to Supabase!");
      setUserData(null); // Reset after saving
    } catch (error) {
      console.error("Failed to save data:", error);
      toast.error("Failed to save data to Supabase. Please connect Supabase first.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold">QR Code Scanner</CardTitle>
            <CardDescription className="text-blue-100">
              Scan QR codes and save information to your database
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!scanning && !userData ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-medium text-gray-800">Ready to Scan</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Scan a QR code containing user information or upload a QR code image.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => setScanning(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Scanning
                  </Button>
                  <QRUploader 
                    onScan={handleScan} 
                    onError={handleError} 
                  />
                </div>
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
                    onClick={() => {
                      setUserData(null);
                      setScanning(true);
                    }}
                  >
                    Scan Another
                  </Button>
                  <Button 
                    onClick={handleSaveToDatabase}
                    className="bg-blue-600 hover:bg-blue-700"
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
