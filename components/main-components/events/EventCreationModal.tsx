"use client";

import Image from "next/image";
import { MAX_REFERENCE_IMAGES } from "@/app/logic/eventCreationLogic";
import { useEventCreationModal } from "@/app/hooks/events/useEventCreationModal";
import type { EventItem } from "@/app/types/event";

type EventCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (event: EventItem) => void;
};

export default function EventCreationModal({
  isOpen,
  onClose,
  onCreated,
}: EventCreationModalProps) {
  const {
    form,
    backdropPreview,
    referencePreviews,
    submitting,
    error,
    canSubmit,
    updateField,
    handleBackdropChange,
    handleReferenceImagesChange,
    handleSubmit,
  } = useEventCreationModal({
    isOpen,
    onClose,
    onCreated,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="flex min-h-dvh items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#f5efe6] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#dccfbe] px-4 py-4 sm:px-6">
            <h3 className="pr-4 text-lg font-bold text-[#3e2c23] sm:text-xl md:text-2xl">
              Create Event
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-[#5a4636] transition hover:bg-[#e8dfd3]"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
          >
            <div className="space-y-4 sm:space-y-5">
              <input
                type="text"
                placeholder="Event title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8a7768] focus:border-[#8b6b57] sm:text-base"
              />

              <textarea
                placeholder="Event description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="min-h-32 w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8a7768] focus:border-[#8b6b57] sm:min-h-36 sm:text-base"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5a4636]">
                  Backdrop image
                </label>

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={handleBackdropChange}
                  className="block w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#3e2c23] file:px-3 file:py-2 file:text-sm file:text-[#f5efe6]"
                />
              </div>

              {backdropPreview && (
                <div className="relative h-44 overflow-hidden rounded-xl border border-[#cdbca7] bg-white sm:h-56">
                  <Image
                    src={backdropPreview}
                    alt="Backdrop preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5a4636]">
                    Start date
                  </label>

                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    className="w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b6b57] sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5a4636]">
                    Deadline
                  </label>

                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(event) =>
                      updateField("deadline", event.target.value)
                    }
                    className="w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b6b57] sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5a4636]">
                  Reference images optional, max {MAX_REFERENCE_IMAGES}
                </label>

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  multiple
                  onChange={handleReferenceImagesChange}
                  className="block w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#3e2c23] file:px-3 file:py-2 file:text-sm file:text-[#f5efe6]"
                />
              </div>

              {referencePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {referencePreviews.map((previewUrl) => (
                    <div
                      key={previewUrl}
                      className="relative h-28 overflow-hidden rounded-xl border border-[#cdbca7] bg-white"
                    >
                      <Image
                        src={previewUrl}
                        alt="Reference preview"
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#dccfbe] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#b8a28d] px-4 py-2.5 text-sm font-medium text-[#5a4636] transition hover:bg-[#eadfd2]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="rounded-lg bg-[#3e2c23] px-4 py-2.5 text-sm font-medium text-[#f5efe6] transition hover:bg-[#5a4636] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}