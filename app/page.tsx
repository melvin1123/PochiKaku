"use client";
import Navbar from "@/components/lp-components/Navbar";
import HeroSection from "@/components/lp-components/HeroSection";
import FeaturedArt from "@/components/lp-components/FeaturedArt";
import ValueProps from "@/components/lp-components/ValueProps";

const artworks = [
  { id: 1, title: "Forest Dream", artist: "Aiko", img: "/featured/forest-dream.jpg" },
  { id: 2, title: "Golden Hour", artist: "Liam", img: "/featured/golden-hour.jpg" },
  { id: 3, title: "Lost City", artist: "Mina", img: "/featured/lost-city.jpg" },
  { id: 4, title: "Ocean Light", artist: "Kai", img: "/featured/ocean-light.jpg" },
  { id: 5, title: "Sketch Vibes", artist: "Noah", img: "/featured/sketch-vibes.jpg" },
  { id: 6, title: "Warm Coffee", artist: "Ella", img: "/featured/warm-coffee.jpg" },
];

export default function Home() {
  return (
    <main className="bg-[#f5efe6] text-[#3e2c23] overflow-x-hidden relative">
      <Navbar />
      <HeroSection artworks={artworks} />
      <FeaturedArt artworks={artworks} />
      <ValueProps />
    </main>
  );
}