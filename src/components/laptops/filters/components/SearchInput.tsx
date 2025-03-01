
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white"
      />
    </div>
  );
}
