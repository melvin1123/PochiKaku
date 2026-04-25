import type { CommentItem } from "@/app/types/comment";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isFollowResponse(value: unknown): value is { isFollowed: boolean } {
  return isRecord(value) && typeof value.isFollowed === "boolean";
}

export function isLikeResponse(
  value: unknown,
): value is { isLiked: boolean; likes: number } {
  return (
    isRecord(value) &&
    typeof value.isLiked === "boolean" &&
    typeof value.likes === "number"
  );
}

export function isCommentItem(value: unknown): value is CommentItem {
  if (!isRecord(value)) return false;

  const user = value.user;

  return (
    typeof value.id === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    isRecord(user) &&
    typeof user.id === "string" &&
    typeof user.username === "string" &&
    typeof user.avatarUrl === "string"
  );
}

export function isCommentResponse(
  value: unknown,
): value is { comment: CommentItem; comments: number } {
  return (
    isRecord(value) &&
    isCommentItem(value.comment) &&
    typeof value.comments === "number"
  );
}