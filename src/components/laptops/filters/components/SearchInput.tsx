
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
};

export function SearchInput({ placeholder, value, onChange, onClear }: SearchInputProps) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-9 h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white rounded-md"
      />
      {value && onClear && (
        <button 
          onClick={onClear}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
