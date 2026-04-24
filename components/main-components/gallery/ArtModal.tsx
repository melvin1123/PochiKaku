"use client";

import { Dialog } from "@headlessui/react";
import { FaHeart, FaComment } from "react-icons/fa";
import { useEffect, useState } from "react";
import { GalleryItem } from "./GalleryGrid";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
};

type Art = {
  id: string;
  title: string;
  description: string;
  artist: string;
  artistId: string;
  img: string;
  likes: number;
  comments: Comment[];
};

interface ArtModalProps {
  art: GalleryItem | null;
  onClose: () => void;
  onChangeArt: (art: GalleryItem) => void;
  moreArtworks?: GalleryItem[];
}

export default function ArtModal({
  art,
  onClose,
  onChangeArt,
  moreArtworks = [],
}: ArtModalProps) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (art) {
      setLikes(art.likes);
      setComments(art.comments);
      setIsLiked(false); // or derive from API later
    }
  }, [art]);

  // ❤️ LIKE TOGGLE
  const handleLike = async () => {
    if (!art) return;

    try {
      const res = await fetch(`/api/posts/${art.id}/like`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      setIsLiked(data.liked);
      setLikes(data.likes);
    } catch {
      console.error("Like failed");
    }
  };

  // 💬 COMMENT SUBMIT
  const handleComment = async () => {
    if (!art || !newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/${art.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    } catch {
      console.error("Comment failed");
    }
  };

  if (!art) return null;

  return (
    <Dialog
      open={!!art}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <Dialog.Panel className="relative w-full max-w-6xl h-[90vh] bg-[#f5efe6] rounded-2xl overflow-hidden flex flex-col md:flex-row">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center"
        >
          ✕
        </button>

        {/* LEFT IMAGE */}
        <div className="md:w-[60%] w-full bg-black flex items-center justify-center">
          <img
            src={art.img}
            alt={art.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* CENTER */}
        <div className="md:w-[30%] w-full flex flex-col border-l border-[#e8dfd3] text-[#3e2c23]">

          {/* HEADER */}
          <div className="p-4 border-b border-[#e8dfd3]">
            <h2 className="font-bold text-lg">{art.title}</h2>
            <p className="text-sm text-[#5a4636]">by {art.artist}</p>
            <p className="text-sm mt-2 text-[#5a4636]">{art.description}</p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-5 p-4 border-b border-[#e8dfd3]">
            <button
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

          {/* COMMENTS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-[#5a4636]">
                No comments yet.
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <img
                    src={c.user.avatarUrl}
                    className="w-7 h-7 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {c.user.username}
                    </p>
                    <p className="text-sm text-[#5a4636]">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* COMMENT INPUT */}
          <div className="border-t border-[#e8dfd3] p-3 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-[#d6c3a3] rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleComment}
              className="bg-[#3e2c23] text-white px-3 rounded-lg"
            >
              Post
            </button>
          </div>
        </div>

        {/* RIGHT (HIDDEN ON SMALL SCREENS) */}
        <div className="hidden md:block md:w-[10%] border-l border-[#e8dfd3] p-3 overflow-y-auto">
          <p className="text-xs font-semibold mb-2">
            More from artist
          </p>

          <div className="space-y-2">
            {moreArtworks.map((item) => (
              <div
                key={item.id}
                onClick={() => onChangeArt(item)} // 🔥 SWITCH MODAL CONTENT
                className="aspect-square cursor-pointer overflow-hidden rounded-md"
              >
                <img
                  src={item.img}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </div>
            ))}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}