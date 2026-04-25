"use client";

import { useCallback, useEffect, useState } from "react";
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

export interface EventParticipant {
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
  joined: boolean;
  participants?: EventParticipant[];
  createdAt?: string;
  createdBy?: string;
  creator?: EventCreator | null;
  referenceImages?: EventReferenceImage[];
}

type FetchState = "idle" | "loading" | "success" | "error";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [error, setError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  const isLoading = fetchState === "loading";
  const hasError = fetchState === "error";
  const isEmpty = fetchState === "success" && events.length === 0;
  const hasEvents = fetchState === "success" && events.length > 0;

  const loadEvents = useCallback(async () => {
    try {
      setFetchState("loading");
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
      setFetchState("success");
    } catch (err) {
      console.error("LOAD_EVENTS_ERROR", err);
      setError("Could not load events.");
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const openViewModal = useCallback((event: EventItem) => {
    setSelectedEvent(event);
  }, []);

  const closeViewModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleCreated = useCallback(
    (newEvent: EventItem) => {
      setEvents((prev) => [newEvent, ...prev]);
      closeCreateModal();
      setFetchState("success");
    },
    [closeCreateModal],
  );

  const markEventAsJoined = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        String(event.id) === String(eventId)
          ? { ...event, joined: true }
          : event,
      ),
    );

    setSelectedEvent((prev) =>
      prev && String(prev.id) === String(eventId)
        ? { ...prev, joined: true }
        : prev,
    );
  }, []);

  const handleJoinEvent = useCallback(
    async (event: EventItem) => {
      if (joiningEventId === event.id || event.joined) return;

      try {
        setJoiningEventId(String(event.id));

        const response = await fetch(`/api/events/${event.id}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json().catch(() => null);

        if (response.ok) {
          markEventAsJoined(String(event.id));
          await loadEvents();
          alert(data?.message || "Joined successfully");
          return;
        }

        if (response.status === 409) {
          markEventAsJoined(String(event.id));
          alert(data?.message || "You already joined this event");
          return;
        }

        console.error("JOIN_EVENT_RESPONSE", {
          status: response.status,
          data,
        });

        alert(
          data?.message || `Failed to join event. Status: ${response.status}`,
        );
      } catch (err) {
        console.error("JOIN_EVENT_ERROR", err);
        alert("Something went wrong while joining the event.");
      } finally {
        setJoiningEventId(null);
      }
    },
    [joiningEventId, markEventAsJoined, loadEvents],
  );

  return (
    <MainLayout>
      <div className="flex mt-1 min-h-fit flex-col">
        <EventsHeader onCreate={openCreateModal} />

        <EventCreationModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreated={(createdEvent) =>
            handleCreated({
              ...createdEvent,
              joined: false,
            })
          }
        />

        <ViewEventModal
          isOpen={Boolean(selectedEvent)}
          onClose={closeViewModal}
          event={selectedEvent}
          onJoin={() => {
            if (!selectedEvent) return;
            void handleJoinEvent(selectedEvent);
          }}
          hasJoined={selectedEvent?.joined ?? false}
          isJoining={joiningEventId === selectedEvent?.id}
        />

        <section className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {isLoading && <LoadingState />}

            {hasError && <ErrorState error={error} onRetry={loadEvents} />}

            {isEmpty && <EmptyState onCreate={openCreateModal} />}

            {hasEvents && (
              <EventsGrid
                events={events}
                onView={openViewModal}
                onJoin={handleJoinEvent}
                joiningEventId={joiningEventId}
              />
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-5 text-sm text-[#5a4636] sm:p-6 sm:text-base">
      Loading events...
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-red-300 bg-red-50 p-5 sm:p-6">
      <p className="text-sm text-red-700 sm:text-base">{error}</p>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-[#d7cab9] bg-[#f5efe6] p-6 text-center text-[#5a4636]">
      <h2 className="text-lg font-semibold text-[#3e2c23]">No events yet</h2>

      <p className="mt-2 text-sm sm:text-base">
        Create your first challenge to get started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-lg bg-[#3e2c23] px-4 py-2 text-sm text-[#f5efe6] transition hover:bg-[#5a4636]"
      >
        Create Event
      </button>
    </div>
  );
}