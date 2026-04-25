import { useCallback, useEffect, useState } from "react";
import {
  parseEventsResponse,
  parseJoinEventResponse,
} from "@/app/logic/eventGuards";
import type { EventItem } from "@/app/types/event";

type FetchState = "idle" | "loading" | "success" | "error";

type UseEventsReturn = {
  events: EventItem[];
  selectedEvent: EventItem | null;
  isCreateModalOpen: boolean;
  joiningEventId: string | null;
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
  hasEvents: boolean;
  error: string;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openViewModal: (event: EventItem) => void;
  closeViewModal: () => void;
  handleCreated: (newEvent: EventItem) => void;
  handleJoinEvent: (event: EventItem) => Promise<void>;
  setSelectedEvent: React.Dispatch<React.SetStateAction<EventItem | null>>;
  loadEvents: () => Promise<void>;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`API did not return JSON. Status: ${res.status}`);
  }
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [error, setError] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  const isLoading = fetchState === "loading";
  const hasError = fetchState === "error";
  const isEmpty = fetchState === "success" && events.length === 0;
  const hasEvents = fetchState === "success" && events.length > 0;

  const loadEvents = useCallback(async (): Promise<void> => {
    try {
      setFetchState("loading");
      setError("");

      const response = await fetch("/api/events", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const rawData = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error("Failed to fetch events.");
      }

      setEvents(parseEventsResponse(rawData));
      setFetchState("success");
    } catch (err: unknown) {
      console.error("LOAD_EVENTS_ERROR", err);
      setError("Could not load events.");
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const openCreateModal = useCallback((): void => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback((): void => {
    setIsCreateModalOpen(false);
  }, []);

  const openViewModal = useCallback((event: EventItem): void => {
    setSelectedEvent(event);
  }, []);

  const closeViewModal = useCallback((): void => {
    setSelectedEvent(null);
  }, []);

  const handleCreated = useCallback(
    (newEvent: EventItem): void => {
      setEvents((prevEvents) => [{ ...newEvent, joined: false }, ...prevEvents]);
      closeCreateModal();
      setFetchState("success");
    },
    [closeCreateModal],
  );

  const markEventAsJoined = useCallback((eventId: string): void => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              joined: true,
            }
          : event,
      ),
    );

    setSelectedEvent((prevEvent) =>
      prevEvent && prevEvent.id === eventId
        ? {
            ...prevEvent,
            joined: true,
          }
        : prevEvent,
    );
  }, []);

  const handleJoinEvent = useCallback(
    async (event: EventItem): Promise<void> => {
      if (joiningEventId === event.id || event.joined) return;

      try {
        setJoiningEventId(event.id);

        const response = await fetch(`/api/events/${event.id}/join`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const rawData = await parseJsonResponse(response);
        const data = parseJoinEventResponse(rawData);

        if (response.ok) {
          markEventAsJoined(event.id);
          await loadEvents();
          alert(data.message ?? "Joined successfully");
          return;
        }

        if (response.status === 409) {
          markEventAsJoined(event.id);
          alert(data.message ?? "You already joined this event");
          return;
        }

        alert(data.message ?? `Failed to join event. Status: ${response.status}`);
      } catch (err: unknown) {
        console.error("JOIN_EVENT_ERROR", err);
        alert("Something went wrong while joining the event.");
      } finally {
        setJoiningEventId(null);
      }
    },
    [joiningEventId, markEventAsJoined, loadEvents],
  );

  return {
    events,
    selectedEvent,
    isCreateModalOpen,
    joiningEventId,
    isLoading,
    hasError,
    isEmpty,
    hasEvents,
    error,
    openCreateModal,
    closeCreateModal,
    openViewModal,
    closeViewModal,
    handleCreated,
    handleJoinEvent,
    setSelectedEvent,
    loadEvents,
  };
}