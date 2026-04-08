"use client";
import ArtCard from "./ArtCard";

interface GalleryGridProps {
  items: { id: number; title: string; artist: string; img: string }[];
  onSelect?: (art: any) => void;
}

export default function GalleryGrid({ items, onSelect }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((art) => (
        <ArtCard
          key={art.id}
          title={art.title}
          artist={art.artist}
          img={art.img}
          onClick={() => onSelect?.(art)}
        />
      ))}
    </div>
  );
}