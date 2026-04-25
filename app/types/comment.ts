export type CommentUser = {
  id: string;
  username: string;
  avatarUrl: string;
};

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
};