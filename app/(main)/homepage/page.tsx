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

const INITIAL_POST_LIMIT = 10;
const POSTS_INCREMENT = 10;

export default function HomePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [visiblePostCount, setVisiblePostCount] = useState<number>(INITIAL_POST_LIMIT);

  const {
    recentArtworks,
    posts,
    currentUser,
    isLoading,
    error,
    refetchPosts,
  } = useHomepagePosts();

  const visiblePosts = useMemo(() => {
    return posts.slice(0, visiblePostCount);
  }, [posts, visiblePostCount]);

  const hasMorePosts = visiblePostCount < posts.length;

  const quickActions = useMemo<QuickAction[]>(
    () => [
      { title: "Upload Art", icon: FaPlus, onClick: () => setIsUploadModalOpen(true) },
      { title: "View Gallery", icon: FaPalette, link: "/gallery" },
      { title: "My Works", icon: FaUser, link: "/profile" },
      { title: "Upcoming Events", icon: FaCalendar, link: "/events" },
    ],
    [],
  );

  const handleCloseUploadModal = (): void => {
    setIsUploadModalOpen(false);
    void refetchPosts();
  };

  const handleShowMorePosts = (): void => {
    setVisiblePostCount((prevCount) => prevCount + POSTS_INCREMENT);
  };

  return (
    <MainLayout>
      {/* Banner Section */}
      <section className="px-4 md:px-0">
        <div className="relative h-60 overflow-hidden rounded-xl md:h-[300px] lg:h-[340px] md:rounded-none">
          <Image
            src="https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776931412/download_2_wbufsc.jpg"
            alt="Homepage poster"
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        </div>
      </section>

      {/* Welcome Header */}
      <div className="mx-4 mb-2 mt-6 md:mx-8">
        <h2 className="text-2xl font-bold md:text-3xl">
          Welcome back,{" "}
          <span className="text-[#5a4636]">
            {currentUser?.username ?? "Artist"}
          </span>
          !
        </h2>
        <p className="mt-1 text-sm text-[#5a4636]">
          Here’s what’s happening in your community today.
        </p>
      </div>

      {/* 1. Quick Actions: Clean 2x2 Grid */}
      <section className="mb-8 mt-4 grid grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-6 md:px-8">
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

      {/* 2. Recent Uploads: Tightened spacing and improved alignment */}
      <section className="mb-8">
        <h3 className="mb-4 px-4 text-xl font-bold md:px-8 md:text-2xl">Your Recent Uploads</h3>
        
        {/* Container uses -mx to allow cards to scroll to the very edge of the screen */}
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:grid md:grid-cols-3 md:overflow-visible md:px-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-[65vw] flex-shrink-0 snap-start md:w-auto">
                <RecentUploadSkeleton />
              </div>
            ))
          ) : (
            <>
              {recentArtworks.length === 0 ? (
                <div className="w-[65vw] flex-shrink-0 snap-start md:w-auto">
                  <RecentUploadCard
                    isEmptyCard
                    onAddClick={() => setIsUploadModalOpen(true)}
                  />
                </div>
              ) : (
                recentArtworks.map((post) => (
                  // w-[65vw] makes the cards smaller and brings them closer together
                  <div key={post.id} className="w-[65vw] flex-shrink-0 snap-start md:w-auto">
                    <RecentUploadCard post={post} />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </section>

      {/* 3. Discover Others: Wide, Close to Edges */}
      <section className="mb-10 px-2 md:px-8">
        <h3 className="mb-6 px-2 text-xl font-bold md:px-0 md:text-2xl">Discover Others</h3>
        <div className="flex flex-col items-center gap-8">
          {visiblePosts.map((post) => (
            <div key={post.id} className="w-full">
              <ArtPostCard post={post} />
            </div>
          ))}

          {hasMorePosts && (
            <button
              type="button"
              onClick={handleShowMorePosts}
              className="mt-4 rounded-xl bg-[#3e2c23] px-8 py-3 text-sm font-semibold text-[#f5efe6] transition hover:bg-[#5a4636]"
            >
              Show More
            </button>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

// Optimized Skeleton for the new width
function RecentUploadSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col overflow-hidden rounded-2xl bg-[#f7f4f0] shadow-md">
      <div className="h-48 w-full bg-[#eadfce]" />
      <div className="p-3">
        <div className="h-4 w-3/4 rounded bg-[#e6d3b3]" />
      </div>
    </div>
  );
}