"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaHeart, FaComment, FaEllipsisH } from "react-icons/fa";
import Link from "next/link";

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
};

type Post = {
  id: string;
  image: string;
  title: string;
  description?: string;
  artist: string;
  artistId: string;
  avatar: string;
  likes: number;
  comments: number;
  time: string;
  isFollowed?: boolean;
  isLiked?: boolean;
  commentsPreview?: CommentItem[];
};

export default function ArtCard({ post }: { post: Post }) {
  const [isFollowed, setIsFollowed] = useState(!!post.isFollowed);
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState<CommentItem[]>(
    post.commentsPreview || [],
  );
  const [commentCount, setCommentCount] = useState(post.comments);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPostModal(false);
        setShowMenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
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

  const handleFollowToggle = async () => {
    try {
      const res = await fetch(`/api/users/${post.artistId}/follow`, {
        method: "POST",
        credentials: "include",
      });

      const text = await res.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to toggle follow");
      }

      setIsFollowed(data.isFollowed);
      setShowMenu(false);
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });

      const text = await res.text();

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API did not return JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to toggle like");
      }

      setIsLiked(data.isLiked);
      setLikes(data.likes);
    } catch (error) {
      console.error("Like toggle error:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentInput.trim()) return;

    try {
      setIsSubmittingComment(true);

      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to comment");
      }

      setComments((prev) => [...prev, data.comment]);
      setCommentCount(data.comments);
      setCommentInput("");
    } catch (error) {
      console.error("Comment submit error:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
      <div className="relative mx-auto w-220 max-w-full overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between border-b border-[#e8dfd3] p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              <Link href={`/profile/${post.artistId}`}>
                <Image
                  src={post.avatar}
                  alt={post.artist}
                  fill
                  className="rounded-full object-cover"
                />
              </Link>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.artistId}`}
                  className="text-sm font-medium text-[#3e2c23] hover:underline"
                >
                  {post.artist}
                </Link>

                {isFollowed && (
                  <span className="rounded-full bg-[#f3eee8] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5a4636]">
                    Following
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6b5a4d]">{post.time}</p>
            </div>
          </div>

          <div className="relative ml-3" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="rounded-full p-2 text-[#5a4636] transition hover:bg-[#f3eee8]"
              aria-label="More options"
            >
              <FaEllipsisH size={15} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[#e8dfd3] bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  className="block w-full px-4 py-3 text-left text-sm text-[#3e2c23] transition hover:bg-[#f7f3ee]"
                >
                  {isFollowed ? "Unfollow" : "Follow"}
                </button>

                <Link
                  href={`/profile/${post.artistId}`}
                  onClick={() => setShowMenu(false)}
                  className="block px-4 py-3 text-sm text-[#3e2c23] transition hover:bg-[#f7f3ee]"
                >
                  View profile
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-3 pt-3">
          <p className="text-base font-semibold text-[#3e2c23]">{post.title}</p>
          {post.description && (
            <p className="mt-1 text-sm leading-relaxed text-[#5a4636]">
              {post.description}
            </p>
          )}
        </div>

        <div className="border-y border-[#e8dfd3] bg-[#111]">
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="block w-full cursor-zoom-in"
            aria-label={`View full post of ${post.title}`}
          >
            <div className="relative flex min-h-50 w-full items-center justify-center overflow-hidden bg-[#111]">
              <Image
                src={post.image}
                alt=""
                fill
                aria-hidden="true"
                className="scale-110 object-cover opacity-40"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 940px"
              />

              <div className="absolute inset-0 bg-black/20" />

              <Image
                src={post.image}
                alt={post.title}
                width={1600}
                height={1600}
                className="relative z-10 h-auto max-h-[85vh] w-full object-contain"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 940px"
                priority={false}
              />
            </div>
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#3e2c23]">
            <button
              onClick={handleLikeToggle}
              className="flex items-center gap-2 transition hover:opacity-80"
              type="button"
            >
              <FaHeart
                size={18}
                className={isLiked ? "text-red-500" : "text-[#3e2c23]"}
              />
              <span>{likes} Likes</span>
            </button>

            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 transition hover:opacity-80"
              type="button"
            >
              <FaComment size={18} />
              <span>{commentCount} Comments</span>
            </button>
          </div>
        </div>
      </div>

      {showPostModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setShowPostModal(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="relative flex h-[95vh] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl text-white transition hover:bg-black/80"
                aria-label="Close modal"
              >
                ×
              </button>

              <div className="flex h-full w-full flex-col lg:flex-row">
                <div className="relative flex min-h-[280px] flex-1 items-center justify-center bg-black lg:min-h-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={1800}
                    height={1800}
                    className="h-full max-h-[95vh] w-full object-contain"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                </div>

                <div className="flex w-full flex-col border-t border-[#e8dfd3] lg:w-[420px] lg:border-l lg:border-t-0">
                  <div className="border-b border-[#e8dfd3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src={post.avatar}
                            alt={post.artist}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#3e2c23]">
                              {post.artist}
                            </p>

                            {isFollowed && (
                              <span className="rounded-full bg-[#f3eee8] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5a4636]">
                                Following
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#6b5a4d]">{post.time}</p>
                        </div>
                      </div>

                      <div className="relative" ref={menuRef}>
                        <button
                          type="button"
                          onClick={() => setShowMenu((prev) => !prev)}
                          className="rounded-full p-2 text-[#5a4636] transition hover:bg-[#f3eee8]"
                          aria-label="More options"
                        >
                          <FaEllipsisH size={15} />
                        </button>

                        {showMenu && (
                          <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-[#e8dfd3] bg-white shadow-lg">
                            <button
                              type="button"
                              onClick={handleFollowToggle}
                              className="block w-full px-4 py-3 text-left text-sm text-[#3e2c23] transition hover:bg-[#f7f3ee]"
                            >
                              {isFollowed ? "Unfollow" : "Follow"}
                            </button>

                            <Link
                              href={`/profile/${post.artistId}`}
                              onClick={() => setShowMenu(false)}
                              className="block px-4 py-3 text-sm text-[#3e2c23] transition hover:bg-[#f7f3ee]"
                            >
                              View profile
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-[#e8dfd3] px-4 py-4">
                    <h3 className="text-lg font-bold text-[#3e2c23]">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[#5a4636]">
                        {post.description}
                      </p>
                    )}
                  </div>

                  <div className="border-b border-[#e8dfd3] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#3e2c23]">
                      <button
                        onClick={handleLikeToggle}
                        className="flex items-center gap-2 transition hover:opacity-80"
                        type="button"
                      >
                        <FaHeart
                          size={18}
                          className={isLiked ? "text-red-500" : "text-[#3e2c23]"}
                        />
                        <span>{likes} Likes</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <FaComment size={18} />
                        <span>{commentCount} Comments</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <p className="text-sm text-[#6b5a4d]">
                          No comments yet.
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start gap-2"
                          >
                            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={comment.user.avatarUrl || "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg"}
                                alt={comment.user.username}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>

                            <div className="max-w-[85%] rounded-2xl bg-[#f7f3ee] px-3 py-2">
                              <p className="text-sm font-semibold text-[#3e2c23]">
                                {comment.user.username}
                              </p>
                              <p className="break-words text-sm text-[#5a4636]">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#e8dfd3] p-4">
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-full border border-[#d9cfc3] bg-white px-4 py-2 text-sm text-[#3e2c23] outline-none placeholder:text-[#9a8878] focus:border-[#5a4636]"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment}
                        className="rounded-full bg-[#5a4636] px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingComment ? "Posting..." : "Post"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}