import type { GalleryItem } from "@/app/types/gallery";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isGalleryItem(value: unknown): value is GalleryItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.image === "string" &&
    typeof value.artist === "string" &&
    typeof value.artistId === "string" &&
    typeof value.avatar === "string" &&
    (typeof value.description === "string" ||
      value.description === null ||
      value.description === undefined) &&
    typeof value.likes === "number" &&
    typeof value.comments === "number" &&
    (value.time === undefined || typeof value.time === "string") &&
    (value.createdAt === undefined || typeof value.createdAt === "string")
  );
}

export function parseGalleryItems(data: unknown): GalleryItem[] {
  if (!Array.isArray(data)) return [];

  return data.filter(isGalleryItem);
}

export function filterGalleryItems(
  items: GalleryItem[],
  search: string,
): GalleryItem[] {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return items;

  return items.filter((item) => {
    const description = item.description ?? "";

    return (
      item.title.toLowerCase().includes(keyword) ||
      item.artist.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
    );
  });
}

export function getMoreArtworksByArtist(
  items: GalleryItem[],
  selectedArt: GalleryItem | null,
): GalleryItem[] {
  if (!selectedArt) return [];

  return items
    .filter(
      (item) =>
        item.artistId === selectedArt.artistId && item.id !== selectedArt.id,
    )
    .slice(0, 6);
}