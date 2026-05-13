import { CommentItem } from "@/app/types/comment";

// Ensure 'export' is here!
export interface NestedComment extends CommentItem {
  replies: NestedComment[];
  parentUsername?: string;
}

export function nestComments(allComments: CommentItem[]): NestedComment[] {
  const map: Record<string, NestedComment> = {};
  const roots: NestedComment[] = [];

  allComments.forEach((comment) => {
    map[String(comment.id)] = { ...comment, replies: [] };
  });

  allComments.forEach((comment) => {
    const nested = map[String(comment.id)];
    if (!nested) return;

    if (comment.parentId) {
      const parent = map[String(comment.parentId)];
      if (parent) {
        nested.parentUsername = parent.user.username;
        parent.replies.push(nested);
      } else {
        roots.push(nested);
      }
    } else {
      roots.push(nested);
    }
  });

  return roots;
}