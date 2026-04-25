import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/app/logic/apiError";
import {
  filterGalleryItems,
  getMoreArtworksByArtist,
  parseGalleryItems,
} from "@/app/logic/galleryGuards";
import type { GalleryItem } from "@/app/types/gallery";

type UseGalleryReturn = {
  galleryItems: GalleryItem[];
  filteredItems: GalleryItem[];
  selectedArt: GalleryItem | null;
  moreArtworks: GalleryItem[];
  search: string;
  isLoading: boolean;
  error: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setSelectedArt: React.Dispatch<React.SetStateAction<GalleryItem | null>>;
  refetchGalleryItems: () => Promise<void>;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`API did not return JSON. Status: ${res.status}`);
  }
}

export function useGallery(): UseGalleryReturn {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedArt, setSelectedArt] = useState<GalleryItem | null>(null);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchGalleryItems = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/gallery", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const rawData = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(rawData, "Failed to fetch gallery items."),
        );
      }

      setGalleryItems(parseGalleryItems(rawData));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      console.error("Fetch gallery error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGalleryItems();
  }, [fetchGalleryItems]);

  const filteredItems = useMemo(
    () => filterGalleryItems(galleryItems, search),
    [galleryItems, search],
  );

  const moreArtworks = useMemo(
    () => getMoreArtworksByArtist(galleryItems, selectedArt),
    [galleryItems, selectedArt],
  );

  return {
    galleryItems,
    filteredItems,
    selectedArt,
    moreArtworks,
    search,
    isLoading,
    error,
    setSearch,
    setSelectedArt,
    refetchGalleryItems: fetchGalleryItems,
  };
}