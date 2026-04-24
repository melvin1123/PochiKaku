"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import ProfileView from "@/components/main-components/profile/ProfileView";

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

type ProfileResponse = {
  profile: Profile;
  stats: Stats;
  artworks: Artwork[];
  error?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch("/api/profile/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data: ProfileResponse = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load profile.");
        }

        setProfile(data.profile);
        setStats(data.stats);
        setArtworks(data.artworks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <MainLayout>
      <div className="m-6 mt-4">
        <ProfileView
          profile={profile}
          stats={stats}
          artworks={artworks}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </MainLayout>
  );
}