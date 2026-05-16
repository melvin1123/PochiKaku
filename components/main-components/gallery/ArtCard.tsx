"use client";

import { useEffect, useState } from "react";

type ArtCardProps = {
  title: string;
  artist: string;
  img: string;
  onClick?: () => void;
  isPlaying?: boolean; // New prop to sync with your music player
};

// Vibrant disco neon color palette
const DISCO_COLORS = [
  "rgba(236, 72, 153, 0.4)",  // Neon Pink
  "rgba(6, 182, 212, 0.4)",   // Neon Cyan
  "rgba(234, 179, 8, 0.4)",   // Neon Yellow
  "rgba(168, 85, 247, 0.4)",  // Neon Purple
  "rgba(34, 197, 94, 0.4)",   // Neon Green
  "rgba(244, 63, 94, 0.4)",   // Neon Rose
];

const DISCO_GLOWS = [
  "0 0 25px rgba(236, 72, 153, 0.8)",
  "0 0 25px rgba(6, 182, 212, 0.8)",
  "0 0 25px rgba(234, 179, 8, 0.8)",
  "0 0 25px rgba(168, 85, 247, 0.8)",
  "0 0 25px rgba(34, 197, 94, 0.8)",
  "0 0 25px rgba(244, 63, 94, 0.8)",
];

export default function ArtCard({
  title,
  artist,
  img,
  onClick,
  isPlaying = true,
}: ArtCardProps) {
  const [autoHover, setAutoHover] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    // If music is paused, instantly clear any remaining dancing effects
    if (!isPlaying) {
      setAutoHover(false);
      return;
    }

    let timeout: NodeJS.Timeout;
    let hoverTimeout: NodeJS.Timeout;

    const triggerHover = () => {
      // High-energy randomized tempo timing
      const nextDelay = Math.random() * 600 + 100;

      timeout = setTimeout(() => {
        // Pick a brand new random disco color scheme for this flash
        const nextColorIndex = Math.floor(Math.random() * DISCO_COLORS.length);
        setColorIndex(nextColorIndex);
        setAutoHover(true);

        // Short punchy duration matching up with the beat
        hoverTimeout = setTimeout(() => {
          setAutoHover(false);
          triggerHover();
        }, 180);
      }, nextDelay);
    };

    triggerHover();

    return () => {
      clearTimeout(timeout);
      clearTimeout(hoverTimeout);
    };
  }, [isPlaying]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        group relative w-full cursor-pointer overflow-hidden rounded-lg
        bg-[#e8dfd3] shadow transition-all
        disabled:cursor-default
        ${isPlaying ? "duration-150" : "duration-300 hover:-translate-y-1 hover:shadow-xl"}
        ${autoHover ? "-translate-y-2 scale-[1.03]" : ""}
      `}
      style={{
        boxShadow: autoHover ? DISCO_GLOWS[colorIndex] : undefined,
      }}
      aria-label={`View ${title} by ${artist}`}
    >
      <img
        src={img}
        alt={title}
        className="h-auto w-full object-cover"
      />

      {/* Disco Overlay Screen */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-150 group-hover:opacity-100
          ${autoHover ? "opacity-100" : "opacity-0"}
        `}
        style={{
          backgroundColor: autoHover ? DISCO_COLORS[colorIndex] : "rgba(0, 0, 0, 0.4)",
        }}
      >
        <span className={`font-bold text-white tracking-wide drop-shadow-sm ${autoHover ? "scale-110" : ""}`}>
          {autoHover && isPlaying ? "🕺 DANCE 💃" : "View"}
        </span>
      </div>
    </button>
  );
}