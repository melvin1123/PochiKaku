"use client";

import { useState } from "react";
import EventSubmissionCard from "./EventSubmissionCard";
import EventSubmissionDetailsModal from "./EventSubmissionDetailsModal";
import type { EventSubmission } from "@/app/types/eventSubmission";

type EventSubmissionsSectionProps = {
  submissions: EventSubmission[];
};

export default function EventSubmissionsSection({
  submissions,
}: EventSubmissionsSectionProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<EventSubmission | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#3e2c23]">Submissions</h2>

        <span className="text-sm text-[#8a6f5a]">
          {submissions.length} entries
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d7c8b8] bg-[#f8f2ea] p-6 text-center text-sm text-[#8a6f5a]">
          No submissions yet.
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="mb-6 break-inside-avoid">
              <EventSubmissionCard
                submission={submission}
                onClick={() => setSelectedSubmission(submission)}
              />
            </div>
          ))}
        </div>
      )}

      <EventSubmissionDetailsModal
        submission={selectedSubmission}
        isOpen={selectedSubmission !== null}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}