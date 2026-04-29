"use client";

import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaHeart, FaComment } from "react-icons/fa";
import type { CommentItem } from "@/app/types/comment";
import type { GalleryItem } from "@/app/types/gallery";

type ArtModalProps = {
  art: GalleryItem | null;
  onClose: () => void;
  onChangeArt: (art: GalleryItem) => void;
  moreArtworks?: GalleryItem[];
};

type LikeResponse = {
  isLiked?: boolean;
  liked?: boolean;
  likes?: number;
};

type CommentResponse = {
  comment?: CommentItem;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseLikeResponse(value: unknown): LikeResponse {
  if (!isRecord(value)) return {};

  return {
    isLiked: typeof value.isLiked === "boolean" ? value.isLiked : undefined,
    liked: typeof value.liked === "boolean" ? value.liked : undefined,
    likes: typeof value.likes === "number" ? value.likes : undefined,
  };
}

function isCommentItem(value: unknown): value is CommentItem {
  if (!isRecord(value)) return false;

  const user = value.user;

  return (
    typeof value.id === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    isRecord(user) &&
    typeof user.id === "string" &&
    typeof user.username === "string" &&
    typeof user.avatarUrl === "string"
  );
}

function parseCommentResponse(value: unknown): CommentResponse {
  if (!isRecord(value)) return {};

  return {
    comment: isCommentItem(value.comment) ? value.comment : undefined,
  };
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`API did not return JSON. Status: ${res.status}`);
  }
}

export default function ArtModal({
  art,
  onClose,
  onChangeArt,
  moreArtworks = [],
}: ArtModalProps) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    if (!art) return;

    setLikes(art.likes);
    setComments(art.commentsPreview ?? []);
    setIsLiked(art.isLiked ?? false);
    setNewComment("");
  }, [art]);

  const handleLike = async (): Promise<void> => {
    if (!art) return;

    try {
      const res = await fetch(`/api/posts/${art.id}/like`, {
        method: "POST",
        credentials: "include",
      });

      const rawData = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error("Like failed.");
      }

      const data = parseLikeResponse(rawData);

      setIsLiked(data.isLiked ?? data.liked ?? false);
      setLikes(data.likes ?? likes);
    } catch (err: unknown) {
      console.error("Like failed:", err);
    }
  };

  const handleComment = async (): Promise<void> => {
    const content = newComment.trim();

    if (!art || !content) return;

    try {
      const res = await fetch(`/api/posts/${art.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const rawData = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error("Comment failed.");
      }

      const data = parseCommentResponse(rawData);

      if (!data.comment) {
        throw new Error("Invalid comment response.");
      }

      setComments((prev) => [...prev, data.comment as CommentItem]);
      setNewComment("");
    } catch (err: unknown) {
      console.error("Comment failed:", err);
    }
  };

  if (!art) return null;

  return (
    <Dialog
      open={Boolean(art)}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <Dialog.Panel className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#f5efe6] md:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex w-full items-center justify-center bg-black md:w-[60%]">
          <Image
            src={art.image}
            alt={art.title}
            width={1200}
            height={1200}
            className="max-h-full max-w-full object-contain"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>

        <div className="flex w-full flex-col border-l border-[#e8dfd3] text-[#3e2c23] md:w-[30%]">
          <div className="border-b border-[#e8dfd3] p-4">
            <h2 className="text-lg font-bold">{art.title}</h2>
            <p className="text-sm text-[#5a4636]">by {art.artist}</p>
            <p className="mt-2 text-sm text-[#5a4636]">{art.description}</p>
          </div>

          <div className="flex items-center gap-5 border-b border-[#e8dfd3] p-4">
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <FaHeart className={isLiked ? "text-red-500" : ""} />
              {likes}
            </button>

            <div className="flex items-center gap-2">
              <FaComment />
              {comments.length}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <p className="text-sm text-[#5a4636]">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={comment.user.avatarUrl}
                      alt={comment.user.username}
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {comment.user.username}
                    </p>
                    <p className="text-sm text-[#5a4636]">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 border-t border-[#e8dfd3] p-3">
            <input
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-lg border border-[#d6c3a3] px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={handleComment}
              className="rounded-lg bg-[#3e2c23] px-3 text-white"
            >
              Post
            </button>
          </div>
        </div>

        <div className="hidden overflow-y-auto border-l border-[#e8dfd3] p-3 md:block md:w-[10%]">
          <p className="mb-2 text-[#3e2c23] text-xs font-semibold">More from this artist</p>

          <div className="space-y-2">
            {moreArtworks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeArt(item)}
                className="relative aspect-square w-full overflow-hidden rounded-md"
                aria-label={`View ${item.title}`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition hover:scale-105"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}