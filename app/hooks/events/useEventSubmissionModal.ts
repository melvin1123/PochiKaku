import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { parseSubmitEventResponse } from "@/app/logic/eventSubmissionGuards";
import type { EventSubmission } from "@/app/types/eventSubmission";

type UseEventSubmissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSubmitted?: (submission: EventSubmission) => void;
};

type UseEventSubmissionModalReturn = {
  title: string;
  description: string;
  caption: string;
  imageFile: File | null;
  isSubmitting: boolean;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setCaption: React.Dispatch<React.SetStateAction<string>>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleModalClick: (event: MouseEvent<HTMLDivElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      error: text || `Submit failed with status ${res.status}`,
    };
  }
}

export function useEventSubmissionModal({
  isOpen,
  onClose,
  eventId,
  onSubmitted,
}: UseEventSubmissionModalProps): UseEventSubmissionModalReturn {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const resetForm = (): void => {
    setTitle("");
    setDescription("");
    setCaption("");
    setImageFile(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setImageFile(event.target.files?.[0] ?? null);
  };

  const handleModalClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("caption", caption.trim());
      formData.append("image", imageFile);

      const res = await fetch(`/api/events/${eventId}/submit`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const rawData = await parseJsonResponse(res);
      const data = parseSubmitEventResponse(rawData);

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit artwork.");
      }

      if (!data.submission) {
        throw new Error("Invalid submission response.");
      }

      onSubmitted?.(data.submission);
      resetForm();
      onClose();
    } catch (error: unknown) {
      console.error("Submit artwork error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit artwork.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    description,
    caption,
    imageFile,
    isSubmitting,
    setTitle,
    setDescription,
    setCaption,
    handleFileChange,
    handleModalClick,
    handleSubmit,
  };
}