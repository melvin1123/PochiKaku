import type {
  EventCreator,
  EventItem,
  EventParticipant,
  EventReferenceImage,
  EventStatus,
  JoinEventResponse,
} from "@/app/types/event";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isEventStatus(value: unknown): value is EventStatus {
  return value === "Ongoing" || value === "Upcoming" || value === "Ended";
}

export function isEventParticipant(value: unknown): value is EventParticipant {
  if (!isRecord(value)) return false;

  return typeof value.id === "string" && typeof value.username === "string";
}

export function isEventCreator(value: unknown): value is EventCreator {
  if (!isRecord(value)) return false;

  return typeof value.id === "string" && typeof value.username === "string";
}

export function isEventReferenceImage(
  value: unknown,
): value is EventReferenceImage {
  if (!isRecord(value)) return false;

  return typeof value.id === "string" && typeof value.imageUrl === "string";
}

export function isEventItem(value: unknown): value is EventItem {
  if (!isRecord(value)) return false;

  const creatorIsValid =
    value.creator === undefined ||
    value.creator === null ||
    isEventCreator(value.creator);

  const participantsAreValid =
    value.participants === undefined ||
    (Array.isArray(value.participants) &&
      value.participants.every(isEventParticipant));

  const referenceImagesAreValid =
    value.referenceImages === undefined ||
    (Array.isArray(value.referenceImages) &&
      value.referenceImages.every(isEventReferenceImage));

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.img === "string" &&
    typeof value.date === "string" &&
    isEventStatus(value.status) &&
    typeof value.startDate === "string" &&
    typeof value.deadline === "string" &&
    typeof value.joined === "boolean" &&
    creatorIsValid &&
    participantsAreValid &&
    referenceImagesAreValid &&
    (value.createdAt === undefined || typeof value.createdAt === "string") &&
    (value.createdBy === undefined || typeof value.createdBy === "string")
  );
}

export function parseEventsResponse(data: unknown): EventItem[] {
  if (!Array.isArray(data)) return [];

  return data.filter(isEventItem);
}

export function parseJoinEventResponse(data: unknown): JoinEventResponse {
  if (!isRecord(data)) return {};

  return {
    message: typeof data.message === "string" ? data.message : undefined,
  };
}