
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ManagementCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  onClick: () => Promise<void>;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon: Icon,
  buttonText,
  onClick,
  variant = "outline",
  disabled = false
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Button
        onClick={onClick}
        variant={variant}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Icon className="h-4 w-4" />
        {buttonText}
      </Button>
    </div>
  );
};

export default ManagementCard;
