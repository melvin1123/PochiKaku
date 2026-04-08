"use client";
import EventCard from "./EventCard";

interface Event {
  id: number;
  title: string;
  description: string;
  img: string;
  date: string;
  status: "Ongoing" | "Upcoming" | "Ended";
}

interface EventsGridProps {
  events: Event[];
}

export default function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          description={event.description}
          img={event.img}
          date={event.date}
          status={event.status}
        />
      ))}
    </div>
  );
}