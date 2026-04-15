"use client";

import { useEffect, useMemo, useState } from "react";

const MAX_REFERENCE_IMAGES = 7;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

type EventStatus = "Ongoing" | "Upcoming" | "Ended";

interface CreatedEvent {
  id: string;
  title: string;
  description: string;
  img: string;
  date: string;
  status: EventStatus;
  startDate: string;
  deadline: string;
  referenceImages: Array<{ id: string; imageUrl: string }>;
}

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (event: CreatedEvent) => void;
}

const initialForm = {
  title: "",
  description: "",
  startDate: "",
  deadline: "",
};

export default function EventCreationModal({
  isOpen,
  onClose,
  onCreated,
}: EventCreationModalProps) {
  const [form, setForm] = useState(initialForm);
  const [backdropImage, setBackdropImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [backdropPreview, setBackdropPreview] = useState("");
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setBackdropImage(null);
      setReferenceImages([]);
      setBackdropPreview("");
      setReferencePreviews([]);
      setSubmitting(false);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!backdropImage) {
      setBackdropPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(backdropImage);
    setBackdropPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [backdropImage]);

  useEffect(() => {
    if (!referenceImages.length) {
      setReferencePreviews([]);
      return;
    }

    const objectUrls = referenceImages.map((file) => URL.createObjectURL(file));
    setReferencePreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [referenceImages]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim() &&
      form.description.trim() &&
      form.startDate &&
      form.deadline &&
      backdropImage,
    );
  }, [form, backdropImage]);

  function updateField<K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSubmit || !backdropImage) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("startDate", form.startDate);
      payload.append("deadline", form.deadline);
      payload.append("backdropImage", backdropImage);

      referenceImages.forEach((file) => {
        payload.append("referenceImages", file);
      });

      const response = await fetch("/api/events", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create event.");
      }

      onCreated(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  }

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
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8a7768] focus:border-[#8b6b57] sm:text-base"
              />

              <textarea
                placeholder="Event description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-32 w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8a7768] focus:border-[#8b6b57] sm:min-h-36 sm:text-base"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5a4636]">
                  Backdrop image
                </label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;

                    if (!file) {
                      setBackdropImage(null);
                      return;
                    }

                    if (!ALLOWED_TYPES.includes(file.type)) {
                      setError("Backdrop image must be PNG or JPG.");
                      return;
                    }

                    if (file.size > MAX_FILE_SIZE) {
                      setError("Backdrop image must be 15MB or smaller.");
                      return;
                    }

                    setError("");
                    setBackdropImage(file);
                  }}
                  className="block w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#3e2c23] file:px-3 file:py-2 file:text-sm file:text-[#f5efe6]"
                />
              </div>

              {backdropPreview ? (
                <div className="overflow-hidden rounded-xl border border-[#cdbca7] bg-white">
                  <img
                    src={backdropPreview}
                    alt="Backdrop preview"
                    className="h-44 w-full object-cover sm:h-56"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5a4636]">
                    Start date
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
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
                    onChange={(e) => updateField("deadline", e.target.value)}
                    className="w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b6b57] sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5a4636]">
                  Reference images (optional)
                </label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);

                    if (files.length > MAX_REFERENCE_IMAGES) {
                      setError(
                        `You can upload up to ${MAX_REFERENCE_IMAGES} reference images only.`,
                      );
                      return;
                    }

                    for (const file of files) {
                      if (!ALLOWED_TYPES.includes(file.type)) {
                        setError("Reference images must be PNG or JPG only.");
                        return;
                      }

                      if (file.size > MAX_FILE_SIZE) {
                        setError(
                          "Each reference image must be 15MB or smaller.",
                        );
                        return;
                      }
                    }

                    setError("");
                    setReferenceImages(files);
                  }}
                  className="block w-full rounded-lg border border-[#cdbca7] bg-white px-4 py-3 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#3e2c23] file:px-3 file:py-2 file:text-sm file:text-[#f5efe6]"
                />
              </div>

              {referencePreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {referencePreviews.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="overflow-hidden rounded-xl border border-[#cdbca7] bg-white"
                    >
                      <img
                        src={url}
                        alt={`Reference preview ${index + 1}`}
                        className="h-28 w-full object-cover sm:h-32"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 mt-6 flex flex-col-reverse gap-3 border-t border-[#dccfbe] bg-[#f5efe6] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full rounded-lg border border-[#b8a28d] px-4 py-2.5 text-sm text-[#5a4636] transition disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full rounded-lg bg-[#3e2c23] px-5 py-2.5 text-sm text-[#f5efe6] transition hover:bg-[#5a4636] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
