import type { EventItem } from "@/app/types/event";

export function getEventStatusClasses(status: EventItem["status"]): string {
  if (status === "Ongoing") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Upcoming") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }

  return "bg-gray-200 text-gray-700 border border-gray-300";
}

export function getJoinButtonText({
  isJoining,
  hasJoined,
  isEnded,
}: {
  isJoining: boolean;
  hasJoined: boolean;
  isEnded: boolean;
}): string {
  if (isJoining) return "Joining...";
  if (hasJoined) return "Already Joined";
  if (isEnded) return "Event Ended";

  return "Join Event";
}

export function getIsJoinDisabled({
  onJoinExists,
  isEnded,
  hasJoined,
  isJoining,
}: {
  onJoinExists: boolean;
  isEnded: boolean;
  hasJoined: boolean;
  isJoining: boolean;
}): boolean {
  return !onJoinExists || isEnded || hasJoined || isJoining;
}