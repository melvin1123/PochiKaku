"use client";

interface EventCardProps {
  title: string;
  description: string;
  img: string;
  date: string;
  status: "Ongoing" | "Upcoming" | "Ended";
}

export default function EventCard({ title, description, img, date, status }: EventCardProps) {
  const statusClasses =
    status === "Ongoing"
      ? "bg-green-500 text-white"
      : status === "Upcoming"
      ? "bg-blue-500 text-white"
      : "bg-gray-400 text-white";

  return (
    <div className="bg-[#e8dfd3] rounded-lg overflow-hidden shadow hover:shadow-lg transition transform hover:scale-105 flex flex-col">
      {/* Banner */}
      <div className="relative">
        <img src={img} alt={title} className="w-full h-40 object-cover" />
        <span className={`absolute top-2 left-2 px-3 py-1 text-xs rounded-full font-semibold ${statusClasses}`}>
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-sm text-[#5a4636] mt-1 flex-1">{description}</p>
        <p className="text-xs text-[#5a4636] mt-3">📅 {date}</p>
        <button className="mt-4 py-2 rounded-lg bg-[#3e2c23] text-[#f5efe6] hover:bg-[#5a4636] transition">
          Join Event
        </button>
      </div>
    </div>
  );
}