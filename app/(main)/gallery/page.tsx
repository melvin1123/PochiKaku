"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid, {
  GalleryItem,
} from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedArt, setSelectedArt] = useState<GalleryItem | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/gallery", {
        method: "GET",
        cache: "no-store",
      });

      const text = await res.text();

      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as any).error === "string"
            ? (data as any).error
            : "Failed to fetch gallery items."
        );
      }

      if (Array.isArray(data)) {
        setGalleryItems(data as GalleryItem[]);
      } else {
        setGalleryItems([]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      console.error("Fetch gallery error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return galleryItems;

    return galleryItems.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.artist?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
      );
    });
  }, [galleryItems, search]);

  // ✅ SAFE more artworks computation
  const moreArtworks = useMemo(() => {
    if (!selectedArt) return [];

    return galleryItems
      .filter(
        (a) =>
          a.artistId === selectedArt.artistId &&
          a.id !== selectedArt.id
      )
      .slice(0, 6);
  }, [galleryItems, selectedArt]);

  return (
    <MainLayout>
      <div className="mb-4 ml-8 mt-6 mr-8 flex items-end justify-between">
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
          <GalleryGrid
            items={filteredItems}
            onSelect={setSelectedArt}
          />
        )}
      </section>

      <ArtModal
        art={selectedArt}
        onClose={() => setSelectedArt(null)}
        onChangeArt={(art) => setSelectedArt(art)}
        moreArtworks={moreArtworks}
      />
    </MainLayout>
  );
}