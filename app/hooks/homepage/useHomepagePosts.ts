import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/app/logic/apiError";
import { parsePostsResponse } from "@/app/logic/postGuards";
import type { PostItem } from "@/app/types/post";
import type { CurrentUser } from "@/app/types/user";

type UseHomepagePostsReturn = {
  recentArtworks: PostItem[];
  posts: PostItem[];
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string;
  refetchPosts: () => Promise<void>;
};

export function useHomepagePosts(): UseHomepagePostsReturn {
  const [recentArtworks, setRecentArtworks] = useState<PostItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchPosts = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/posts", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const text = await res.text();

      let rawData: unknown;

      try {
        rawData = JSON.parse(text) as unknown;
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(rawData, "Failed to fetch posts."));
      }

      const data = parsePostsResponse(rawData);

      setCurrentUser(data.currentUser ?? null);
      setRecentArtworks(data.recentUploads ?? []);
      setPosts(data.posts ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      console.error("Fetch posts error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return {
    recentArtworks,
    posts,
    currentUser,
    isLoading,
    error,
    refetchPosts: fetchPosts,
  };
}