// src/components/ColorPalette.tsx
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants";
import type { PaintColor } from "../types";

interface ColorPaletteProps {
  selectedColor: PaintColor | null;
  onColorSelect: (color: PaintColor) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredColors = useMemo(() => {
    return COLORS.filter((color) =>
      color.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
          2. Select a Color
        </h3>
        <span className="text-xs text-gray-400">
          {filteredColors.length} colors found
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search color name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />
        <svg
          className="w-4 h-4 absolute right-3 top-2.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="max-h-[30vh] overflow-y-auto grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 custom-scrollbar">
        {filteredColors.map((color) => (
          <div key={color.name} className="flex flex-col items-center">
            <button
              onClick={() => onColorSelect(color)}
              title={color.name}
              className={`w-10 h-10 rounded-md border-2 transition-transform duration-200 hover:scale-110 focus:outline-none ${
                selectedColor?.hex === color.hex
                  ? "border-indigo-600 dark:border-indigo-400 ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select color ${color.name}`}
            />
            <span className="text-[10px] text-center mt-1 text-gray-500 dark:text-gray-400 truncate w-full px-1">
              {color.name}
            </span>
          </div>
        ))}
        {filteredColors.length === 0 && (
          <p className="col-span-full text-center py-4 text-sm text-gray-400">
            No matching colors.
          </p>
        )}
      </div>
    </div>
  );
};
