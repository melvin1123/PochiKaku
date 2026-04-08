"use client";
import { Dialog } from "@headlessui/react";

interface ArtModalProps {
  art: { title: string; artist: string; img: string } | null;
  onClose: () => void;
}

export default function ArtModal({ art, onClose }: ArtModalProps) {
  return (
    <Dialog
      open={!!art}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <Dialog.Panel className="bg-[#f5efe6] rounded-lg max-w-lg w-full p-4">
        {art && (
          <>
            <img src={art.img} alt={art.title} className="w-full rounded-md" />
            <div className="mt-2 text-center">
              <h2 className="font-bold text-lg">{art.title}</h2>
              <p className="text-sm text-[#5a4636]">by {art.artist}</p>
            </div>
          </>
        )}
      </Dialog.Panel>
    </Dialog>
  );
}