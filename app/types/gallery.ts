import type { CommentItem } from "./comment";

export type GalleryItem = {
  id: string;
  title: string;
  image: string;
  artist: string;
  artistId: string;
  avatar: string;
  description?: string | null;
  likes: number;
  comments: number;
  time?: string;
  createdAt?: string;
  isLiked?: boolean;
  commentsPreview?: CommentItem[];
};