
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { updateM2Products } from "@/scripts/updateM2Products";
import { Loader2 } from "lucide-react";

export const UpdateM2Products = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateM2Products();
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-2">Update M2 MacBook Processors</h3>
      <p className="text-sm text-gray-600 mb-4">
        Update ASINs B0CN2DBKS7 and B0CB74GC69 to have "Apple M2 Chip" as their processor value.
      </p>
      <Button
        onClick={handleUpdate}
        disabled={isUpdating}
        variant="default"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update MacBooks"
        )}
      </Button>
    </div>
  );
};
