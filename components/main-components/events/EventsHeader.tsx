"use client";

interface EventsHeaderProps {
  onCreate?: () => void;
}

export default function EventsHeader({ onCreate }: EventsHeaderProps) {
  return (
    <div className="flex justify-between items-center mt-5 ml-8 mb-6 mr-8">
      <div>
        <h2 className="text-3xl font-bold">Events & Challenges</h2>
        <p className="text-[#5a4636] mt-1">Join community events and showcase your creativity.</p>
      </div>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2c23] text-[#f5efe6] hover:bg-[#5a4636] transition"
      >
        + Create Event
      </button>
    </div>
  );
}