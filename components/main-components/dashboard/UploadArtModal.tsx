"use client";

import { useEffect, useState } from "react";

type UploadArtModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UploadArtModal({
  isOpen,
  onClose,
}: UploadArtModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setTags("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      });

const text = await res.text();
console.log("Raw upload response:", text);

let data: any = {};
try {
  data = JSON.parse(text);
} catch {
  data = { error: text };
}

if (!res.ok) {
  throw new Error(data?.error || `Upload failed with status ${res.status}`);
}

      console.log("Post created:", data);

      resetForm();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-[#f5efe6] p-6 shadow-lg">
        <button
          type="button"
          className="absolute right-3 top-3 text-lg font-bold text-[#3e2c23]"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 className="mb-4 text-2xl font-semibold text-[#3e2c23]">
          Upload Your Art
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-[#5a4636] p-2"
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-20 resize-none rounded-lg border border-[#5a4636] p-2"
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="rounded-lg border border-[#5a4636] p-2"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="rounded-lg border border-[#5a4636] p-2"
            required
          />

          {previewUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-[#5a4636]">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#3e2c23] py-2 font-semibold text-[#f5efe6] transition hover:bg-[#5a4636] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}