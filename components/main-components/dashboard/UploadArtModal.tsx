"use client";

import { useUploadArtModal } from "@/app/hooks/homepage/useUploadArtModal";

type UploadArtModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UploadArtModal({
  isOpen,
  onClose,
}: UploadArtModalProps) {
  const {
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
  } = useUploadArtModal({ onClose });

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
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-lg border border-[#5a4636] p-2"
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-20 resize-none rounded-lg border border-[#5a4636] p-2"
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
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