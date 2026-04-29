import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/app/logic/apiError";
import {
  isFollowResponse,
  parseProfileResponse,
} from "@/app/logic/profileGuards";
import type { Artwork } from "@/app/types/artwork";
import type { Profile, ProfileStats } from "@/app/types/profile";

type UseUserProfileBaseReturn = {
  profile: Profile | null;
  stats: ProfileStats | null;
  artworks: Artwork[];
  isLoading: boolean;
  error: string;
  refetchProfile: () => Promise<void>;
  handleFollowToggle: () => Promise<void>;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`API did not return JSON. Status: ${res.status}`);
  }
}

export function useUserProfileBase(
  profileUrl: string,
): UseUserProfileBaseReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadProfile = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(profileUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const rawData = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(rawData, "Failed to load profile."));
      }

      const data = parseProfileResponse(rawData);

      setProfile(data.profile ?? null);
      setStats(data.stats ?? null);
      setArtworks(data.artworks ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profileUrl]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleFollowToggle = useCallback(async (): Promise<void> => {
    if (!profile || profile.isOwnProfile) return;

    try {
      const res = await fetch(`/api/users/${profile.id}/follow`, {
        method: "POST",
        credentials: "include",
      });

      const rawData = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(rawData, "Failed to toggle follow."));
      }

      if (!isFollowResponse(rawData)) {
        throw new Error("Invalid follow response.");
      }

      const nextIsFollowed = rawData.isFollowed;

      setProfile((prevProfile) =>
        prevProfile ? { ...prevProfile, isFollowed: nextIsFollowed } : prevProfile,
      );

      setStats((prevStats) =>
        prevStats
          ? {
              ...prevStats,
              followers: nextIsFollowed
                ? prevStats.followers + 1
                : Math.max(0, prevStats.followers - 1),
            }
          : prevStats,
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update follow state.",
      );
      console.error("Follow toggle error:", err);
    }
  }, [profile]);

  return {
    profile,
    stats,
    artworks,
    isLoading,
    error,
    refetchProfile: loadProfile,
    handleFollowToggle,
  };
}