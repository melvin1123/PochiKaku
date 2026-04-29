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

// --- Helper Functions ---
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

// --- Main Component ---
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
      if (!res.ok) throw new Error("Like failed.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const rawData = await parseJsonResponse(res);
      if (!res.ok) throw new Error("Comment failed.");
      const data = parseCommentResponse(rawData);
      if (!data.comment) throw new Error("Invalid comment response.");
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
    >
      <div className="flex min-h-screen items-start justify-center p-0 sm:items-center sm:p-4">
        <Dialog.Panel className="relative flex w-full max-w-6xl flex-col bg-[#f5efe6] shadow-2xl sm:rounded-3xl md:h-[90vh] md:flex-row md:overflow-hidden">
          
          {/* Close Button - Fixed on mobile to stay above the scrollable content */}
          <button
            type="button"
            onClick={onClose}
            className="fixed right-4 top-4 z- flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/80 md:absolute md:left-4 md:top-4 md:right-auto"
          >
            ✕
          </button>

          {/* 1. TOP SECTION (Mobile) / LEFT SECTION (Desktop): THE IMAGE */}
          <div className="relative flex w-full items-center justify-center bg-[#111] md:h-full md:w-[65%]">
            <Image
              src={art.image}
              alt={art.title}
              width={1400}
              height={1400}
              className="h-auto max-h-[75vh] w-full object-contain md:max-h-full"
              priority
            />
          </div>

          {/* 2. BOTTOM SECTION (Mobile) / RIGHT SECTION (Desktop): CONTENT */}
          <div className="flex w-full flex-col bg-[#f5efe6] text-[#3e2c23] md:w-[35%] md:border-l md:border-[#e8dfd3]">
            
            {/* Sticky Header: Artist & Title */}
            <div className="sticky top-0 z-10 border-b border-[#e8dfd3] bg-[#f5efe6]/95 p-5 backdrop-blur-md">
              <h2 className="text-xl font-bold tracking-tight">{art.title}</h2>
              <p className="text-sm font-medium text-[#5a4636]">by {art.artist}</p>
            </div>

            {/* Scrollable Interaction Area */}
            <div className="flex-1 p-5 md:overflow-y-auto">
              <p className="mb-6 text-sm leading-relaxed text-[#5a4636]">
                {art.description}
              </p>

              {/* Like/Comment Count Bar */}
              <div className="mb-6 flex items-center gap-6 border-y border-[#e8dfd3] py-4">
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex items-center gap-2 text-sm font-bold transition hover:scale-105"
                >
                  <FaHeart className={isLiked ? "text-red-500" : "text-[#3e2c23]"} size={20} />
                  {likes}
                </button>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <FaComment size={20} className="text-[#3e2c23]" />
                  {comments.length}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9a8878]">Comments</p>
                {comments.length === 0 ? (
                  <p className="text-sm italic text-[#9a8878]">Be the first to comment...</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                        <Image src={comment.user.avatarUrl} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 rounded-2xl bg-white/50 p-3 shadow-sm">
                        <p className="text-xs font-bold">{comment.user.username}</p>
                        <p className="mt-0.5 text-sm leading-snug text-[#5a4636]">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mobile Padding: Keeps the last comment from being hidden by the sticky input */}
              <div className="h-24 md:hidden" />
            </div>

            {/* Sticky Comment Form: Sits at the bottom of the modal window */}
            <div className="sticky bottom-0 z-20 border-t border-[#e8dfd3] bg-[#f5efe6] p-4 pb-6 sm:pb-4">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment();
                }}
              >
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-full border border-[#d6c3a3] bg-white px-5 py-2.5 text-sm outline-none transition focus:border-[#3e2c23] focus:ring-1 focus:ring-[#3e2c23]/10"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="rounded-full bg-[#3e2c23] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-black active:scale-95 disabled:opacity-40"
                >
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* 3. SIDEBAR (Desktop Only): More Artworks */}
          {moreArtworks.length > 0 && (
            <div className="hidden overflow-y-auto border-l border-[#e8dfd3] bg-[#f5efe6]/40 p-4 md:block md:w-[80px] lg:w-[100px]">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-tighter text-[#9a8878]">More</p>
              <div className="space-y-3">
                {moreArtworks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeArt(item)}
                    className="group relative aspect-square w-full overflow-hidden rounded-xl border border-[#e8dfd3] bg-white shadow-sm"
                  >
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition group-hover:scale-110" 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}