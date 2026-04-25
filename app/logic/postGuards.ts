import type { PostItem, PostsResponse } from "@/app/types/post";
import type { CurrentUser } from "@/app/types/user";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCurrentUser(value: unknown): value is CurrentUser {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.username === "string"
  );
}

export function isPostItem(value: unknown): value is PostItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    (typeof value.description === "string" ||
      value.description === null ||
      value.description === undefined) &&
    typeof value.image === "string" &&
    typeof value.artist === "string" &&
    typeof value.artistId === "string" &&
    typeof value.avatar === "string" &&
    typeof value.time === "string" &&
    typeof value.likes === "number" &&
    typeof value.comments === "number" &&
    (value.userId === undefined || typeof value.userId === "string") &&
    (value.createdAt === undefined || typeof value.createdAt === "string")
  );
}

export function parsePostsResponse(data: unknown): PostsResponse {
  if (!isRecord(data)) {
    return {
      currentUser: undefined,
      recentUploads: [],
      posts: [],
      error: "Invalid API response.",
    };
  }

  return {
    currentUser: isCurrentUser(data.currentUser) ? data.currentUser : undefined,
    recentUploads: Array.isArray(data.recentUploads)
      ? data.recentUploads.filter(isPostItem)
      : [],
    posts: Array.isArray(data.posts) ? data.posts.filter(isPostItem) : [],
    error: typeof data.error === "string" ? data.error : undefined,
  };
}