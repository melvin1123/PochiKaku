import type { Artwork } from "@/app/types/artwork";
import type {
  FollowResponse,
  Profile,
  ProfileResponse,
  ProfileStats,
} from "@/app/types/profile";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isArtwork(value: unknown): value is Artwork {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.imageUrl === "string" &&
    typeof value.likes === "number" &&
    typeof value.comments === "number" &&
    (value.time === undefined || typeof value.time === "string") &&
    (value.createdAt === undefined || typeof value.createdAt === "string") &&
    typeof value.artist === "string" &&
    typeof value.artistId === "string" &&
    typeof value.avatar === "string" &&
    (typeof value.description === "string" ||
      value.description === null ||
      value.description === undefined)
  );
}

export function isProfile(value: unknown): value is Profile {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.username === "string" &&
    typeof value.email === "string" &&
    typeof value.avatarUrl === "string" &&
    (typeof value.bio === "string" ||
      value.bio === null ||
      value.bio === undefined) &&
    typeof value.isOwnProfile === "boolean" &&
    typeof value.isFollowed === "boolean"
  );
}

export function isProfileStats(value: unknown): value is ProfileStats {
  if (!isRecord(value)) return false;

  return (
    typeof value.posts === "number" &&
    typeof value.followers === "number" &&
    typeof value.following === "number"
  );
}

export function isFollowResponse(value: unknown): value is FollowResponse {
  if (!isRecord(value)) return false;

  return typeof value.isFollowed === "boolean";
}

export function parseProfileResponse(data: unknown): ProfileResponse {
  if (!isRecord(data)) {
    return {
      profile: undefined,
      stats: undefined,
      artworks: [],
      error: "Invalid API response.",
    };
  }

  return {
    profile: isProfile(data.profile) ? data.profile : undefined,
    stats: isProfileStats(data.stats) ? data.stats : undefined,
    artworks: Array.isArray(data.artworks)
      ? data.artworks.filter(isArtwork)
      : [],
    error: typeof data.error === "string" ? data.error : undefined,
  };
}