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
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm"
    >
      <Dialog.Panel className="relative flex h-full w-full flex-col overflow-y-auto bg-[#f5efe6] md:flex-row md:overflow-hidden">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute left-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Image Section */}
        <div className="flex w-full flex-shrink-0 items-center justify-center bg-black md:h-full md:w-[60%]">
          <Image
            src={art.image}
            alt={art.title}
            width={1600}
            height={1600}
            className="h-full w-full object-contain"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>

        {/* Info & Comments Section */}
        <div className="flex w-full flex-col border-l border-[#e8dfd3] text-[#3e2c23] md:h-full md:w-[30%]">
          <div className="border-b border-[#e8dfd3] p-6">
            <h2 className="text-2xl font-bold">{art.title}</h2>
            <p className="text-md text-[#5a4636]">by {art.artist}</p>
            <p className="mt-4 text-sm leading-relaxed text-[#5a4636]">{art.description}</p>
          </div>

          <div className="flex items-center gap-6 border-b border-[#e8dfd3] p-4 px-6">
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-2 font-medium"
            >
              <FaHeart className={isLiked ? "text-red-500" : "text-[#5a4636]"} />
              {likes}
            </button>

            <div className="flex items-center gap-2 font-medium">
              <FaComment className="text-[#5a4636]" />
              {comments.length}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {comments.length === 0 ? (
              <p className="text-sm italic text-[#5a4636]">No comments yet. Be the first to chime in!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-[#d6c3a3]">
                    <Image
                      src={comment.user.avatarUrl}
                      alt={comment.user.username}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3e2c23]">
                      {comment.user.username}
                    </span>
                    <p className="text-sm text-[#5a4636]">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[#e8dfd3] bg-[#f5efe6] p-4">
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-[#d6c3a3] bg-white px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3e2c23]"
              />
              <button
                type="button"
                onClick={handleComment}
                className="rounded-lg bg-[#3e2c23] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a1d17]"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* More Artworks Sidebar */}
        <div className="w-full border-l border-[#e8dfd3] p-6 md:h-full md:w-[10%] md:overflow-y-auto">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#3e2c23]">
            More
          </p>

          <div className="flex flex-row gap-3 overflow-x-auto pb-4 md:flex-col md:overflow-x-visible md:pb-0">
            {moreArtworks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChangeArt(item);
                  document.querySelector('.relative.flex.h-full')?.scrollTo(0,0);
                }}
                className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#e8dfd3] md:w-full"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 80px, 10vw"
                />
              </button>
            ))}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}