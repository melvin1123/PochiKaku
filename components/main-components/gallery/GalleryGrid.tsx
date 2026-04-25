"use client";

import Masonry from "react-masonry-css";
import ArtCard from "./ArtCard";
import type { GalleryItem } from "@/app/types/gallery";

type GalleryGridProps = {
  items?: GalleryItem[];
  onSelect?: (art: GalleryItem) => void;
};

const BREAKPOINT_COLUMNS = {
  default: 5,
  1024: 3,
  768: 2,
  640: 1,
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
      className="flex gap-6"
      columnClassName="space-y-6"
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