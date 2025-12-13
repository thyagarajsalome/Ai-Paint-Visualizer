import React from 'react';
import { COLORS } from '../constants';
import type { PaintColor } from '../types';

interface ColorPaletteProps {
  selectedColor: PaintColor | null;
  onColorSelect: (color: PaintColor) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onColorSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">2. Select a Color</h3>
      <div className="max-h-[40vh] overflow-y-auto grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2 p-1 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700">
        {COLORS.map((color) => (
          <div key={color.name} className="flex flex-col items-center">
            <button
              onClick={() => onColorSelect(color)}
              className={`w-10 h-10 rounded-md border-2 transition-transform duration-200 hover:scale-110 focus:outline-none ${
                selectedColor?.hex === color.hex ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select color ${color.name}`}
            />
            <span className="text-[10px] text-center mt-1.5 text-gray-500 dark:text-gray-400">{color.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};