"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import EventsHeader from "@/components/main-components/events/EventsHeader";
import EventsGrid from "@/components/main-components/events/EventsGrid";
import EventCreationModal from "@/components/main-components/events/EventCreationModal";
import ViewEventModal from "@/components/main-components/events/ViewEventModal";

export type EventStatus = "Ongoing" | "Upcoming" | "Ended";

export interface EventReferenceImage {
  id: string;
  imageUrl: string;
}

export interface EventCreator {
  id: string;
  username: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  img: string;
  date: string;
  status: EventStatus;
  startDate: string;
  deadline: string;
  createdAt?: string;
  createdBy?: string;
  creator?: EventCreator | null;
  referenceImages?: EventReferenceImage[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const isViewModalOpen = useMemo(() => Boolean(selectedEvent), [selectedEvent]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/events", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events.");
      }

      const data: EventItem[] = await response.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function handleCreated(newEvent: EventItem) {
    setEvents((prev) => [newEvent, ...prev]);
    setIsEventModalOpen(false);
  }

  function handleOpenView(event: EventItem) {
    setSelectedEvent(event);
  }

  function handleCloseView() {
    setSelectedEvent(null);
  }

  function handleJoinEvent(event: EventItem) {
    console.log("Join event:", event.id);
  }

  return (
    <MainLayout>
      <div className="flex min-h-full flex-col">
        <EventsHeader onCreate={() => setIsEventModalOpen(true)} />

        <EventCreationModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onCreated={handleCreated}
        />

        <ViewEventModal
          isOpen={isViewModalOpen}
          onClose={handleCloseView}
          event={selectedEvent}
          onJoin={() => {
            if (!selectedEvent) return;
            handleJoinEvent(selectedEvent);
          }}
        />

        <section className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {loading ? (
              <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-5 text-sm text-[#5a4636] sm:p-6 sm:text-base">
                Loading events...
              </div>
            ) : error ? (
              <div className="space-y-4 rounded-xl border border-red-300 bg-red-50 p-5 sm:p-6">
                <p className="text-sm text-red-700 sm:text-base">{error}</p>

                <button
                  type="button"
                  onClick={loadEvents}
                  className="rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
                >
                  Retry
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
                <h2 className="text-lg font-semibold text-[#3e2c23]">
                  No events yet
                </h2>
                <p className="mt-2 text-sm sm:text-base">
                  Create your first challenge to get started.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="mt-4 rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <EventsGrid
                events={events}
                onView={handleOpenView}
                onJoin={handleJoinEvent}
              />
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
