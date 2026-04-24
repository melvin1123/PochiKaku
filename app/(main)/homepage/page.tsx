"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaPalette, FaCalendar, FaUser } from "react-icons/fa";
import MainLayout from "@/components/main-components/layout/MainLayout";
import QuickActionCard from "@/components/main-components/dashboard/QuickActionCard";
import ArtPostCard from "@/components/main-components/homepage/ArtPostCard";
import RecentUploadCard from "@/components/main-components/dashboard/RecentUploadCard";
import UploadArtModal from "@/components/main-components/dashboard/UploadArtModal";
import Image from "next/image";

type PostItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  artist: string;
  artistId: string;
  avatar: string;
  time: string;
  likes: number;
  comments: number;
  userId: string;
  createdAt: string;
};

type CurrentUser = {
  id: string;
  email: string;
  username: string;
};

type PostsResponse = {
  currentUser: CurrentUser;
  recentUploads: PostItem[];
  posts: PostItem[];
  error?: string;
};

export default function HomePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recentArtworks, setRecentArtworks] = useState<PostItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const quickActions = [
    { title: "Upload Art", icon: FaPlus, onClick: () => setIsUploadModalOpen(true) },
    { title: "View Gallery", icon: FaPalette, link: "/gallery" },
    { title: "My Works", icon: FaUser, link: "/profile" },
    { title: "Upcoming Events", icon: FaCalendar, link: "/events" },
  ];

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/posts", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data: PostsResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch posts.");
      }

      setCurrentUser(data.currentUser);
      setRecentArtworks(data.recentUploads);
      setPosts(data.posts);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      console.error("Fetch posts error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <MainLayout>
      {/* Hero Poster */}
      <section>
        <div className="relative h-60 overflow-hidden rounded-sm  md:h-[300px] lg:h-[340px]">
          <Image
            src="https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776931412/download_2_wbufsc.jpg"
            alt="Homepage poster"
            fill
            className="object-cover object-top"
            priority
          />
          <div/>
        </div>
      </section>

      {/* Welcome Block */}
      <div className="mx-8 mb-2 mt-5">
        <h2 className="text-3xl font-bold">
          Welcome back,{" "}
          <span className="text-[#5a4636]">
            {currentUser?.username || "Artist"}
          </span>
          !
        </h2>
        <p className="mt-1 text-[#5a4636]">
          Here’s what’s happening in your community today.
        </p>
      </div>

      {/* Quick Actions */}
      <section className="mb-6 ml-4 mr-4 mt-4 grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-4">
        {quickActions.map(({ title, icon, link, onClick }, idx) => (
          <QuickActionCard
            key={idx}
            title={title}
            Icon={icon}
            link={link}
            onClick={onClick}
          />
        ))}
      </section>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadArtModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            fetchPosts();
          }}
        />
      )}

      {/* Recent Uploads */}
      <section className="p-4 ml-4 mr-4">
        <h3 className="mb-6 text-2xl font-bold">Your Recent Uploads</h3>

        {isLoading ? (
          <p className="text-[#5a4636]">Loading your recent uploads...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {recentArtworks.length === 0 ? (
              <RecentUploadCard
                isEmptyCard
                onAddClick={() => setIsUploadModalOpen(true)}
              />
            ) : (
              recentArtworks.map((post) => (
                <RecentUploadCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}
      </section>

      {/* Discover Others */}
      <section className="p-4 ml-4 mr-4 items-center">
        <h3 className="mb-6 text-2xl font-bold">Discover Others</h3>

        {isLoading ? (
          <p className="text-[#5a4636]">Loading posts...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-[#5a4636]">No posts found.</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {posts.map((post) => (
              <ArtPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}