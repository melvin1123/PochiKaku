"use client";

import type { ChangeEvent } from "react";
import { FaSearch } from "react-icons/fa"; // Import the icon

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search artworks or artists..."
        /* Added pr-10 (padding-right) to make room for the icon */
        className="w-full rounded-xl border border-[#d7cab9] bg-white px-4 pr-10 py-2 text-[#3e2c23] outline-none transition-colors focus:border-[#5a4636]"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <FaSearch className="h-4 w-4 text-[#8a6f5a]" />
      </div>
    </div>
  );
}