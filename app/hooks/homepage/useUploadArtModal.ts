import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { parseUploadArtResponse } from "@/app/logic/uploadGuards";

type UseUploadArtModalProps = {
  onClose: () => void;
};

type UseUploadArtModalReturn = {
  file: File | null;
  previewUrl: string | null;
  title: string;
  description: string;
  tags: string;
  isSubmitting: boolean;
  error: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setTags: React.Dispatch<React.SetStateAction<string>>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
};

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      error: text || `Upload failed with status ${res.status}`,
    };
  }
}

export function useUploadArtModal({
  onClose,
}: UseUploadArtModalProps): UseUploadArtModalReturn {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const resetForm = (): void => {
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setTags("");
    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select an image.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("tags", tags.trim());
    formData.append("file", file);

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/upload-art", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const rawData = await parseJsonResponse(res);
      const data = parseUploadArtResponse(rawData);

      if (!res.ok) {
        throw new Error(data.error ?? `Upload failed with status ${res.status}`);
      }

      resetForm();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      console.error("Upload error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    file,
    previewUrl,
    title,
    description,
    tags,
    isSubmitting,
    error,
    setTitle,
    setDescription,
    setTags,
    handleFileChange,
    handleSubmit,
    resetForm,
  };
}