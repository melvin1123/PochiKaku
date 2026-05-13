export interface User {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null; 
  user: User;
}

export interface NestedComment extends CommentItem {
  replies: NestedComment[];
  parentUsername?: string;
}