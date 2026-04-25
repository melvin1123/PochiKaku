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
  handleCommentSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
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
  const [comments, setComments] = useState<CommentItem[]>(
    post.commentsPreview ?? [],
  );
  const [commentCount, setCommentCount] = useState<number>(post.comments);
  const [commentInput, setCommentInput] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] =
    useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setShowPostModal(false);
        setShowMenu(false);
      }
    };

    const handleClickOutside = (event: MouseEvent): void => {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.body.style.overflow = showPostModal ? "hidden" : "unset";

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPostModal]);

  const handleFollowToggle = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`/api/users/${post.artistId}/follow`, {
        method: "POST",
        credentials: "include",
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to toggle follow."));
      }

      if (!isFollowResponse(data)) {
        throw new Error("Invalid follow response.");
      }

      setIsFollowed(data.isFollowed);
      setShowMenu(false);
    } catch (error: unknown) {
      console.error("Follow toggle error:", error);
    }
  }, [post.artistId]);

  const handleLikeToggle = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to toggle like."));
      }

      if (!isLikeResponse(data)) {
        throw new Error("Invalid like response.");
      }

      setIsLiked(data.isLiked);
      setLikes(data.likes);
    } catch (error: unknown) {
      console.error("Like toggle error:", error);
    }
  }, [post.id]);

  const handleCommentSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();

      const content = commentInput.trim();

      if (!content) return;

      try {
        setIsSubmittingComment(true);

        const res = await fetch(`/api/posts/${post.id}/comments`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        const data = await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(getErrorMessage(data, "Failed to comment."));
        }

        if (!isCommentResponse(data)) {
          throw new Error("Invalid comment response.");
        }

        setComments((prev) => [...prev, data.comment]);
        setCommentCount(data.comments);
        setCommentInput("");
      } catch (error: unknown) {
        console.error("Comment submit error:", error);
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [commentInput, post.id],
  );

  return {
    isFollowed,
    isLiked,
    likes,
    comments,
    commentCount,
    commentInput,
    isSubmittingComment,
    showPostModal,
    showMenu,
    menuRef,
    setCommentInput,
    setShowPostModal,
    setShowMenu,
    handleFollowToggle,
    handleLikeToggle,
    handleCommentSubmit,
  };
}