"use client";

import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";
import { useGallery } from "@/app/hooks/gallery/useGallery";

export default function GalleryPage() {
  const {
    filteredItems,
    selectedArt,
    moreArtworks,
    search,
    isLoading,
    error,
    setSearch,
    setSelectedArt,
  } = useGallery();

  return (
    <MainLayout>
      <div className="mb-4 ml-8 mr-8 mt-6 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gallery</h2>
          <p className="mt-1 text-[#5a4636]">
            Explore the latest artworks from the community.
          </p>
        </div>

        <SearchBar value={search} onChange={setSearch} />
      </div>

      <section className="ml-4 mr-4 flex-1 p-4">
        {isLoading ? (
          <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
            Loading gallery...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : (
          <GalleryGrid items={filteredItems} onSelect={setSelectedArt} />
        )}
      </section>

      <ArtModal
        art={selectedArt}
        onClose={() => setSelectedArt(null)}
        onChangeArt={setSelectedArt}
        moreArtworks={moreArtworks}
      />
    </MainLayout>
  );
}