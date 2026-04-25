import type { UploadArtResponse } from "@/app/types/upload";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseUploadArtResponse(data: unknown): UploadArtResponse {
  if (!isRecord(data)) {
    return {
      error: "Invalid upload response.",
    };
  }

  return {
    success: typeof data.success === "boolean" ? data.success : undefined,
    post: data.post,
    error: typeof data.error === "string" ? data.error : undefined,
  };
}