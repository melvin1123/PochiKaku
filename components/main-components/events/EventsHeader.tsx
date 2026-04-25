"use client";

type EventsHeaderProps = {
  onCreate?: () => void;
};

export default function EventsHeader({ onCreate }: EventsHeaderProps) {
  return (
    <div className="mb-6 ml-8 mr-8 mt-5 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">Events & Challenges</h2>
        <p className="mt-1 text-[#5a4636]">
          Join community events and showcase your creativity.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        disabled={!onCreate}
        className="flex items-center gap-2 rounded-lg bg-[#3e2c23] px-4 py-2 text-[#f5efe6] transition hover:bg-[#5a4636] disabled:cursor-not-allowed disabled:opacity-60"
      >
        + Create Event
      </button>
    </div>
  );
}