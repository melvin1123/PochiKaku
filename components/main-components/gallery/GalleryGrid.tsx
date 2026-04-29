"use client";

import Masonry from "react-masonry-css";
import ArtCard from "./ArtCard";
import type { GalleryItem } from "@/app/types/gallery";

type GalleryGridProps = {
  items?: GalleryItem[];
  onSelect?: (art: GalleryItem) => void;
};

// Adjusted for 3 columns on small screens
const BREAKPOINT_COLUMNS = {
  default: 5,
  1100: 4,
  768: 3, // Tablets and large phones get 3 columns
  500: 3, // Small mobile phones now get 3 columns
};

export default function GalleryGrid({
  items = [],
  onSelect,
}: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
        No artworks found.
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={BREAKPOINT_COLUMNS}
      /* Changed gap-6 to a responsive gap: smaller on mobile, larger on desktop */
      className="flex gap-2 md:gap-6"
      columnClassName="space-y-2 md:space-y-6"
    >
      {items.map((art) => (
        <ArtCard
          key={art.id}
          title={art.title}
          artist={art.artist}
          img={art.image}
          onClick={onSelect ? () => onSelect(art) : undefined}
        />
      ))}
    </Masonry>
  );
}