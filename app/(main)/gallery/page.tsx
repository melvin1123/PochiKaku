"use client";
import { useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";

const galleryItems = [
  { id: 1, title: "Forest Dream", artist: "Alice", img: "/featured/forest-dream.jpg" },
  { id: 2, title: "Golden Hour", artist: "Bob", img: "/featured/golden-hour.jpg" },
  { id: 3, title: "Lost City", artist: "Cara", img: "/featured/lost-city.jpg" },
  { id: 4, title: "Ocean Light", artist: "Diana", img: "/featured/ocean-light.jpg" },
  { id: 5, title: "Sketch Vibes", artist: "Evan", img: "/featured/sketch-vibes.jpg" },
  { id: 6, title: "Waiting", artist: "Janmeru", img: "/featured/waiting.png" },
  { id: 7, title: "HKS Character", artist: "Void", img: "/featured/download.jpg" },
  { id: 8, title: "HKS Character", artist: "Void", img: "/featured/download (5).jpg" },
  { id: 9, title: "Changli", artist: "John", img: "/featured/changli.jpg" },
  { id: 10, title: "Reverse 99", artist: "Bob", img: "/featured/download (6).jpg" },
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
