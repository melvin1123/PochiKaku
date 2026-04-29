import type { Artwork } from "./artwork";

export type Profile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  isOwnProfile: boolean;
  isFollowed: boolean;
};

export type ProfileStats = {
  posts: number;
  followers: number;
  following: number;
};

export type ProfileResponse = {
  profile?: Profile;
  stats?: ProfileStats;
  artworks?: Artwork[];
  error?: string;
};

export type FollowResponse = {
  isFollowed: boolean;
};

export type EditProfilePayload = {
  username: string;
  bio: string;
  avatarUrl: string;
};

export type EditProfileResponse = {
  profile?: Profile;
  error?: string;
};