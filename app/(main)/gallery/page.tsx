"use client";

import { useMemo, useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";
import { useGallery } from "@/app/hooks/gallery/useGallery";

const INITIAL_ARTWORK_LIMIT = 50;
const ARTWORK_INCREMENT = 50;

export default function GalleryPage() {
  const [visibleArtworkCount, setVisibleArtworkCount] =
    useState<number>(INITIAL_ARTWORK_LIMIT);

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

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleArtworkCount);
  }, [filteredItems, visibleArtworkCount]);

  const hasMoreArtworks = visibleArtworkCount < filteredItems.length;

  const handleShowMore = (): void => {
    setVisibleArtworkCount((prevCount) => prevCount + ARTWORK_INCREMENT);
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setVisibleArtworkCount(INITIAL_ARTWORK_LIMIT);
  };

  return (
    <MainLayout>
      <div className="mb-4 ml-8 mr-8 mt-6 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gallery</h2>
          <p className="mt-1 text-[#5a4636]">
            Explore the latest artworks from the community.
          </p>
        </div>

        <SearchBar value={search} onChange={handleSearchChange} />
      </div>

      <section className="ml-4 mr-4 flex-1 p-4">
        {isLoading ? (
          <GallerySkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : (
          <>
            <GalleryGrid items={visibleItems} onSelect={setSelectedArt} />

            {hasMoreArtworks && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="rounded-xl bg-[#3e2c23] px-5 py-2.5 text-sm font-semibold text-[#f5efe6] transition hover:bg-[#5a4636]"
                >
                  Show More
                </button>
              </div>
            )}
          </>
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

function GallerySkeleton() {
  const skeletonHeights = [
    "h-36",
    "h-52",
    "h-40",
    "h-32",
    "h-48",
    "h-36",
    "h-56",
    "h-40",
    "h-32",
    "h-48",
  ];

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-5">
      {skeletonHeights.map((height, index) => (
        <div
          key={`gallery-skeleton-${index}`}
          className="mb-6 break-inside-avoid overflow-hidden rounded-lg border border-[#eee5da] bg-[#fbf8f4] shadow-sm"
        >
          <div
            className={`${height} animate-pulse bg-gradient-to-r from-[#f2ebe2] via-[#e8ded2] to-[#f2ebe2] bg-[length:200%_100%]`}
          />

          <div className="space-y-2 bg-[#fbf8f4] p-3">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-gradient-to-r from-[#f3ece3] via-[#e7dcd0] to-[#f3ece3] bg-[length:200%_100%]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gradient-to-r from-[#f5efe8] via-[#ebe1d6] to-[#f5efe8] bg-[length:200%_100%]" />
          </div>
        </div>
      ))}
    </div>
  );
}