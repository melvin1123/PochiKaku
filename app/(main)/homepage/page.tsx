"use client";
import { FaPlus, FaPalette, FaUsers, FaCalendar } from "react-icons/fa";
import MainLayout from "@/components/main-components/layout/MainLayout";
import QuickActionCard from "@/components/main-components/dashboard/QuickActionCard";
import ArtCard from "@/components/main-components/dashboard/ArtCard";

const quickActions = [
  { title: "Upload Art", icon: FaPlus, link: "#" },
  { title: "View Gallery", icon: FaPalette, link: "#" },
  { title: "Community Forum", icon: FaUsers, link: "#" },
  { title: "Upcoming Events", icon: FaCalendar, link: "#" },
];

const recentArtworks = [
  { title: "Sunset Dreams", artist: "Alice", img: "/art1.jpg" },
  { title: "City Vibes", artist: "Bob", img: "/art2.jpg" },
  { title: "Mystic Forest", artist: "Cara", img: "/art3.jpg" },
];

export default function HomePage() {
  return (
    <MainLayout>
      {/* Welcome Message */}
      <div className="ml-8">
        <h2 className="text-3xl font-bold">
          Welcome back, <span className="text-[#5a4636]">Artist</span>!
        </h2>
        <p className="text-[#5a4636] mt-1">
          Here’s what’s happening in your community today.
        </p>
      </div>

      {/* Quick Actions */}
      <section className="p-4 ml-4 mt-4 mr-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {quickActions.map(({ title, icon, link }, idx) => (
          <QuickActionCard key={idx} title={title} Icon={icon} link={link} />
        ))}
      </section>

      {/* Recent Artworks */}
      <section className="p-4 ml-4 mr-4">
        <h3 className="text-2xl font-bold mb-6">Recent Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recentArtworks.map(({ title, artist, img }, idx) => (
            <ArtCard key={idx} title={title} artist={artist} img={img} />
          ))}
        </div>
      </section>
    </MainLayout>
  );
}