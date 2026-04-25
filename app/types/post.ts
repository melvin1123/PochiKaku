import type { CurrentUser } from "./user";
import type { CommentItem } from "./comment";

export type PostItem = {
  id: string;
  title: string;
  description?: string | null;
  image: string;
  artist: string;
  artistId: string;
  avatar: string;
  time: string;
  likes: number;
  comments: number;
  userId?: string;
  createdAt?: string;
  isFollowed?: boolean;
  isLiked?: boolean;
  commentsPreview?: CommentItem[];
};

export type Post = PostItem;

export type PostsResponse = {
  currentUser?: CurrentUser;
  recentUploads?: PostItem[];
  posts?: PostItem[];
  error?: string;
};