"use client";

import { useEffect } from "react";
import Image from "next/image";

interface EventReferenceImage {
  id: string;
  imageUrl: string;
}

interface EventParticipant {
  id: string;
  username: string;
}

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    description: string;
    img: string;
    date: string;
    status: "Ongoing" | "Upcoming" | "Ended";
    referenceImages?: EventReferenceImage[];
    participants?: EventParticipant[];
  } | null;
  onJoin?: () => void;
  hasJoined?: boolean;
  isJoining?: boolean;
}

export default function ViewEventModal({
  isOpen,
  onClose,
  event,
  onJoin,
  hasJoined = false,
  isJoining = false,
}: ViewEventModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const isEnded = event.status === "Ended";
  const isJoinDisabled = !onJoin || isEnded || hasJoined || isJoining;

  const statusClasses =
    event.status === "Ongoing"
      ? "bg-green-100 text-green-700 border border-green-200"
      : event.status === "Upcoming"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : "bg-gray-200 text-gray-700 border border-gray-300";

  const getJoinButtonText = () => {
    if (isJoining) return "Joining...";
    if (hasJoined) return "Already Joined";
    if (isEnded) return "Event Ended";
    return "Join Event";
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-dvh items-center justify-center p-3 sm:p-4 md:p-6">
        <div
          className="relative flex max-h-[95dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#dccfbe] bg-[#f5efe6] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#dccfbe] bg-[#f5efe6] px-4 py-4 sm:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6f5a]">
                Event Details
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#3e2c23] sm:text-xl">
                {event.title}
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

          <div className="flex-1 overflow-y-auto">
            <div className="relative h-56 w-full sm:h-72 md:h-80">
              <Image
                src={event.img}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="rounded-2xl bg-black/30 px-4 py-3 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-white sm:text-2xl">
                    {event.title}
                  </h4>
                  <p className="mt-1 text-sm text-white/90 sm:text-base">
                    📅 {event.date}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusClasses}`}
                >
                  {event.status}
                </span>
              </div>
            </div>

            <div className="space-y-6 p-4 sm:p-6">
              <div className="rounded-2xl border border-[#dccfbe] bg-[#f8f2ea] p-4 sm:p-5">
                <h5 className="text-sm font-semibold uppercase tracking-wide text-[#7a5d49]">
                  Description
                </h5>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5a4636] sm:text-base">
                  {event.description}
                </p>
              </div>

              <div className="rounded-2xl border border-[#dccfbe] bg-[#f8f2ea] p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="text-sm font-semibold uppercase tracking-wide text-[#7a5d49]">
                    Participants
                  </h5>
                  <span className="text-xs text-[#8a6f5a]">
                    {event.participants?.length ?? 0} joined
                  </span>
                </div>

                {event.participants && event.participants.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {event.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b8] bg-[#efe5d8] px-3 py-2 text-sm text-[#5a4636]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3e2c23] text-xs font-semibold text-[#f5efe6]">
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{participant.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8a6f5a]">
                    No participants yet.
                  </p>
                )}
              </div>

              {event.referenceImages && event.referenceImages.length > 0 ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h5 className="text-sm font-semibold uppercase tracking-wide text-[#7a5d49]">
                      Reference Images
                    </h5>
                    <span className="text-xs text-[#8a6f5a]">
                      {event.referenceImages.length} image
                      {event.referenceImages.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {event.referenceImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-2xl border border-[#cdbca7] bg-[#efe5d8]"
                      >
                        <div className="relative h-32 w-full sm:h-36">
                          <Image
                            src={image.imageUrl}
                            alt={`Reference image ${index + 1}`}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d7c8b8] bg-[#f8f2ea] p-5 text-center text-sm text-[#8a6f5a]">
                  No reference images available for this event.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#dccfbe] bg-[#f3eadd] px-4 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#b8a28d] px-4 py-2.5 text-sm font-medium text-[#5a4636] transition hover:bg-[#eadfd2]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={onJoin}
                disabled={isJoinDisabled}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isJoinDisabled
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-[#3e2c23] text-[#f5efe6] hover:bg-[#5a4636]"
                }`}
              >
                {getJoinButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
