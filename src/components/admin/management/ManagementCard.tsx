
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

interface ManagementCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"] | "success";
  customActions?: ReactNode;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon: Icon,
  buttonText,
  onClick,
  disabled = false,
  variant = "default",
  customActions,
}) => {
  // Map custom variants to button variants
  const buttonVariant = variant === "success" ? "default" : variant;
  
  // Style for success button
  const buttonStyle = 
    variant === "success" 
      ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
      : "";
  
  return (
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full border p-2 max-w-fit">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-xl tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={onClick}
            disabled={disabled}
            variant={buttonVariant as VariantProps<typeof buttonVariants>["variant"]}
            className={`w-full ${buttonStyle}`}
          >
            {buttonText}
          </Button>
          {customActions && (
            <div className="flex items-center gap-2 justify-end ml-2">
              {customActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementCard;
