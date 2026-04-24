"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  profile?: Profile;
  stats?: Stats;
  artworks?: Artwork[];
  error?: string;
};

export default function UserProfilePage() {
  const params = useParams();
  const userId =
    typeof params.userId === "string" ? params.userId : "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    if (!userId) {
      setError("Invalid user id.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(`/api/profile/${userId}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const text = await res.text();

      let data: ProfileResponse;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load profile.");
      }

      setProfile(data.profile ?? null);
      setStats(data.stats ?? null);
      setArtworks(data.artworks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!profile) return;

    const res = await fetch(`/api/users/${profile.id}/follow`, {
      method: "POST",
      credentials: "include",
    });

    const text = await res.text();

    let data: { isFollowed?: boolean; error?: string };
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`API did not return JSON. Status: ${res.status}`);
    }

    if (!res.ok) {
      throw new Error(data?.error || "Failed to toggle follow");
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            isFollowed: Boolean(data.isFollowed),
          }
        : prev,
    );

    setStats((prev) =>
      prev
        ? {
            ...prev,
            followers: data.isFollowed
              ? prev.followers + 1
              : Math.max(0, prev.followers - 1),
          }
        : prev,
    );
  };

  return (
    <MainLayout>
      <div className="m-3 mt-4">
        <ProfileView
          profile={profile}
          stats={stats}
          artworks={artworks}
          isLoading={isLoading}
          error={error}
          onFollowToggle={handleFollowToggle}
        />
      </div>
    </MainLayout>
  );
}