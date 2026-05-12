import { CommentItem } from "../types/comment";

export interface NestedComment extends CommentItem {
  replies: NestedComment[];
  // NEW: Store the parent's username directly on the child for the Flat UI mention
  parentUsername?: string;
}

export function nestComments(flatComments: CommentItem[]): NestedComment[] {
  const map: Record<string, NestedComment> = {};
  const roots: NestedComment[] = [];

  // 1. First pass: Index everything into the map
  flatComments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });

  // 2. Second pass: Link children to parents
  flatComments.forEach((comment) => {
    const nestedComment = map[comment.id];
    if (!nestedComment) return;

    const pId = comment.parentId;

    if (!pId) {
      // TRUE ROOT: No parentId exists
      roots.push(nestedComment);
    } else if (map[pId]) {
      // VALID REPLY: Parent exists in the current map
      
      // NEW: Attach the parent's username to this comment for the "replying to @..." tag
      // We look it up in the map we just built
      nestedComment.parentUsername = map[pId].user?.username;

      map[pId].replies.push(nestedComment);
    } else {
      // ORPHAN: Prevent replies appearing at top-level if parent is missing
      console.warn(`Orphaned comment ${comment.id} hidden: parent ${pId} not found.`);
    }
  });

  return roots;
}