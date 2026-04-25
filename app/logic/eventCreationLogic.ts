import type { EventCreationForm } from "@/app/types/eventCreation";

export const MAX_REFERENCE_IMAGES = 7;
export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;

export const initialEventCreationForm: EventCreationForm = {
  title: "",
  description: "",
  startDate: "",
  deadline: "",
};

export function validateImageFile(file: File, label: string): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as "image/png" | "image/jpeg")) {
    return `${label} must be PNG or JPG.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${label} must be 15MB or smaller.`;
  }

  return null;
}

export function canSubmitEventForm(
  form: EventCreationForm,
  backdropImage: File | null,
): boolean {
  return Boolean(
    form.title.trim() &&
      form.description.trim() &&
      form.startDate &&
      form.deadline &&
      backdropImage,
  );
}