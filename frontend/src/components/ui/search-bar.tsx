// frontend/src/components/ui/search-bar.tsx
import { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search..." }: SearchBarProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-spotify-medium-gray text-spotify-off-white rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-spotify-light-gray hover:text-spotify-off-white"
        >
          ✕
        </button>
      )}
    </div>
  );
};