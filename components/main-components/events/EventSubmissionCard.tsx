"use client";

import Image from "next/image";
import type { EventSubmission } from "@/app/types/eventSubmission";

type EventSubmissionCardProps = {
  submission: EventSubmission;
  onClick: () => void;
};

export default function EventSubmissionCard({
  submission,
  onClick,
}: EventSubmissionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full overflow-hidden rounded-2xl bg-white text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative w-full overflow-hidden bg-[#111]">
        <Image
          src={submission.post.imageUrl}
          alt={submission.post.title ?? submission.caption ?? "Submission"}
          width={1600}
          height={1600}
          className="h-auto w-full object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <div className="flex border-t border-[#e8dfd3] px-4 py-3">
        <p className="line-clamp-2 text-sm font-semibold text-[#3e2c23] sm:text-base">
          {submission.post.title ?? "Untitled Submission"}
        </p>

        <p className="ml-auto text-xs text-[#8a6f5a] sm:text-sm">
          {submission.user.username}
        </p>
      </div>
    </button>
  );
}