"use client";

import EventCard from "./EventCard";
import type { EventItem } from "@/app/events/page";

interface EventsGridProps {
  events: EventItem[];
  onView?: (event: EventItem) => void;
  onJoin?: (event: EventItem) => void;
}

export default function EventsGrid({
  events,
  onView,
  onJoin,
}: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          description={event.description}
          img={event.img}
          date={event.date}
          status={event.status}
          onView={() => onView?.(event)}
          onJoin={() => onJoin?.(event)}
        />
      ))}
    </div>
  );
}
