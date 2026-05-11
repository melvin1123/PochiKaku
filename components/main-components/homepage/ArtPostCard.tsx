"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaComment, FaEllipsisH } from "react-icons/fa";
import { useArtPostCard } from "@/app/hooks/homepage/useArtPostCard";
import type { Post } from "@/app/types/post";

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

  // --- NEW: Reply & Thread State ---
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const isOwnPost = currentUserId === post.artistId;
  const postIdSafe = (post as any).id || post.artistId;

  // --------------------------------------------------------
  // Browser History & Modal State Management
  // --------------------------------------------------------
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
    const handlePopState = () => {
      if (showPostModal) setShowPostModal(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showPostModal, setShowPostModal]);

  const handleNavigateToProfile = (userId: string) => {
    if (showPostModal) closeModal();
    setTimeout(() => {
      router.push(`/profile/${userId}`);
    }, 50);
  };
  // --------------------------------------------------------

  // --------------------------------------------------------
  // Comment Grouping & Rendering Logic
  // --------------------------------------------------------
  
  // 1. Separate Top-Level Comments from Replies
  const topLevelComments = comments.filter((c: any) => !c.parentId);
  
  // 2. Group Replies by parentId
  const repliesByParent = comments.reduce((acc: any, c: any) => {
    if (c.parentId) {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {});

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // 3. Reusable Comment Renderer (Avoids duplicating code for Mobile/Desktop)
  const renderComments = () => {
    if (topLevelComments.length === 0) {
      return <p className="text-sm text-[#6b5a4d]">No comments yet.</p>;
    }

    return topLevelComments.map((comment: any) => {
      const commentUserId = comment.user?.id || comment.userId || comment.user?.username;
      const replies = repliesByParent[comment.id] || [];
      const hasReplies = replies.length > 0;
      const isExpanded = expandedReplies[comment.id];

      return (
        <div key={comment.id} className="flex flex-col gap-1 mt-4 first:mt-0">
          {/* Top-Level Comment */}
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => handleNavigateToProfile(commentUserId)}
              className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full transition hover:opacity-80"
            >
              <Image
                src={comment.user?.avatarUrl || DEFAULT_AVATAR}
                alt={comment.user?.username}
                fill
                className="object-cover"
              />
            </button>
            <div className="max-w-[85%] rounded-2xl bg-[#f7f3ee] px-3 py-2 text-sm">
              <button
                type="button"
                onClick={() => handleNavigateToProfile(commentUserId)}
                className="font-semibold text-[#3e2c23] hover:underline"
              >
                {comment.user?.username}
              </button>
              <p className="break-words text-[#5a4636]">{comment.content}</p>
            </div>
          </div>

          {/* Action Bar (Reply Button) */}
          <div className="ml-10 flex items-center gap-4 text-xs font-semibold text-[#6b5a4d]">
            <button
              type="button"
              onClick={() => setReplyingTo({ id: comment.id, username: comment.user?.username })}
              className="hover:text-[#3e2c23]"
            >
              Reply
            </button>
          </div>

          {/* Thread Toggle */}
          {hasReplies && (
            <div className="ml-10 mt-1">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-2 text-xs font-semibold text-[#5a4636] hover:text-[#3e2c23]"
              >
                <span className="h-[1px] w-6 bg-[#d9cfc3]"></span>
                {isExpanded ? "Hide replies" : `View ${replies.length} replies`}
              </button>
            </div>
          )}

          {/* Replies Rendered (Indented) */}
          {isExpanded && (
            <div className="ml-8 sm:ml-10 mt-2 flex flex-col gap-3">
              {replies.map((reply: any) => {
                const replyUserId = reply.user?.id || reply.userId || reply.user?.username;
                return (
                  <div key={reply.id} className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleNavigateToProfile(replyUserId)}
                      className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full transition hover:opacity-80"
                    >
                      <Image
                        src={reply.user?.avatarUrl || DEFAULT_AVATAR}
                        alt={reply.user?.username}
                        fill
                        className="object-cover"
                      />
                    </button>
                    <div className="max-w-[85%] rounded-2xl bg-[#f7f3ee] px-3 py-2 text-sm">
                      <button
                        type="button"
                        onClick={() => handleNavigateToProfile(replyUserId)}
                        className="font-semibold text-[#3e2c23] hover:underline"
                      >
                        {reply.user?.username}
                      </button>
                      <p className="break-words text-[#5a4636]">{reply.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  // --------------------------------------------------------

  const CommentForm = (
    <div className="sticky bottom-0 z-20 mt-auto w-full border-t border-[#e8dfd3] bg-white flex flex-col">
      {/* Replying Indicator Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-[#f3eee8] px-4 py-2 text-xs text-[#5a4636]">
          <span>
            Replying to <span className="font-bold">@{replyingTo.username}</span>
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="font-bold text-[#3e2c23] hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}
      <div className="p-4">
        {/* Pass replyingTo.id to the submit handler */}
        <form
          onSubmit={async (e) => {
            await handleCommentSubmit(e, replyingTo?.id);
            setReplyingTo(null); // Clear reply state after submit
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            className="flex-1 rounded-full border border-[#d9cfc3] bg-white px-4 py-2 text-sm outline-none placeholder:text-[#9a8878] focus:border-[#5a4636]"
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentInput.trim()}
            className="rounded-full bg-[#5a4636] px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
          >
            {isSubmittingComment ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Feed Card View */}
      <div className="relative mx-auto w-260 max-w-full overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
        {/* ... (Your original Feed Card Header & Image remain unchanged) ... */}
        <div className="flex items-start justify-between border-b border-[#e8dfd3] p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              <Link href={`/profile/${post.artistId}`}>
                <Image src={post.avatar} alt={post.artist} fill className="rounded-full object-cover" sizes="40px" />
              </Link>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${post.artistId}`} className="text-sm font-medium text-[#3e2c23] hover:underline">
                  {post.artist}
                </Link>
                {isFollowed && !isOwnPost && (
                  <span className="rounded-full bg-[#f3eee8] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5a4636]">
                    Following
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6b5a4d]">{post.time}</p>
            </div>
          </div>
          <div className="relative ml-3" ref={menuRef}>
            <button type="button" onClick={() => setShowMenu((prev) => !prev)} className="rounded-full p-2 text-[#5a4636] transition hover:bg-[#f3eee8]">
              <FaEllipsisH size={15} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[#e8dfd3] bg-white shadow-lg">
                {!isOwnPost && (
                  <button type="button" onClick={handleFollowToggle} className="block w-full px-4 py-3 text-left text-sm text-[#3e2c23] transition hover:bg-[#f7f3ee]">
                    {isFollowed ? "Unfollow" : "Follow"}
                  </button>
                )}
                <Link href={`/profile/${post.artistId}`} onClick={() => setShowMenu(false)} className="block px-4 py-3 text-sm text-[#3e2c23] transition hover:bg-[#f7f3ee]">
                  View profile
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-3 pt-3">
          <p className="text-base font-semibold text-[#3e2c23]">{post.title}</p>
          {post.description && <p className="mt-1 text-sm leading-relaxed text-[#5a4636]">{post.description}</p>}
        </div>

        <div className="border-y border-[#e8dfd3] bg-[#111]">
          <button type="button" onClick={openModal} className="block w-full cursor-zoom-in">
            <div className="relative flex min-h-50 w-full items-center justify-center overflow-hidden bg-[#111]">
              <Image src={post.image} alt="" fill className="scale-110 object-cover opacity-40" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 940px" />
              <div className="absolute inset-0 bg-black/20" />
              <Image src={post.image} alt={post.title} width={1600} height={1600} className="relative z-10 h-auto max-h-[85vh] w-full object-contain" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 940px" />
            </div>
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#3e2c23]">
            <button onClick={handleLikeToggle} className="flex items-center gap-2 transition hover:opacity-80" type="button">
              <FaHeart size={18} className={isLiked ? "text-red-500" : "text-[#3e2c23]"} />
              <span>{likes} Likes</span>
            </button>
            <button onClick={openModal} className="flex items-center gap-2 transition hover:opacity-80" type="button">
              <FaComment size={18} />
              <span>{commentCount} Comments</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4" onClick={closeModal}>
          <div className="relative flex max-h-[95vh] w-full max-w-7xl flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl lg:h-[90vh] lg:flex-row lg:overflow-hidden lg:overflow-y-hidden" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={closeModal} className="fixed left-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl text-white transition hover:bg-black/80 lg:absolute lg:left-4 lg:top-4">
              ×
            </button>

            {/* A. MOBILE LAYOUT */}
            <div className="flex w-full flex-col lg:hidden">
              <div className="relative flex min-h-[300px] w-full items-center justify-center bg-black">
                <Image src={post.image} alt={post.title} width={1800} height={1800} className="h-full w-full object-contain" priority />
              </div>

              <div className="sticky top-0 z-10 border-b border-[#e8dfd3] bg-white p-4">
                {/* ... Profile Header Mobile ... */}
                <button type="button" onClick={() => handleNavigateToProfile(post.artistId)} className="flex w-full items-center gap-3 text-left transition hover:opacity-80">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                    <Image src={post.avatar} alt={post.artist} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#3e2c23] hover:underline">{post.artist}</p>
                    <p className="text-xs text-[#6b5a4d]">{post.time}</p>
                  </div>
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-[#3e2c23]">{post.title}</h3>
                {post.description && <p className="mt-2 text-sm leading-relaxed text-[#5a4636]">{post.description}</p>}

                <div className="mt-4 flex gap-5 border-y border-[#e8dfd3] py-3 text-sm font-medium">
                  <button onClick={handleLikeToggle} className="flex items-center gap-2">
                    <FaHeart className={isLiked ? "text-red-500" : ""} /> {likes} Likes
                  </button>
                  <div className="flex items-center gap-2">
                    <FaComment /> {commentCount} Comments
                  </div>
                </div>

                <div className="mt-6 pb-20">
                   {/* Clean mapping logic called here */}
                  {renderComments()}
                </div>
              </div>
            </div>

            {/* B. DESKTOP LAYOUT */}
            <div className="hidden h-full w-full lg:flex lg:flex-row">
              <div className="relative flex h-full flex-1 items-center justify-center bg-black">
                <Image src={post.image} alt={post.title} width={1800} height={1800} className="h-full w-full object-contain" priority />
              </div>

              <div className="flex h-full w-[420px] flex-col border-l border-[#e8dfd3]">
                <div className="sticky top-0 z-10 border-b border-[#e8dfd3] bg-white p-4">
                  {/* ... Profile Header Desktop ... */}
                  <button type="button" onClick={() => handleNavigateToProfile(post.artistId)} className="flex w-full items-center gap-3 text-left transition hover:opacity-80">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                      <Image src={post.avatar} alt={post.artist} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#3e2c23] hover:underline">{post.artist}</p>
                      <p className="text-xs text-[#6b5a4d]">{post.time}</p>
                    </div>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <h3 className="text-lg font-bold text-[#3e2c23]">{post.title}</h3>
                  {post.description && <p className="mt-2 text-sm leading-relaxed text-[#5a4636]">{post.description}</p>}
                  <div className="mt-4 flex gap-5 border-y border-[#e8dfd3] py-3 text-sm font-medium">
                    <button onClick={handleLikeToggle} className="flex items-center gap-2">
                      <FaHeart className={isLiked ? "text-red-500" : ""} /> {likes} Likes
                    </button>
                    <div className="flex items-center gap-2">
                      <FaComment /> {commentCount} Comments
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    {/* Clean mapping logic called here */}
                    {renderComments()}
                  </div>
                </div>
                {/* 3. Sticky Form for Desktop */}
                {CommentForm}
              </div>
            </div>

            {/* Mobile Sticky Form Placed Correctly Outside the Main Scrolling Container */}
            <div className="fixed bottom-0 left-0 w-full lg:hidden">
              {CommentForm}
            </div>
          </div>
        </div>
      )}
    </>
  );
}