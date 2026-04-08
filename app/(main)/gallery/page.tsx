"use client";
import { useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";

const galleryItems = [
  { id: 1, title: "Sunset Dreams", artist: "Alice", img: "/art1.jpg" },
  { id: 2, title: "City Vibes", artist: "Bob", img: "/art2.jpg" },
  { id: 3, title: "Mystic Forest", artist: "Cara", img: "/art3.jpg" },
  { id: 4, title: "Ocean Waves", artist: "Diana", img: "/art4.jpg" },
  { id: 5, title: "Night Sky", artist: "Evan", img: "/art5.jpg" },
];

export default function GalleryPage() {
  const [selectedArt, setSelectedArt] = useState(null);

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-end ml-8 mr-8 mb-4">
        <div>
          <h2 className="text-3xl font-bold">Gallery</h2>
          <p className="text-[#5a4636] mt-1">
            Explore the latest artworks from the community.
          </p>
        </div>
        <SearchBar />
      </div>

      {/* Gallery Grid */}
      <section className="p-4 ml-4 mr-4 flex-1">
        <GalleryGrid items={galleryItems} onSelect={setSelectedArt} />
      </section>

      {/* Modal */}
      <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} />
    </MainLayout>
  );
}