import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  canSubmitEventForm,
  initialEventCreationForm,
  MAX_REFERENCE_IMAGES,
  validateImageFile,
} from "@/app/logic/eventCreationLogic";
import { parseCreateEventResponse } from "@/app/logic/eventCreationGuards";
import type { EventItem } from "@/app/types/event";
import type { EventCreationForm } from "@/app/types/eventCreation";

type UseEventCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (event: EventItem) => void;
};

type UseEventCreationModalReturn = {
  form: EventCreationForm;
  backdropPreview: string;
  referencePreviews: string[];
  submitting: boolean;
  error: string;
  canSubmit: boolean;
  updateField: <K extends keyof EventCreationForm>(
    key: K,
    value: EventCreationForm[K],
  ) => void;
  handleBackdropChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleReferenceImagesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      error: text || `Create event failed with status ${res.status}`,
    };
  }
}

export function useEventCreationModal({
  isOpen,
  onClose,
  onCreated,
}: UseEventCreationModalProps): UseEventCreationModalReturn {
  const [form, setForm] = useState<EventCreationForm>(initialEventCreationForm);
  const [backdropImage, setBackdropImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [backdropPreview, setBackdropPreview] = useState<string>("");
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) return;

    setForm(initialEventCreationForm);
    setBackdropImage(null);
    setReferenceImages([]);
    setBackdropPreview("");
    setReferencePreviews([]);
    setSubmitting(false);
    setError("");
  }, [isOpen]);

  useEffect(() => {
    if (!backdropImage) {
      setBackdropPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(backdropImage);
    setBackdropPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [backdropImage]);

  useEffect(() => {
    if (referenceImages.length === 0) {
      setReferencePreviews([]);
      return;
    }

    const objectUrls = referenceImages.map((file) => URL.createObjectURL(file));
    setReferencePreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [referenceImages]);

  const canSubmit = useMemo(
    () => canSubmitEventForm(form, backdropImage),
    [form, backdropImage],
  );

  const updateField = <K extends keyof EventCreationForm>(
    key: K,
    value: EventCreationForm[K],
  ): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBackdropChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setBackdropImage(null);
      return;
    }

    const validationError = validateImageFile(file, "Backdrop image");

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setBackdropImage(file);
  };

  const handleReferenceImagesChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > MAX_REFERENCE_IMAGES) {
      setError(`You can upload up to ${MAX_REFERENCE_IMAGES} reference images.`);
      return;
    }

    for (const file of files) {
      const validationError = validateImageFile(file, "Reference image");

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError("");
    setReferenceImages(files);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!canSubmit || !backdropImage) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("startDate", form.startDate);
      payload.append("deadline", form.deadline);
      payload.append("backdropImage", backdropImage);

      referenceImages.forEach((file) => {
        payload.append("referenceImages", file);
      });

      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "include",
        body: payload,
      });

      const rawData = await parseJsonResponse(res);
      const data = parseCreateEventResponse(rawData);

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create event.");
      }

      if (!data.event) {
        throw new Error(data.error ?? "Invalid event response.");
      }

      onCreated(data.event);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event.");
      console.error("Create event error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    backdropPreview,
    referencePreviews,
    submitting,
    error,
    canSubmit,
    updateField,
    handleBackdropChange,
    handleReferenceImagesChange,
    handleSubmit,
  };
}