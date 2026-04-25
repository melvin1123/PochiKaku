"use client";

import { useEventSubmissionModal } from "@/app/hooks/events/useEventSubmissionModal";
import type { EventSubmission } from "@/app/types/eventSubmission";

type EventSubmissionDetailsModalProps = {
  submission: EventSubmission | null;
  isOpen: boolean;
  onClose: () => void;
};

type EventSubmissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSubmitted?: (submission: EventSubmission) => void;
};

export default function EventSubmissionModal({
  isOpen,
  onClose,
  eventId,
  onSubmitted,
}: EventSubmissionModalProps) {
  const {
    title,
    description,
    caption,
    isSubmitting,
    setTitle,
    setDescription,
    setCaption,
    handleFileChange,
    handleModalClick,
    handleSubmit,
  } = useEventSubmissionModal({
    isOpen,
    onClose,
    eventId,
    onSubmitted,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-dvh items-center justify-center p-3 sm:p-4 md:p-6">
        <div
          className="relative w-full max-w-2xl rounded-3xl border border-[#dccfbe] bg-[#f5efe6] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          onClick={handleModalClick}
        >
          <div className="flex items-center justify-between border-b border-[#dccfbe] px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6f5a]">
                Event Submission
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#3e2c23] sm:text-xl">
                Submit Your Artwork
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c8b8] bg-[#efe5d8] text-lg text-[#5a4636] transition hover:bg-[#e5d8c8]"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5a4636]">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Artwork title"
                className="w-full rounded-xl border border-[#d9cfc3] bg-white px-4 py-3 text-sm text-[#3e2c23] outline-none placeholder:text-[#9a8878] focus:border-[#5a4636]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5a4636]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell us about your artwork"
                rows={4}
                className="w-full rounded-xl border border-[#d9cfc3] bg-white px-4 py-3 text-sm text-[#3e2c23] outline-none placeholder:text-[#9a8878] focus:border-[#5a4636]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5a4636]">
                Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Short submission caption"
                className="w-full rounded-xl border border-[#d9cfc3] bg-white px-4 py-3 text-sm text-[#3e2c23] outline-none placeholder:text-[#9a8878] focus:border-[#5a4636]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5a4636]">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full rounded-xl border border-[#d9cfc3] bg-white px-4 py-3 text-sm text-[#3e2c23] outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#5a4636] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#6b5444]"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#b8a28d] px-4 py-2.5 text-sm font-medium text-[#5a4636] transition hover:bg-[#eadfd2]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#3e2c23] px-4 py-2.5 text-sm font-medium text-[#f5efe6] transition hover:bg-[#5a4636] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Artwork"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}