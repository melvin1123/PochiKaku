export type CommentUser = {
  id: string;
  username: string;
  avatarUrl: string;
};

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  parentId?: string | null; // Add the '?' here to make it optional
};