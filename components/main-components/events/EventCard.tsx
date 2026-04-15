"use client";

import Image from "next/image";

interface EventParticipant {
  id: string;
  username: string;
}

interface EventCardProps {
  title: string;
  description: string;
  img: string;
  date: string;
  status: "Ongoing" | "Upcoming" | "Ended";
  participants?: EventParticipant[];
  onView?: () => void;
  onJoin?: () => void;
  joining?: boolean;
  joined?: boolean;
}

export default function EventCard({
  title,
  description,
  img,
  date,
  status,
  participants = [],
  onView,
  onJoin,
  joining = false,
  joined = false,
}: EventCardProps) {
  const isEnded = status === "Ended";
  const isJoinDisabled = joining || joined || isEnded || !onJoin;

  const statusClasses =
    status === "Ongoing"
      ? "bg-green-500 text-white"
      : status === "Upcoming"
        ? "bg-blue-500 text-white"
        : "bg-gray-400 text-white";

  const visibleParticipants = participants.slice(0, 4);
  const remainingCount = participants.length - visibleParticipants.length;

  function handleCardClick() {
    onView?.();
  }

  function handleCardKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onView?.();
    }
  }

  function handleJoinClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (isJoinDisabled) return;
    onJoin?.();
  }

  function getButtonText() {
    if (joining) return "Joining...";
    if (joined) return "Already Joined";
    if (isEnded) return "Event Ended";
    return "Join Event";
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#e8dfd3] shadow transition duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#3e2c23] focus:ring-offset-2"
      aria-label={`View event ${title}`}
    >
      <div className="relative overflow-hidden">
        <div className="relative h-44 w-full sm:h-48 md:h-52">
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow ${statusClasses}`}
        >
          {status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h4 className="line-clamp-2 text-base font-semibold text-[#3e2c23] sm:text-lg">
            {title}
          </h4>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5a4636]">
            {description}
          </p>

          <p className="mt-3 text-xs text-[#5a4636] sm:text-sm">📅 {date}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a5d49]">
              Participants
            </p>

            {participants.length > 0 ? (
              <div className="flex items-center">
                {visibleParticipants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="-ml-2 first:ml-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e8dfd3] bg-[#3e2c23] text-[11px] font-semibold text-[#f5efe6] shadow-sm"
                    style={{ zIndex: visibleParticipants.length - index }}
                    title={participant.username}
                  >
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                ))}

                {remainingCount > 0 ? (
                  <div className="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-[#e8dfd3] bg-[#c9b39c] px-1.5 text-[11px] font-semibold text-[#3e2c23] shadow-sm">
                    +{remainingCount}
                  </div>
                ) : null}
              </div>
            ) : (
              <span className="text-xs text-[#8a6f5a]">None</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleJoinClick}
          disabled={isJoinDisabled}
          className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#3e2c23] focus:ring-offset-2 ${
            isJoinDisabled
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-[#3e2c23] text-[#f5efe6] hover:bg-[#5a4636]"
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}
