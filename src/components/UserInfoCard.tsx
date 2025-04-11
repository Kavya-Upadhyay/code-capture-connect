
import React from "react";
import { UserInfo } from "@/types/userInfo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserInfoCardProps {
  userData: UserInfo;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ userData }) => {
  return (
    <Card className="w-full border border-blue-100 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-center mb-4">{userData.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <InfoItem label="Roll Number" value={userData.rollNumber} />
            <InfoItem label="Personal Email" value={userData.personalEmail} />
            <InfoItem label="College Email" value={userData.collegeEmail} />
            <InfoItem label="Phone" value={userData.phone} />
          </div>
          
          <div className="space-y-2">
            <InfoItem label="Address" value={userData.address} />
            <InfoItem label="Branch" value={userData.branch} />
            <InfoItem label="Year" value={userData.year} />
            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-gray-700">Hosteller:</span>
              <Badge variant={userData.isHosteller ? "default" : "outline"} 
                className={userData.isHosteller ? "bg-green-500 hover:bg-green-600" : ""}>
                {userData.isHosteller ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col py-1">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

export default UserInfoCard;
