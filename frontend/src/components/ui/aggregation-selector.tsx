// src/components/ui/aggregation-selector.tsx

import { useState } from "react";

export type AggregationLevel = "song" | "album" | "artist";

interface AggregationSelectorProps {
  value: AggregationLevel;
  onChange: (level: AggregationLevel) => void;
}

export const AggregationSelector = ({ value, onChange }: AggregationSelectorProps) => {
  const options: { value: AggregationLevel; label: string }[] = [
    { value: "song", label: "Songs" },
    { value: "album", label: "Albums" },
    { value: "artist", label: "Artists" }
  ];

  return (
    <div className="bg-spotify-dark-gray rounded-lg p-4 mb-6">
      <div className="mb-2 text-spotify-off-white font-medium">View Data By:</div>
      <div className="flex space-x-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 rounded-full transition-all duration-200
              ${value === option.value 
                ? "bg-spotify-green text-black font-medium" 
                : "border border-spotify-medium-gray text-spotify-off-white hover:bg-spotify-medium-gray"}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};