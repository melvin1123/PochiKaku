"use client";
import Masonry from "react-masonry-css";
import ArtCard from "./ArtCard";

const breakpointColumnsObj = {
  default: 5,
  1024: 3,
  768: 2,
  640: 1,
};

export default function GalleryGrid({ items, onSelect }: GalleryGridProps) {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex gap-6"
      columnClassName="space-y-6"
    >
      {items.map((art) => (
        <ArtCard
          key={art.id}
          title={art.title}
          artist={art.artist}
          img={art.img}
          onClick={() => onSelect?.(art)}
        />
      ))}
    </Masonry>
  );
}
