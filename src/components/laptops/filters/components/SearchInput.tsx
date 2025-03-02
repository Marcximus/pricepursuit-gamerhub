
import React from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function SearchInput({ placeholder, value, onChange, onClear }: SearchInputProps) {
  return (
    <div className="relative mb-3">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-3 pr-8 py-1.5 h-9 text-sm bg-white border-slate-200"
      />
      {value && (
        <button 
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
