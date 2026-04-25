"use client";

import type { ChangeEvent } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Search artworks or artists..."
      className="w-full max-w-sm rounded-xl border border-[#d7cab9] bg-white px-4 py-2 text-[#3e2c23] outline-none focus:border-[#5a4636]"
    />
  );
}