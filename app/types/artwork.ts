export type Artwork = {
  id: string;
  title: string;
  imageUrl: string;
  likes: number;
  comments: number;
  time?: string;
  createdAt?: string;
  artist: string;
  artistId: string;
  avatar: string;
  description?: string | null;
};