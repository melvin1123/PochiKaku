"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { FaHeart, FaComment, FaTimes, FaReply } from "react-icons/fa";

import type { Artwork } from "@/app/types/artwork";
import type { Profile, ProfileStats } from "@/app/types/profile";
import { CommentItem } from "@/app/types/comment";
import { NestedComment, nestComments } from "@/app/utils/comments";

type ProfileViewProps = {
  profile: Profile | null;
  stats: ProfileStats | null;
  artworks: Artwork[];
  isLoading: boolean;
  error: string;
  onFollowToggle?: () => Promise<void>;
  onEditProfile?: () => void;
};

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg";

/**
 * RECURSIVE COMMENT COMPONENT
 */
const CommentNode: React.FC<{
  comment: NestedComment;
  depth?: number;
  onReply: (c: { id: string; username: string }) => void;
}> = ({ comment, depth = 0, onReply }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isReply = depth > 0;

  return (
    <div className={`flex flex-col gap-1 ${depth === 0 ? "mt-5 first:mt-0" : "mt-4"}`}>
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className={`relative flex-shrink-0 overflow-hidden rounded-full border border-[#e8dfd3] bg-[#f7f3ee] ${isReply ? "h-7 w-7" : "h-9 w-9"}`}>
          <Image 
            src={comment.user?.avatarUrl || DEFAULT_AVATAR} 
            alt={comment.user?.username || "User"} 
            fill 
            className="object-cover" 
            sizes={isReply ? "28px" : "36px"}
          />
        </div>

        {/* Content Bubble */}
        <div className="max-w-[88%] rounded-2xl bg-[#f7f3ee] px-3 py-2 text-sm shadow-sm">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-bold text-[#3e2c23]">{comment.user?.username}</span>
            {isReply && comment.parentUsername && (
              <span className="text-[11px] font-medium text-[#9a8878]">
                replying to <span className="text-[#7a6a5d]">@{comment.parentUsername}</span>
              </span>
            )}
          </div>
          <p className="mt-0.5 break-words leading-relaxed text-[#5a4636]">{comment.content}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`${isReply ? "ml-9" : "ml-11"} flex items-center gap-4 text-[11px] font-bold text-[#8a7a6d]`}>
        <button 
          onClick={() => onReply({ id: String(comment.id), username: comment.user.username })}
          className="flex items-center gap-1 transition hover:text-[#3e2c23]"
        >
          <FaReply size={10} /> Reply
        </button>

        {/* View/Hide Toggle */}
        {hasReplies && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#5a4636] transition hover:underline"
          >
            {isExpanded ? "Hide replies" : `View ${comment.replies.length} replies`}
          </button>
        )}
      </div>

      {/* Nested Replies Section */}
      {isExpanded && hasReplies && (
        <div className="mt-2 flex flex-col gap-1 ml-6 border-l-2 border-[#e8dfd3] pl-3 sm:ml-11">
          {comment.replies.map((reply) => (
            <CommentNode 
              key={String(reply.id)} 
              comment={reply} 
              depth={depth + 1} 
              onReply={onReply} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * MODAL COMPONENT
 */
function ProfileArtModal({ art, onClose }: { art: Artwork | null; onClose: () => void }) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    if (!art) return;
    setLikes(art.likes || 0);
    // Assuming Artwork type might be extended later. Defaulting to false if not present.
    setIsLiked((art as any).isLiked ?? false); 
    setReplyingTo(null);
    setComments([]);

    const fetchFullThread = async () => {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${art.id}/comments`);
        const data = await res.json();
        if (data.comments) {
          const sanitized = data.comments.map((c: any) => ({
            ...c,
            id: String(c.id),
            parentId: c.parentId ? String(c.parentId) : null
          }));
          setComments(sanitized);
        }
      } catch (err) {
        console.error("Full thread fetch error:", err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchFullThread();
  }, [art]);

  const nestedCommentsTree = useMemo(() => {
    return nestComments(comments);
  }, [comments]);

  const handleCommentSubmit = async () => {
    if (!art || !newComment.trim()) return;
    const targetParentId = replyingTo?.id || null;

    try {
      const res = await fetch(`/api/posts/${art.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, parentId: targetParentId }),
      });

      if (!res.ok) throw new Error("Failed to post");

      const data = await res.json();
      
      const savedComment: CommentItem = {
        ...data.comment,
        id: String(data.comment.id),
        parentId: targetParentId ? String(targetParentId) : null,
      };

      setComments((prev) => [...prev, savedComment]);
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Comment submission error:", err);
    }
  };

  if (!art) return null;

  return (
    <Dialog open={!!art} onClose={onClose} className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md">
      <Dialog.Panel className="relative flex h-full w-full flex-col overflow-y-auto bg-white md:flex-row md:overflow-hidden">
        
        <button onClick={onClose} className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60">
          <FaTimes size={20} />
        </button>

        {/* LEFT: Art Image */}
        <div className="relative flex h-[45dvh] min-h-[45dvh] w-full shrink-0 items-center justify-center bg-black md:h-full md:flex-1">
          <Image src={art.imageUrl} alt={art.title} fill className="object-contain" priority sizes="(max-width: 768px) 100vw, 60vw" />
        </div>

        {/* RIGHT: Sidebar */}
        <div className="flex min-h-[55dvh] w-full flex-col border-l border-[#e8dfd3] md:h-full md:w-[450px]">
          
          <div className="border-b border-[#e8dfd3] bg-[#fbf9f7]/50 p-4">
            <h2 className="text-xl font-black text-[#3e2c23]">{art.title}</h2>
            <p className="mt-1 text-sm text-[#5a4636] line-clamp-2">{art.time}</p>
            <div className="mt-4 flex gap-6 text-sm font-bold text-[#3e2c23]">
              <div className="flex items-center gap-2">
                <FaHeart className={isLiked ? "text-red-500" : ""} /> {likes}
              </div>
              <div className="flex items-center gap-2">
                <FaComment /> {isLoadingComments ? "..." : comments.length}
              </div>
            </div>
          </div>

          {/* COMMENTS AREA */}
          <div className="custom-scrollbar bg-white p-4 md:flex-1 md:overflow-y-auto">
            {nestedCommentsTree.length > 0 ? (
              nestedCommentsTree.map((comment) => (
                <CommentNode key={String(comment.id)} comment={comment} onReply={setReplyingTo} />
              ))
            ) : (
              <p className="py-10 text-center text-sm text-[#9a8878]">
                {isLoadingComments ? "Loading thread..." : "No comments yet."}
              </p>
            )}
          </div>

          {/* INPUT FORM */}
          <div className="sticky bottom-0 z-10 mt-auto border-t border-[#e8dfd3] bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] md:static">
            {replyingTo && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-[#f7f3ee] px-3 py-1.5 text-[11px]">
                <span className="text-[#5a4636]">Replying to <span className="font-bold text-[#3e2c23]">@{replyingTo.username}</span></span>
                <button onClick={() => setReplyingTo(null)} className="font-bold text-[#8a7a6d] hover:text-black">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
                className="flex-1 rounded-full border border-[#d9cfc3] bg-[#fcfaf8] px-4 py-2 text-sm outline-none focus:border-[#5a4636]"
              />
              <button 
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                className="rounded-full bg-[#3e2c23] px-5 py-2 text-sm font-bold text-white disabled:opacity-30"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

/**
 * MAIN PROFILE VIEW COMPONENT
 */
export default function ProfileView({
  profile,
  stats,
  artworks,
  isLoading,
  error,
  onFollowToggle,
  onEditProfile,
}: ProfileViewProps) {
  const [isFollowingBusy, setIsFollowingBusy] = useState<boolean>(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const handleFollow = async (): Promise<void> => {
    if (!onFollowToggle) return;

    try {
      setIsFollowingBusy(true);
      await onFollowToggle();
    } finally {
      setIsFollowingBusy(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="mb-10 animate-pulse rounded-2xl bg-[#f5efe6] p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="h-28 w-28 rounded-full bg-[#e6d3b3]" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-[#e6d3b3]" />
              <div className="h-4 w-72 rounded bg-[#e6d3b3]" />
              <div className="h-4 w-56 rounded bg-[#e6d3b3]" />
              <div className="mt-4 flex gap-4">
                <div className="h-4 w-20 rounded bg-[#e6d3b3]" />
                <div className="h-4 w-24 rounded bg-[#e6d3b3]" />
                <div className="h-4 w-24 rounded bg-[#e6d3b3]" />
              </div>
            </div>
            <div className="h-10 w-28 rounded-lg bg-[#e6d3b3]" />
          </div>
        </div>

        <div className="mb-4 border-t border-[#d7cab9] pt-4">
          <div className="mb-2 h-6 w-40 animate-pulse rounded bg-[#e6d3b3]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[#e6d3b3]" />
        </div>

        {/* Skeleton for Masonry */}
        <div className="columns-2 gap-4 md:columns-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`profile-artwork-skeleton-${index}`}
              className={`mb-4 w-full animate-pulse rounded-xl bg-[#f5efe6] ${
                index % 2 === 0 ? "h-64" : "h-48"
              } break-inside-avoid`}
            />
          ))}
        </div>
      </>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-[#5a4636]">
        Profile not found.
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative h-28 w-28">
          <Image
            src={profile.avatarUrl || DEFAULT_AVATAR}
            alt={profile.username}
            fill
            className="rounded-full border-4 border-[#d6c3a3] object-cover"
            sizes="112px"
          />
        </div>

        <div className="mt-2 flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-[#3b2f2f]">
            {profile.username}
          </h1>

          <p className="mt-2 max-w-md text-sm text-[#5a4636]">
            {profile.bio || "No bio yet."}
          </p>

          <div className="mt-4 flex justify-center gap-6 text-sm text-[#3b2f2f] md:justify-start">
            <span>
              <b>{stats.posts}</b> Posts
            </span>
            <span>
              <b>{stats.followers}</b> Followers
            </span>
            <span>
              <b>{stats.following}</b> Following
            </span>
          </div>
        </div>

        {profile.isOwnProfile ? (
          <button
            type="button"
            onClick={onEditProfile}
            disabled={!onEditProfile}
            className="mr-3 mt-4 rounded-lg bg-[#8b6b4f] px-5 py-2 text-white transition hover:bg-[#6f533d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFollow}
            disabled={isFollowingBusy}
            className={`rounded-lg px-5 py-2 text-white transition ${
              profile.isFollowed
                ? "bg-[#6f533d] hover:bg-[#5d4532]"
                : "bg-[#8b6b4f] hover:bg-[#6f533d]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isFollowingBusy
              ? "Please wait..."
              : profile.isFollowed
                ? "Following"
                : "Follow"}
          </button>
        )}
      </div>

      <div className="mb-4 border-t border-[#d7cab9] pt-4">
        <h2 className="text-2xl font-bold text-[#3b2f2f]">Art Gallery</h2>
        <p className="text-sm text-[#5a4636]">Works by this artist</p>
      </div>

      {artworks.length === 0 ? (
        <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
          No artworks uploaded yet.
        </div>
      ) : (
        <div className="columns-2 gap-4 md:columns-3">
          {artworks.map((art) => (
            <div
              key={art.id}
              className="group relative mb-4 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl"
              onClick={() => setSelectedArtwork(art)}
            >
              <Image
                src={art.imageUrl}
                alt={art.title}
                width={600}
                height={600}
                className="h-auto w-full object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              <div className="absolute inset-0 flex items-end bg-black/30 p-3 opacity-0 transition group-hover:opacity-100">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {art.title}
                  </p>
                  <p className="text-xs text-gray-200">
                    ❤️ {art.likes} · 💬 {art.comments}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renders the newly updated Dialog Modal if an artwork is selected */}
      <ProfileArtModal 
        art={selectedArtwork} 
        onClose={() => setSelectedArtwork(null)} 
      />
    </>
  );
}