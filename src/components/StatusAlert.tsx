
import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface StatusAlertProps {
  type: "success" | "error";
  title: string;
  description: string;
  className?: string;
}

const StatusAlert: React.FC<StatusAlertProps> = ({
  type,
  title,
  description,
  className
}) => {
  return (
    <Alert 
      className={cn(
        "border-2 animate-pulse transition-all duration-500",
        type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50",
        className
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-600" />
      )}
      <AlertTitle className={type === "success" ? "text-green-800" : "text-red-800"}>
        {title}
      </AlertTitle>
      <AlertDescription className={type === "success" ? "text-green-700" : "text-red-700"}>
        {description}
      </AlertDescription>
    </Alert>
  );
};

export default StatusAlert;
