"use client";

import { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import SearchBar from "@/components/main-components/gallery/SearchBar";
import GalleryGrid from "@/components/main-components/gallery/GalleryGrid";
import ArtModal from "@/components/main-components/gallery/ArtModal";
import { GalleryItem } from "@/components/main-components/gallery/GalleryGrid";


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

      let data: GalleryItem[] | { error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(
          !Array.isArray(data) && data?.error
            ? data.error
            : "Failed to fetch gallery items."
        );
      }

      setGalleryItems(Array.isArray(data) ? data : []);
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
        item.title.toLowerCase().includes(keyword) ||
        item.artist.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      );
    });
  }, [galleryItems, search]);

  return (
    <MainLayout>
      <div className="mb-4 ml-8 mr-8 flex items-end justify-between">
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

      <ArtModal art={selectedArt} onClose={() => setSelectedArt(null)} />
    </MainLayout>
  );
}