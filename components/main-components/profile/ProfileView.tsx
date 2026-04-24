"use client";

import Image from "next/image";
import { useState } from "react";

type Artwork = {
  id: string;
  title: string;
  imageUrl: string;
  likes: number;
  comments: number;
  time: string;
  createdAt: string;
  artist: string;
  artistId: string;
  avatar: string;
  description: string;
};

type Profile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  isOwnProfile: boolean;
  isFollowed: boolean;
};

type Stats = {
  posts: number;
  followers: number;
  following: number;
};

type ProfileViewProps = {
  profile: Profile | null;
  stats: Stats | null;
  artworks: Artwork[];
  isLoading: boolean;
  error: string;
  onFollowToggle?: () => Promise<void>;
};

export default function ProfileView({
  profile,
  stats,
  artworks,
  isLoading,
  error,
  onFollowToggle,
}: ProfileViewProps) {
  const [isFollowingBusy, setIsFollowingBusy] = useState(false);

  const handleFollow = async () => {
    if (!onFollowToggle) return;
    try {
      setIsFollowingBusy(true);
      await onFollowToggle();
    } finally {
      setIsFollowingBusy(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <>
          {/* Profile Header Skeleton */}
          <div className="mb-10 animate-pulse rounded-2xl bg-[#f5efe6] p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="h-28 w-28 rounded-full bg-[#e6d3b3]" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 rounded bg-[#e6d3b3]" />
                <div className="h-4 w-72 rounded bg-[#e6d3b3]" />
                <div className="h-4 w-56 rounded bg-[#e6d3b3]" />
                <div className="mt-4 flex gap-4">
                  <div className="h-4 w-20 rounded bg-[#e6d3b3]" />
                  <div className="h-4 w-24 rounded bg-[#e6d3b3]" />
                  <div className="h-4 w-24 rounded bg-[#e6d3b3]" />
                </div>
              </div>
              <div className="h-10 w-28 rounded-lg bg-[#e6d3b3]" />
            </div>
          </div>

          {/* Divider + Label */}
          <div className="mb-4 border-t border-[#d7cab9] pt-4">
            <div>
              <div className="mb-2 h-6 w-40 animate-pulse rounded bg-[#e6d3b3]" />
              <div className="h-4 w-32 animate-pulse rounded bg-[#e6d3b3]" />
            </div>
          </div>

          {/* Artwork Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-[#f5efe6]"
              />
            ))}
          </div>
        </>
      ) : !profile || !stats ? (
        <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-[#5a4636]">
          Profile not found.
        </div>
      ) : (
        <>
          <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative h-28 w-28">
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                fill
                className="rounded-full border-4 border-[#d6c3a3] object-cover"
              />
            </div>

            <div className="mt-2 flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-[#3b2f2f]">
                {profile.username}
              </h1>

              <p className="mt-2 max-w-md text-sm text-[#5a4636]">
                {profile.bio || "No bio yet."}
              </p>

              <div className="mt-4 flex justify-center gap-6 text-sm text-[#3b2f2f] md:justify-start">
                <span><b>{stats.posts}</b> Posts</span>
                <span><b>{stats.followers}</b> Followers</span>
                <span><b>{stats.following}</b> Following</span>
              </div>
            </div>

            {profile.isOwnProfile ? (
              <button className="rounded-lg bg-[#8b6b4f] px-5 py-2 text-white transition hover:bg-[#6f533d]">
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFollow}
                disabled={isFollowingBusy}
                className={`rounded-lg px-5 py-2 text-white transition ${
                  profile.isFollowed
                    ? "bg-[#6f533d] hover:bg-[#5d4532]"
                    : "bg-[#8b6b4f] hover:bg-[#6f533d]"
                } disabled:opacity-60`}
              >
                {isFollowingBusy
                  ? "Please wait..."
                  : profile.isFollowed
                    ? "Following"
                    : "Follow"}
              </button>
            )}
          </div>

          {/* Divider + Gallery Header */}
          <div className="mb-4 border-t border-[#d7cab9] pt-4">
            <div>
              <h2 className="text-2xl font-bold text-[#3b2f2f]">Art Gallery</h2>
              <p className="text-sm text-[#5a4636]">Works by this artist</p>
            </div>
          </div>

          {artworks.length === 0 ? (
            <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
              No artworks uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {artworks.map((art) => (
                <div
                  key={art.id}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                >
                  <Image
                    src={art.imageUrl}
                    alt={art.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-end bg-black/30 p-3 opacity-0 transition group-hover:opacity-100">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {art.title}
                      </p>
                      <p className="text-xs text-gray-200">
                        ❤️ {art.likes} · 💬 {art.comments} · {art.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}