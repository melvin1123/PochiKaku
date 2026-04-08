"use client";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ placeholder = "Search artworks..." }) {
  return (
    <div className="relative w-80">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a4636]" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#5a4636] bg-[#e8dfd3] focus:outline-none"
      />
    </div>
  );
}