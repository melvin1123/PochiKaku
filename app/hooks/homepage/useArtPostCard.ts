import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage } from "@/app/logic/apiError";
import {
  isCommentResponse,
  isFollowResponse,
  isLikeResponse,
} from "@/app/logic/postActionsGuards";
import type { CommentItem } from "@/app/types/comment";
import type { Post } from "@/app/types/post";

type UseArtPostCardReturn = {
  isFollowed: boolean;
  isLiked: boolean;
  likes: number;
  comments: CommentItem[];
  commentCount: number;
  commentInput: string;
  isSubmittingComment: boolean;
  showPostModal: boolean;
  showMenu: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  setCommentInput: React.Dispatch<React.SetStateAction<string>>;
  setShowPostModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  handleFollowToggle: () => Promise<void>;
  handleLikeToggle: () => Promise<void>;
  handleCommentSubmit: (event: FormEvent<HTMLFormElement>, parentId?: string | null) => Promise<void>;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`API did not return JSON. Status: ${res.status}`);
  }
}

export function useArtPostCard(post: Post): UseArtPostCardReturn {
  const [isFollowed, setIsFollowed] = useState<boolean>(post.isFollowed ?? false);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked ?? false);
  const [likes, setLikes] = useState<number>(post.likes);
  const [comments, setComments] = useState<CommentItem[]>(post.commentsPreview ?? []);
  const [commentCount, setCommentCount] = useState<number>(post.comments);
  const [commentInput, setCommentInput] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // --- NEW: Fetch Full Comments on Modal Open ---
  useEffect(() => {
    if (showPostModal) {
      const fetchFullComments = async () => {
        try {
          const res = await fetch(`/api/posts/${post.id}/comments`);
          const data = await parseJsonResponse(res);
          
          // Assuming your API returns { comments: CommentItem[] }
          if (res.ok && data && typeof data === 'object' && 'comments' in data) {
            setComments(data.comments as CommentItem[]);
          }
        } catch (error) {
          console.error("Failed to load full thread:", error);
        }
      };
      fetchFullComments();
    }
  }, [showPostModal, post.id]);

  // --- UI & Event Listeners ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setShowPostModal(false);
        setShowMenu(false);
      }
    };
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showPostModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPostModal]);

  // --- Handlers ---
  const handleFollowToggle = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${post.artistId}/follow`, { method: "POST" });
      const data = await parseJsonResponse(res);
      if (res.ok && isFollowResponse(data)) {
        setIsFollowed(data.isFollowed);
        setShowMenu(false);
      }
    } catch (error) { console.error(error); }
  }, [post.artistId]);

  const handleLikeToggle = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await parseJsonResponse(res);
      if (res.ok && isLikeResponse(data)) {
        setIsLiked(data.isLiked);
        setLikes(data.likes);
      }
    } catch (error) { console.error(error); }
  }, [post.id]);

  const handleCommentSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>, parentId?: string | null) => {
      event.preventDefault();
      const content = commentInput.trim();
      if (!content) return;

      try {
        setIsSubmittingComment(true);
        const res = await fetch(`/api/posts/${post.id}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, parentId: parentId || null }),
        });

        const data = await parseJsonResponse(res);
        if (res.ok && isCommentResponse(data)) {
          // Add the new comment to the local state
          setComments((prev) => [...prev, data.comment]);
          setCommentCount(data.comments);
          setCommentInput("");
        }
      } catch (error) {
        console.error("Comment submit error:", error);
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [commentInput, post.id]
  );

  return {
    isFollowed, isLiked, likes, comments, commentCount, commentInput,
    isSubmittingComment, showPostModal, showMenu, menuRef,
    setCommentInput, setShowPostModal, setShowMenu,
    handleFollowToggle, handleLikeToggle, handleCommentSubmit,
  };
}