"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaTimes, FaComment, FaEllipsisH, FaReply } from "react-icons/fa";
import { useArtPostCard } from "@/app/hooks/homepage/useArtPostCard";
import type { Post } from "@/app/types/post";

// 👇 Ensure your utility is updated with the parentUsername logic!
import { nestComments, type NestedComment } from "@/app/utils/comments"; 

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg";

type ArtPostCardProps = {
  post: Post;
  currentUserId?: string | null;
};

export default function ArtPostCard({ post, currentUserId }: ArtPostCardProps) {
  const router = useRouter();

  const {
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
  } = useArtPostCard(post);

  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const isOwnPost = currentUserId === post.artistId;
  const postIdSafe = (post as any).id || post.artistId;

  // Modal & History Logic
  const openModal = () => {
    setShowPostModal(true);
    window.history.pushState({ modal: `post-${postIdSafe}` }, "");
  };

  const closeModal = () => {
    if (window.history.state?.modal === `post-${postIdSafe}`) {
      window.history.back();
    } else {
      setShowPostModal(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => { if (showPostModal) setShowPostModal(false); };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showPostModal, setShowPostModal]);

  const handleNavigateToProfile = (userId: string) => {
    if (showPostModal) closeModal();
    setTimeout(() => { router.push(`/profile/${userId}`); }, 50);
  };

  // --------------------------------------------------------
  // FLAT THREAD RENDERING LOGIC
  // --------------------------------------------------------
  const nestedCommentsTree = useMemo(() => nestComments(comments), [comments]);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderCommentNode = (comment: NestedComment, depth: number = 0) => {
    const commentUserId = comment.user?.id || comment.user?.username || "";
    const hasReplies = comment.replies && comment.replies.length > 0;
    const commentIdStr = String(comment.id);
    const isExpanded = expandedReplies[commentIdStr];
    
    // FLAT UI LOGIC: Only the first level of replies gets smaller avatars
    const isReply = depth > 0;

    return (
      <div key={commentIdStr} className={`flex flex-col gap-1 ${depth === 0 ? "mt-5 first:mt-0" : "mt-4"}`}>
        {/* Comment Body */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => handleNavigateToProfile(commentUserId)}
            className={`relative flex-shrink-0 overflow-hidden rounded-full border border-[#e8dfd3] bg-[#f7f3ee] transition hover:opacity-80 ${
              isReply ? "h-7 w-7" : "h-9 w-9" 
            }`}
          >
            <Image
              src={comment.user?.avatarUrl || DEFAULT_AVATAR}
              alt={comment.user?.username || "User"}
              fill
              className="object-cover"
              sizes={isReply ? "28px" : "36px"}
            />
          </button>
          
          <div className="max-w-[88%] rounded-2xl bg-[#f7f3ee] px-3 py-2 text-sm shadow-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
              <button
                type="button"
                onClick={() => handleNavigateToProfile(commentUserId)}
                className="font-bold text-[#3e2c23] hover:underline"
              >
                {comment.user?.username}
              </button>

              {/* Replying to @username tag for Flat Context */}
              {isReply && comment.parentUsername && (
                <span className="text-[11px] font-medium text-[#9a8878]">
                  replying to <span className="text-[#7a6a5d]">@{comment.parentUsername}</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 break-words leading-relaxed text-[#5a4636]">{comment.content}</p>
          </div>
        </div>

        {/* Action Bar (Modal Style Buttons) */}
        <div className={`${isReply ? "ml-9" : "ml-11"} flex items-center gap-4 text-[11px] font-bold text-[#8a7a6d]`}>
          <button
            type="button"
            onClick={() => setReplyingTo({ id: commentIdStr, username: comment.user?.username || "User" })}
            className="flex items-center gap-1 transition hover:text-[#3e2c23]"
          >
            <FaReply size={10} /> Reply
          </button>

          {/* View/Hide Toggle - Matches ArtModal style */}
          {hasReplies && (
            <button
              onClick={() => toggleReplies(commentIdStr)}
              className="text-[#5a4636] transition hover:underline"
            >
              {isExpanded ? "Hide replies" : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
        </div>

        {/* RECURSION CONTAINER (The Flat Switch) */}
        {isExpanded && hasReplies && (
          <div 
            className={`
              mt-2 flex flex-col gap-1 
              ${depth === 0 
                ? "ml-6 sm:ml-11 border-l-2 border-[#e8dfd3] pl-3" // Root gets the indent & line
                : "ml-0 border-none pl-0" // Depth 1+ replies get NO margins, NO borders, NO padding
              }
            `}
          >
            {/* 
                NOTICE: Because we strip margin, border, and padding when depth > 0,
                we prevent the "staircase" effect. All deep replies will align 
                perfectly flush under the very first reply level. 
            */}
            {comment.replies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderComments = () => {
    if (nestedCommentsTree.length === 0) {
      return <p className="py-10 text-center text-sm text-[#9a8878]">No comments yet. Start the conversation!</p>;
    }
    return nestedCommentsTree.map((comment) => renderCommentNode(comment, 0));
  };

  // Reusable Comment Form
  const CommentForm = (
    <div className="sticky bottom-0 z-20 mt-auto w-full border-t border-[#e8dfd3] bg-white flex flex-col">
      {replyingTo && (
        <div className="flex items-center justify-between bg-[#fbf9f7] px-4 py-2 text-[11px] text-[#5a4636]">
          <span>
            Replying to <span className="font-bold text-[#3e2c23]">@{replyingTo.username}</span>
          </span>
          <button onClick={() => setReplyingTo(null)} className="font-bold text-[#3e2c23] hover:opacity-70">✕</button>
        </div>
      )}
      <div className="p-4">
        <form
          onSubmit={async (e) => {
            await handleCommentSubmit(e, replyingTo?.id);
            setReplyingTo(null);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            className="flex-1 rounded-full border border-[#d9cfc3] bg-[#fcfaf8] px-4 py-2 text-sm outline-none placeholder:text-[#9a8878] focus:border-[#5a4636] focus:bg-white"
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentInput.trim()}
            className="rounded-full bg-[#3e2c23] px-5 py-2 text-sm font-bold text-white transition hover:bg-black disabled:opacity-30"
          >
            {isSubmittingComment ? "..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Feed Card View */}
      <div className="relative mx-auto w-260 max-w-full overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e8dfd3] p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#e8dfd3]">
              <Link href={`/profile/${post.artistId}`}>
                <Image src={post.avatar} alt={post.artist} fill className="rounded-full object-cover" sizes="40px" />
              </Link>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${post.artistId}`} className="text-sm font-bold text-[#3e2c23] hover:underline">
                  {post.artist}
                </Link>
                {isFollowed && !isOwnPost && (
                  <span className="rounded-full bg-[#f3eee8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#5a4636]">
                    Following
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9a8878]">{post.time}</p>
            </div>
          </div>
          <div className="relative ml-3" ref={menuRef}>
            <button type="button" onClick={() => setShowMenu((prev) => !prev)} className="rounded-full p-2 text-[#5a4636] transition hover:bg-[#f3eee8]">
              <FaEllipsisH size={15} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[#e8dfd3] bg-white shadow-xl">
                {!isOwnPost && (
                  <button type="button" onClick={handleFollowToggle} className="block w-full px-4 py-3 text-left text-sm font-medium text-[#3e2c23] transition hover:bg-[#f7f3ee]">
                    {isFollowed ? "Unfollow" : "Follow"}
                  </button>
                )}
                <Link href={`/profile/${post.artistId}`} onClick={() => setShowMenu(false)} className="block px-4 py-3 text-sm font-medium text-[#3e2c23] transition hover:bg-[#f7f3ee]">
                  View profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3 pt-3">
          <p className="text-base font-bold text-[#3e2c23]">{post.title}</p>
          {post.description && <p className="mt-1 text-sm leading-relaxed text-[#5a4636]">{post.description}</p>}
        </div>

        {/* Image */}
        <div className="border-y border-[#e8dfd3] bg-[#111]">
          <button type="button" onClick={openModal} className="block w-full cursor-zoom-in">
            <div className="relative flex min-h-50 w-full items-center justify-center overflow-hidden bg-[#111]">
              <Image src={post.image} alt="" fill className="scale-110 object-cover opacity-40 blur-sm" sizes="100vw" />
              <Image src={post.image} alt={post.title} width={1600} height={1600} className="relative z-10 h-auto max-h-[80vh] w-full object-contain" />
            </div>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-[#3e2c23]">
            <button onClick={handleLikeToggle} className="flex items-center gap-2 transition hover:opacity-70" type="button">
              <FaHeart size={18} className={isLiked ? "text-red-500" : "text-[#3e2c23]"} />
              <span>{likes}</span>
            </button>
            <button onClick={openModal} className="flex items-center gap-2 transition hover:opacity-70" type="button">
              <FaComment size={18} />
              <span>{commentCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={closeModal}>
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-white lg:flex-row" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button onClick={closeModal} className="absolute left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60">
                <FaTimes size={20} />
            </button>

            {/* A. MOBILE IMAGE */}
            <div className="relative flex min-h-[250px] max-h-[40vh] w-full shrink-0 items-center justify-center bg-black lg:hidden">
              <Image src={post.image} alt={post.title} width={1800} height={1800} className="h-full w-full object-contain" priority />
            </div>

            {/* B. DESKTOP IMAGE */}
            <div className="hidden h-full flex-1 items-center justify-center bg-black lg:flex">
              <Image src={post.image} alt={post.title} width={1800} height={1800} className="h-full w-full object-contain" priority />
            </div>

            {/* C. SIDEBAR (Comments & Details) */}
            <div className="flex flex-1 w-full flex-col overflow-hidden border-l border-[#e8dfd3] lg:w-[450px] lg:flex-none">
              {/* Profile Header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#e8dfd3] bg-white/90 p-4 backdrop-blur-md">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#e8dfd3]">
                  <Image src={post.avatar} alt={post.artist} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#3e2c23]">{post.artist}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#9a8878]">{post.time}</p>
                </div>
              </div>

              {/* Scrolling Content Area */}
              <div className="flex-1 overflow-y-auto px-4 py-6 pb-[100px] custom-scrollbar lg:pb-6">
                <h3 className="text-xl font-black tracking-tight text-[#3e2c23]">{post.title}</h3>
                {post.description && <p className="mt-3 text-sm leading-relaxed text-[#5a4636]">{post.description}</p>}

                {/* Stats */}
                <div className="mt-6 flex gap-6 border-y border-[#f3eee8] py-4 text-sm font-bold">
                  <button onClick={handleLikeToggle} className="flex items-center gap-2">
                    <FaHeart className={isLiked ? "text-red-500" : ""} /> {likes}
                  </button>
                  <div className="flex items-center gap-2">
                    <FaComment /> {commentCount}
                  </div>
                </div>

                {/* Flat Comments Section */}
                <div className="mt-8 pb-10">
                  {renderComments()}
                </div>
              </div>

              {/* Desktop Sticky Form */}
              <div className="hidden lg:block">
                {CommentForm}
              </div>
            </div>

            {/* Mobile Sticky Form */}
            <div className="fixed bottom-0 left-0 z-50 w-full lg:hidden">
              {CommentForm}
            </div>
          </div>
        </div>
      )}
    </> 
  );
}