"use client";

import { FaHeart } from "react-icons/fa";

type ArtCardProps = {
  title: string;
  artist: string;
  img: string;
  onClick?: () => void;
};

export default function ArtCard({
  title,
  artist,
  img,
  onClick,
}: ArtCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-lg bg-[#e8dfd3] shadow transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-default"
      aria-label={`View ${title} by ${artist}`}
    >
      <img
        src={img}
        alt={title}
        className="h-auto w-full object-cover"
      />

      <div className="absolute right-2 top-2 rounded-full bg-white/80 p-2">
        <FaHeart className="text-[#5a4636]" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
        <span className="font-semibold text-white">View</span>
      </div>
    </button>
  );
}