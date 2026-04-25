import type { CommentItem } from "./comment";

export type EventSubmissionUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

export type EventSubmissionPost = {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  comments: CommentItem[];
};

export type EventSubmission = {
  id: string;
  caption: string | null;
  createdAt: string;
  user: EventSubmissionUser;
  post: EventSubmissionPost;
};

export type SubmitEventResponse = {
  submission?: EventSubmission;
  error?: string;
};