"use client";

interface EventReferenceImage {
  id: string;
  imageUrl: string;
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
  } | null;
  onJoin?: () => void;
}

export default function ViewEventModal({
  isOpen,
  onClose,
  event,
  onJoin,
}: ViewEventModalProps) {
  if (!isOpen || !event) return null;

  const statusClasses =
    event.status === "Ongoing"
      ? "bg-green-500 text-white"
      : event.status === "Upcoming"
      ? "bg-blue-500 text-white"
      : "bg-gray-400 text-white";

  return (
    <div className="fixed inset-0 z-50 bg-black/60">
      <div className="flex min-h-dvh items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#f5efe6] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#dccfbe] px-4 py-4 sm:px-6">
            <h3 className="pr-4 text-lg font-bold text-[#3e2c23] sm:text-xl">
              Event Details
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-[#5a4636] hover:bg-[#e8dfd3]"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <img
              src={event.img}
              alt={event.title}
              className="h-52 w-full object-cover sm:h-64 md:h-72"
            />

            <div className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-xl font-bold text-[#3e2c23] sm:text-2xl">
                    {event.title}
                  </h4>
                  <p className="mt-2 text-sm text-[#5a4636] sm:text-base">
                    📅 {event.date}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                >
                  {event.status}
                </span>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-[#3e2c23] sm:text-base">
                  Description
                </h5>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5a4636] sm:text-base">
                  {event.description}
                </p>
              </div>

              {event.referenceImages && event.referenceImages.length > 0 ? (
                <div>
                  <h5 className="text-sm font-semibold text-[#3e2c23] sm:text-base">
                    Reference Images
                  </h5>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {event.referenceImages.map((image) => (
                      <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="Reference"
                        className="h-28 w-full rounded-lg border border-[#cdbca7] object-cover sm:h-36"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[#dccfbe] px-4 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#b8a28d] px-4 py-2 text-sm text-[#5a4636]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={onJoin}
                className="rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
              >
                Join Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
