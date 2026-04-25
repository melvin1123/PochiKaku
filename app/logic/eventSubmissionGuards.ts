import type {
  EventSubmission,
  SubmitEventResponse,
} from "@/app/types/eventSubmission";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSubmitEventResponse(
  value: unknown,
): SubmitEventResponse {
  if (!isRecord(value)) {
    return {
      error: "Invalid submission response.",
    };
  }

  return {
    submission: value.submission as EventSubmission | undefined,
    error: typeof value.error === "string" ? value.error : undefined,
  };
}