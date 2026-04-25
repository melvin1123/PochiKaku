"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { IconType } from "react-icons";
import { FaPlus, FaPalette, FaCalendar, FaUser } from "react-icons/fa";
import MainLayout from "@/components/main-components/layout/MainLayout";
import QuickActionCard from "@/components/main-components/dashboard/QuickActionCard";
import ArtPostCard from "@/components/main-components/homepage/ArtPostCard";
import RecentUploadCard from "@/components/main-components/dashboard/RecentUploadCard";
import UploadArtModal from "@/components/main-components/dashboard/UploadArtModal";
import { useHomepagePosts } from "@/app/hooks/homepage/useHomepagePosts";

type QuickAction = {
  title: string;
  icon: IconType;
  link?: string;
  onClick?: () => void;
};

export default function HomePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const {
    recentArtworks,
    posts,
    currentUser,
    isLoading,
    error,
    refetchPosts,
  } = useHomepagePosts();

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: "Upload Art",
        icon: FaPlus,
        onClick: () => setIsUploadModalOpen(true),
      },
      {
        title: "View Gallery",
        icon: FaPalette,
        link: "/gallery",
      },
      {
        title: "My Works",
        icon: FaUser,
        link: "/profile",
      },
      {
        title: "Upcoming Events",
        icon: FaCalendar,
        link: "/events",
      },
    ],
    [],
  );

  const handleCloseUploadModal = (): void => {
    setIsUploadModalOpen(false);
    void refetchPosts();
  };

  return (
    <MainLayout>
      <section>
        <div className="relative h-60 overflow-hidden rounded-sm md:h-[300px] lg:h-[340px]">
          <Image
            src="https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776931412/download_2_wbufsc.jpg"
            alt="Homepage poster"
            fill
            className="object-cover object-top"
            priority
            sizes="(max-width: 1024px) 100vw, calc(100vw - 280px)"
          />
        </div>
      </section>

      <div className="mx-8 mb-2 mt-5">
        <h2 className="text-3xl font-bold">
          Welcome back,{" "}
          <span className="text-[#5a4636]">
            {currentUser?.username ?? "Artist"}
          </span>
          !
        </h2>

        <p className="mt-1 text-[#5a4636]">
          Here’s what’s happening in your community today.
        </p>
      </div>

      <section className="mb-6 ml-4 mr-4 mt-4 grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-4">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.title}
            title={action.title}
            Icon={action.icon}
            link={action.link}
            onClick={action.onClick}
          />
        ))}
      </section>

      {isUploadModalOpen && (
        <UploadArtModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
        />
      )}

      <section className="ml-4 mr-4 p-4">
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

      <section className="ml-4 mr-4 p-4">
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