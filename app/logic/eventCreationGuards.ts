import type { EventItem, EventStatus } from "@/app/types/event";
import type { CreateEventResponse } from "@/app/types/eventCreation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEventStatus(value: unknown): value is EventStatus {
  return value === "Ongoing" || value === "Upcoming" || value === "Ended";
}

export function parseCreateEventResponse(data: unknown): CreateEventResponse {
  if (!isRecord(data)) {
    return {
      error: "Invalid create event response.",
    };
  }

  if (typeof data.error === "string") {
    return {
      error: data.error,
    };
  }

  const rawEvent = isRecord(data.event) ? data.event : data;

  if (!isRecord(rawEvent)) {
    return {
      error: "Invalid event data.",
    };
  }

  if (
    typeof rawEvent.id !== "string" ||
    typeof rawEvent.title !== "string" ||
    typeof rawEvent.description !== "string" ||
    typeof rawEvent.img !== "string" ||
    typeof rawEvent.date !== "string" ||
    !isEventStatus(rawEvent.status) ||
    typeof rawEvent.startDate !== "string" ||
    typeof rawEvent.deadline !== "string"
  ) {
    return {
      error: "Invalid event data.",
    };
  }

  const event: EventItem = {
    id: rawEvent.id,
    title: rawEvent.title,
    description: rawEvent.description,
    img: rawEvent.img,
    date: rawEvent.date,
    status: rawEvent.status,
    startDate: rawEvent.startDate,
    deadline: rawEvent.deadline,
    joined: typeof rawEvent.joined === "boolean" ? rawEvent.joined : false,
    participants: [],
    referenceImages: [],
  };

  return { event };
}