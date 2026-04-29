"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Profile } from "@/app/types/profile";

type EditProfileModalProps = {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

export default function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onUpdated,
}: EditProfileModalProps) {
  const [username, setUsername] = useState<string>(profile.username);
  const [bio, setBio] = useState<string>(profile.bio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(profile.avatarUrl);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
  if (!avatarFile) {
    setPreviewUrl(profile.avatarUrl);
    return;
  }

  const objectUrl = URL.createObjectURL(avatarFile);
  setPreviewUrl(objectUrl);

  return () => {
    URL.revokeObjectURL(objectUrl);
  };
}, [avatarFile, profile.avatarUrl]);

const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>): void => {
  const file = event.target.files?.[0] ?? null;
  setAvatarFile(file);
};

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update profile.");
      }

      await onUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#f5efe6] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#3e2c23]">Edit Profile</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-[#5a4636] hover:bg-[#e8dfd3]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
          <label className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border border-[#d7cab9] transition-colors hover:border-[#5a4636]">
            <Image
              src={previewUrl}
              alt="Profile preview"
              fill
              className="object-cover transition-opacity group-hover:opacity-80"
              sizes="80px"
            />
            
            {/* Screen reader text or a small icon could go here */}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[#5a4636]">Update photo</p>
            <p className="text-xs text-gray-500">Click the profile picture to upload</p>
          </div>
        </div>

          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            className="w-full rounded-lg border border-[#d7cab9] px-4 py-2 outline-none focus:border-[#5a4636]"
          />

          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Bio"
            className="h-24 w-full resize-none rounded-lg border border-[#d7cab9] px-4 py-2 outline-none focus:border-[#5a4636]"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#3e2c23] py-2 font-semibold text-[#f5efe6] transition hover:bg-[#5a4636] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}