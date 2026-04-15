"use client";
import MainLayout from "@/components/main-components/layout/MainLayout";
import EventsHeader from "@/components/main-components/events/EventsHeader";
import EventsGrid from "@/components/main-components/events/EventsGrid";
import EventCreationModal from "@/components/main-components/events/EventCreationModal";
import { useState } from "react";

const events = [
  {
    id: 1,
    title: "April Art Challenge",
    description: "Create artwork based on daily prompts throughout April.",
    img: "/event1.jpg",
    date: "Apr 1 - Apr 30",
    status: "Ongoing",
  },
  {
    id: 2,
    title: "Draw This In Your Style",
    description: "Recreate the featured artwork in your own style.",
    img: "/event2.jpg",
    date: "May 5 - May 20",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Speed Painting Contest",
    description: "Complete a full artwork within 2 hours.",
    img: "/event3.jpg",
    date: "Mar 20 - Mar 25",
    status: "Ended",
  },
];

export default function EventsPage() {

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  return (
    <MainLayout>
      <EventsHeader onCreate={() => setIsEventModalOpen(true)} />
      <EventCreationModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
      <section className="p-4 ml-4 mr-4 flex-1">
        <EventsGrid events={events} />
      </section>
    </MainLayout>
  );
}