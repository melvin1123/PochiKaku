"use client";

import EventCard from "./EventCard";
import type { EventItem } from "@/app/(main)/events/page";

interface EventsGridProps {
  events: EventItem[];
  onView?: (event: EventItem) => void;
  onJoin?: (event: EventItem) => void;
  joiningEventId?: string | null;
}

export default function EventsGrid({
  events,
  onView,
  onJoin,
  joiningEventId = null,
}: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {events.map((event) => {
        const isJoining = String(joiningEventId) === String(event.id);

        return (
          <EventCard
            key={event.id}
            title={event.title}
            description={event.description}
            img={event.img}
            date={event.date}
            status={event.status}
            participants={event.participants}
            onView={() => onView?.(event)}
            onJoin={() => onJoin?.(event)}
            joining={isJoining}
            joined={event.joined}
          />
        );
      })}
    </div>
  );
}
