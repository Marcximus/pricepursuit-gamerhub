
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type SearchFormProps = {
  onSearch: (asin: string) => void;
};

export function SearchForm({ onSearch }: SearchFormProps) {
  const [asin, setAsin] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an Amazon ASIN",
      });
      return;
    }
    onSearch(asin);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={asin}
          onChange={(e) => setAsin(e.target.value)}
          placeholder="Enter Amazon ASIN"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}
