"use client";

interface EventCardProps {
  title: string;
  description: string;
  img: string;
  date: string;
  status: "Ongoing" | "Upcoming" | "Ended";
  onView?: () => void;
  onJoin?: () => void;
}

export default function EventCard({
  title,
  description,
  img,
  date,
  status,
  onView,
  onJoin,
}: EventCardProps) {
  const statusClasses =
    status === "Ongoing"
      ? "bg-green-500 text-white"
      : status === "Upcoming"
      ? "bg-blue-500 text-white"
      : "bg-gray-400 text-white";

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
    onJoin?.();
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
        <img
          src={img}
          alt={title}
          className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-48 md:h-52"
        />

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
        </div>

        <button
          type="button"
          onClick={handleJoinClick}
          className="mt-4 rounded-xl bg-[#3e2c23] px-4 py-2.5 text-sm font-medium text-[#f5efe6] transition hover:bg-[#5a4636] focus:outline-none focus:ring-2 focus:ring-[#3e2c23] focus:ring-offset-2"
        >
          Join Event
        </button>
      </div>
    </div>
  );
}
