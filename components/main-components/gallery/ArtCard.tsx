"use client";
import { FaHeart } from "react-icons/fa";

interface ArtCardProps {
  title: string;
  artist: string;
  img: string;
  onClick?: () => void;
}

export default function ArtCard({ title, artist, img, onClick }: ArtCardProps) {
  return (
    <div
      className="group relative bg-[#e8dfd3] rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer transition transform hover:scale-105"
      onClick={onClick}
    >
      <img src={img} alt={title} className="object-cover" />

      {/* Heart Icon */}
      <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-full">
        <FaHeart className="text-[#5a4636]" />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
        <span className="text-white font-semibold">View</span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-[#5a4636]">by {artist}</p>
      </div>
    </div>
  );
}
