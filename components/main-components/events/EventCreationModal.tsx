"use client";

import { useState } from "react";

type EventCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EventCreationModal({ isOpen, onClose }: EventCreationModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [backdrop, setBackdrop] = useState<File | null>(null);
  const [references, setReferences] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !deadline || !backdrop) return;

    console.log({ title, description, startDate, deadline, backdrop, references });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#f5efe6] rounded-xl p-7 w-[900px] relative shadow-lg">

        {/* Close */}
        <button
          className="absolute top-4 right-4 text-[#3e2c23] text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-[#3e2c23]">
          Host an Event
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-[#3e2c23]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-[#5a4636] rounded-md p-2 w-full text-base"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium text-[#3e2c23]">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-[#5a4636] rounded-md p-2 w-full text-base"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="text-sm font-medium text-[#3e2c23]">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border border-[#5a4636] rounded-md p-2 w-full text-base"
                required
              />
            </div>

            {/* Backdrop */}
            <div>
              <label className="text-sm font-medium text-[#3e2c23]">Backdrop</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files && setBackdrop(e.target.files[0])
                }
                className="border border-[#5a4636] rounded-md p-2 w-full text-base"
                required
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">
            {/* Description */}
            <div>
              <label className="text-sm font-medium text-[#3e2c23]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-[#5a4636] rounded-md p-2 w-full text-base h-[140px] resize-none"
              />
            </div>

            {/* References */}
            <div>
              <label className="text-sm font-medium text-[#3e2c23]">
                References (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setReferences(e.target.files)}
                className="border border-[#5a4636] rounded-md p-2 w-full text-base"
              />
            </div>

            {/* Submit */}
            <div className="mt-auto">
              <button
                type="submit"
                className="w-full bg-[#3e2c23] text-[#f5efe6] rounded-lg py-3 text-base font-semibold hover:bg-[#5a4636] transition"
              >
                Create Event
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}