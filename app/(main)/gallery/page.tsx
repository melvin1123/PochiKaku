"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";
import { useGallery } from "@/app/hooks/gallery/useGallery";

const INITIAL_ARTWORK_LIMIT = 50;
const ARTWORK_INCREMENT = 50;

export default function GalleryPage() {
  const [visibleArtworkCount, setVisibleArtworkCount] = useState<number>(INITIAL_ARTWORK_LIMIT);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // State to track visibility and random positioning
  const [gifConfig, setGifConfig] = useState({
    visible: false,
    top: "50%",
    left: "50%",
    currentGif: "/dog-twerk.gif",
  });
  
  // Mechanical switch to guarantee perfect alternation without state dependency lag
  const isDogDanceTurn = useRef<boolean>(false);
  
  // Use a ref to persist the audio object across renders
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio("/disco.mp3");
    audioRef.current.loop = true;

    // Clean up and pause music if the user navigates away
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Effect to handle alternating random pop-ups (1.5s display, 1s delay)
  useEffect(() => {
    if (!isPlaying) {
      setGifConfig((prev) => ({ ...prev, visible: false }));
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const cycleRandomGif = () => {
      // Determine the next GIF using the mutable ref toggle
      const nextGif = isDogDanceTurn.current ? "/dog-dance.gif" : "/dog-twerk.gif";
      
      // Flip the switch for the next iteration
      isDogDanceTurn.current = !isDogDanceTurn.current;
      
      // Generate random viewport coordinates (safely constrained between 10% and 70%)
      const randomTop = Math.floor(Math.random() * 60) + 10;
      const randomLeft = Math.floor(Math.random() * 60) + 10;

      setGifConfig({
        visible: true,
        top: `${randomTop}%`,
        left: `${randomLeft}%`,
        currentGif: nextGif,
      });

      // Hide the GIF after exactly 1.5 seconds (Display Time)
      timeoutId = setTimeout(() => {
        setGifConfig((prev) => ({ ...prev, visible: false }));
        
        // Wait for exactly 1 second (Delay Time) before spawning the next alternating GIF
        timeoutId = setTimeout(cycleRandomGif, 1000);
      }, 1500);
    };

    // Kick off the loop
    cycleRandomGif();

    // Clean up timers on pause or unmount
    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  // Toggle play/pause state
  const toggleMusic = (): void => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed, browser may be blocking autoplay:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

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
      {/* Alternating Random Pop-up GIF Container */}
      {isPlaying && gifConfig.visible && (
        <div
          className="pointer-events-none fixed z-50 transition-opacity duration-200"
          style={{ top: gifConfig.top, left: gifConfig.left }}
        >
          <img
            src={gifConfig.currentGif}
            alt="Dancing Dog"
            className="h-[170px] w-[200px] md:h-[295px] md:w-[345px] rounded-xl object-cover shadow-2xl drop-shadow-xl"
          />
        </div>
      )}

      {/* Header Section: Stacked on mobile, side-by-side on md+ */}
      <div className="mx-4 mb-4 mt-6 flex flex-col gap-4 md:mx-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold md:text-3xl">Gallery</h2>
            
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleMusic}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3e2c23] text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
              title={isPlaying ? "Mute Music" : "Play Music"}
            >
              {isPlaying ? "⏸️" : "🎵"}
            </button>
          </div>
          <p className="mt-1 text-sm text-[#5a4636] md:text-base">
            Explore the latest artworks from the community.
          </p>
        </div>

        {/* SearchBar will now appear below the text on mobile */}
        <div className="w-full md:w-auto">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
      </div>

      <section className="flex-1 px-2 md:px-8">
        {isLoading ? (
          <GallerySkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : (
          <>
            <GalleryGrid 
              items={visibleItems} 
              onSelect={setSelectedArt} 
              isPlaying={isPlaying} 
            />

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
    <div className="columns-3 gap-2 sm:gap-6 lg:columns-4 xl:columns-5">
      {skeletonHeights.map((height, index) => (
        <div
          key={`gallery-skeleton-${index}`}
          className="mb-2 break-inside-avoid overflow-hidden rounded-lg border border-[#eee5da] bg-[#fbf8f4] shadow-sm md:mb-6"
        >
          <div
            className={`${height} animate-pulse bg-gradient-to-r from-[#f2ebe2] via-[#e8ded2] to-[#f2ebe2] bg-[length:200%_100%]`}
          />

          <div className="hidden space-y-2 bg-[#fbf8f4] p-3 md:block">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#e7dcd0]" />
          </div>
        </div>
      ))}
    </div>
  );
}