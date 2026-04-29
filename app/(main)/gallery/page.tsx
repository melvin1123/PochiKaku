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
  const [visibleArtworkCount, setVisibleArtworkCount] = useState<number>(INITIAL_ARTWORK_LIMIT);

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
      {/* Header Section: Stacked on mobile, side-by-side on md+ */}
      <div className="mx-4 mb-4 mt-6 flex flex-col gap-4 md:mx-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Gallery</h2>
          <p className="mt-1 text-sm text-[#5a4636] md:text-base">
            Explore the latest artworks from the community.
          </p>
        </div>

        {/* SearchBar will now appear below the text on mobile */}
        <div className="w-full md:w-auto">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
      </div>

      <section className="px-2 md:px-8 flex-1">
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
              <div className="mt-8 flex justify-center pb-10">
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
  const skeletonHeights = ["h-32", "h-40", "h-36", "h-48", "h-32", "h-40"];

  return (
    /* Changed columns-1 to columns-3 for mobile view */
    <div className="columns-3 gap-2 sm:gap-6 lg:columns-4 xl:columns-5">
      {skeletonHeights.map((height, index) => (
        <div
          key={`gallery-skeleton-${index}`}
          className="mb-2 break-inside-avoid overflow-hidden rounded-lg border border-[#eee5da] bg-[#fbf8f4] shadow-sm md:mb-6"
        >
          <div
            className={`${height} animate-pulse bg-gradient-to-r from-[#f2ebe2] via-[#e8ded2] to-[#f2ebe2] bg-[length:200%_100%]`}
          />

          {/* Hidden labels on mobile to keep 3 columns clean, visible on md+ */}
          <div className="hidden space-y-2 bg-[#fbf8f4] p-3 md:block">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#e7dcd0]" />
          </div>
        </div>
      ))}
    </div>
  );
}