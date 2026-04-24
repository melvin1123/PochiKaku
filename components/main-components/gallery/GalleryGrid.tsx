"use client";

import { useMemo } from "react";
import Masonry from "react-masonry-css";
import ArtCard from "./ArtCard";

export type GalleryItem = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  avatar: string;
  img: string;
  description: string;
  createdAt: string;
  likes: number;
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatarUrl: string;
    };
  }[];
}; // ✅ THIS WAS MISSING

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
  const safeItems = useMemo(() => {
    return items.filter(
      (art): art is GalleryItem =>
        Boolean(
          art &&
            typeof art.id === "string" &&
            typeof art.img === "string"
        )
    );
  }, [items]);

  if (safeItems.length === 0) {
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
      {safeItems.map((art) => (
        <ArtCard
          key={art.id}
          title={art.title || "Untitled"}
          artist={art.artist || "Unknown"}
          img={art.img}
          onClick={onSelect ? () => onSelect(art) : undefined}
        />
      ))}
    </Masonry>
  );
}