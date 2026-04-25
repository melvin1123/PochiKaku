"use client";

import { useEffect, useState, useCallback } from "react";
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

function getErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as any).error === "string"
  ) {
    return (data as any).error;
  }
  return fallback;
}

export default function UserProfilePage() {
  const params = useParams();

  // ✅ safer param extraction
  const userId =
    typeof params?.userId === "string" ? params.userId : "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
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

      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to load profile."));
      }

      const response = data as ProfileResponse;

      setProfile(response.profile ?? null);
      setStats(response.stats ?? null);
      setArtworks(Array.isArray(response.artworks) ? response.artworks : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleFollowToggle = useCallback(async () => {
    if (!profile) return;

    try {
      const res = await fetch(`/api/users/${profile.id}/follow`, {
        method: "POST",
        credentials: "include",
      });

      const text = await res.text();

      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to toggle follow"));
      }

      const parsed = data as { isFollowed?: boolean };

      const isFollowed = Boolean(parsed.isFollowed);

      // ✅ safe state updates
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowed,
            }
          : prev
      );

      setStats((prev) =>
        prev
          ? {
              ...prev,
              followers: isFollowed
                ? prev.followers + 1
                : Math.max(0, prev.followers - 1),
            }
          : prev
      );
    } catch (err) {
      console.error("Follow toggle error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update follow state."
      );
    }
  }, [profile]);

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