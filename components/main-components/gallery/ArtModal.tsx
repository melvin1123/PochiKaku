"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, Disclosure } from "@headlessui/react";
import Image from "next/image";
import { FaHeart, FaComment, FaTimes, FaChevronDown, FaReply } from "react-icons/fa";

import { GalleryItem } from "@/app/types/gallery"; 
import { CommentItem } from "@/app/types/comment";
import { NestedComment, nestComments } from "@/app/utils/comments";

interface ArtModalProps {
  art: GalleryItem | null;
  onClose: () => void;
  onChangeArt: (art: GalleryItem) => void;
  moreArtworks?: GalleryItem[];
}

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
            src={comment.user?.avatarUrl || "/default-avatar.jpg"} 
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

        {/* View/Hide Toggle - ONLY shows if there are replies */}
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
        <div className="mt-2 flex flex-col gap-1 ml-6 sm:ml-11 border-l-2 border-[#e8dfd3] pl-3">
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

export default function ArtModal({ art, onClose, onChangeArt, moreArtworks = [] }: ArtModalProps) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  // Sync state and FETCH FULL COMMENTS
  useEffect(() => {
    if (!art) return;
    setLikes(art.likes);
    setIsLiked(art.isLiked ?? false);
    setReplyingTo(null);

    // Set initial preview while loading the full thread
    const preview = (art.commentsPreview ?? []).map(c => ({
      ...c,
      id: String(c.id),
      parentId: c.parentId ? String(c.parentId) : null
    }));
    setComments(preview);

    const fetchFullThread = async () => {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${art.id}/comments`);
        const data = await res.json();
        if (data.comments) {
          // Force string IDs to prevent nesting failures
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

  // The Memoized Tree - Extra safety layer here
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
      <Dialog.Panel className="relative flex h-full w-full flex-col bg-white md:flex-row md:overflow-hidden">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition">
          <FaTimes size={20} />
        </button>

        {/* LEFT: Art Image */}
        <div className="relative flex h-[45dvh] w-full items-center justify-center bg-black md:h-full md:flex-1">
          <Image src={art.image} alt={art.title} fill className="object-contain" priority sizes="(max-width: 768px) 100vw, 60vw" />
        </div>

        {/* RIGHT: Sidebar */}
        <div className="flex h-[55dvh] w-full flex-col border-l border-[#e8dfd3] md:h-full md:w-[450px]">
          
          <div className="border-b border-[#e8dfd3] p-4 bg-[#fbf9f7]/50">
            <h2 className="text-xl font-black text-[#3e2c23]">{art.title}</h2>
            <p className="mt-1 text-sm text-[#5a4636] line-clamp-2">{art.description}</p>
            <div className="mt-4 flex gap-6 text-sm font-bold text-[#3e2c23]">
              <div className="flex items-center gap-2"><FaHeart className={isLiked ? "text-red-500" : ""} /> {likes}</div>
              <div className="flex items-center gap-2">
                <FaComment /> {isLoadingComments ? "..." : comments.length}
              </div>
            </div>
          </div>

          {/* MORE FROM ARTIST */}
          {moreArtworks.length > 0 && (
            <div className="border-b border-[#e8dfd3] bg-[#fbf9f7]">
              <div className="hidden p-4 md:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a8878] mb-3">More from Artist</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {moreArtworks.map((item) => (
                    <button 
                      key={String(item.id)} 
                      onClick={() => onChangeArt(item)} 
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${art.id === item.id ? 'border-[#3e2c23] scale-95' : 'border-transparent hover:scale-105'}`}
                    >
                      <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:hidden">
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#9a8878]">
                        <span>More from Artist</span>
                        <FaChevronDown className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pb-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                          {moreArtworks.map((item) => (
                            <button 
                              key={String(item.id)} 
                              onClick={() => onChangeArt(item)} 
                              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${art.id === item.id ? 'border-[#3e2c23]' : 'border-transparent'}`}
                            >
                              <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                            </button>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
          )}

          {/* COMMENTS AREA */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
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
          <div className="mt-auto border-t border-[#e8dfd3] bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            {replyingTo && (
              <div className="mb-2 flex items-center justify-between bg-[#f7f3ee] px-3 py-1.5 rounded-lg text-[11px]">
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