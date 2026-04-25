"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import type { EventSubmission } from "@/app/types/eventSubmission";

type EventSubmissionDetailsModalProps = {
  submission: EventSubmission | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function EventSubmissionDetailsModal({
  submission,
  isOpen,
  onClose,
}: EventSubmissionDetailsModalProps) {
  if (!isOpen || !submission) return null;

  const handleModalClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white"
        onClick={handleModalClick}
      >
        <div className="relative flex-1 bg-black">
          <Image
            src={submission.post.imageUrl}
            alt={submission.post.title ?? "Submission"}
            width={1600}
            height={1600}
            className="h-full w-full object-contain"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        </div>

        <div className="w-full max-w-sm p-5">
          <button
            type="button"
            onClick={onClose}
            className="mb-4 rounded-lg bg-[#3e2c23] px-3 py-2 text-white"
          >
            Close
          </button>

          <h2 className="text-xl font-bold text-[#3e2c23]">
            {submission.post.title ?? "Untitled Submission"}
          </h2>

          <p className="mt-1 text-sm text-[#8a6f5a]">
            by {submission.user.username}
          </p>

          {submission.caption && (
            <p className="mt-4 text-sm text-[#5a4636]">
              {submission.caption}
            </p>
          )}

          {submission.post.description && (
            <p className="mt-4 text-sm text-[#5a4636]">
              {submission.post.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}