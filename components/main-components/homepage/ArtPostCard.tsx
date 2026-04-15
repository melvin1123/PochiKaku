"use client";

import Image from "next/image";
import { useState } from "react";
import { FaHeart, FaComment, FaEllipsisH } from "react-icons/fa";

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
  const [comments, setComments] = useState<CommentItem[]>(post.commentsPreview || []);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleFollowToggle = async () => {
  try {
    const res = await fetch(`/api/users/${post.artistId}/follow`, {
      method: "POST",
      credentials: "include",
    });

    const text = await res.text();
    console.log("Follow API raw response:", text);

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
    console.log("Like API raw response:", text);

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
      setShowComments(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="relative w-[940px] max-w-full rounded-2xl bg-[#f5efe6] shadow-md hover:shadow-lg overflow-hidden flex flex-col">
      <div className="flex flex-col border-b border-[#e8dfd3] p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
              <Image src={post.avatar} alt={post.artist} fill className="object-cover" />
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium text-[#3e2c23]">{post.artist}</p>
              <p className="text-xs text-[#5a4636]">{post.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFollowToggle}
              className={`rounded-full border px-2 py-1 text-xs font-medium ${
                isFollowed
                  ? "border-[#5a4636] bg-[#5a4636] text-white"
                  : "border-[#5a4636] bg-white text-[#5a4636]"
              }`}
            >
              {isFollowed ? "Following" : "Follow"}
            </button>

            <button className="rounded-full p-1 hover:bg-gray-200">
              <FaEllipsisH size={16} />
            </button>
          </div>
        </div>

        <p className="text-base font-semibold text-[#3e2c23]">{post.title}</p>
      </div>

      <div className="relative h-[520px] w-full border-b border-[#e8dfd3]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-contain"
        />
      </div>

      <div className="p-3">
        <div className="mb-2 flex gap-5 text-base text-[#3e2c23]">
          <button
            onClick={handleLikeToggle}
            className="flex items-center gap-1"
          >
            <FaHeart
              size={18}
              className={isLiked ? "text-red-500" : "text-[#3e2c23]"}
            />
            {likes} Likes
          </button>

          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1"
          >
            <FaComment size={18} />
            {commentCount} Comments
          </button>
        </div>

        {showComments && (
          <div className="mt-3 rounded-xl border border-[#e8dfd3] bg-white p-3">
            <div className="max-h-56 space-y-3 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-[#5a4636]">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={comment.user.avatarUrl}
                        alt={comment.user.username}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="rounded-2xl bg-[#f5efe6] px-3 py-2">
                      <p className="text-sm font-semibold text-[#3e2c23]">
                        {comment.user.username}
                      </p>
                      <p className="text-sm text-[#5a4636]">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-[#d9cfc3] px-4 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="rounded-full bg-[#5a4636] px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}