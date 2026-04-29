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
  const [visiblePostCount, setVisiblePostCount] =
    useState<number>(INITIAL_POST_LIMIT);

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

  const handleShowMorePosts = (): void => {
    setVisiblePostCount((prevCount) => prevCount + POSTS_INCREMENT);
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <RecentUploadSkeleton key={`recent-upload-skeleton-${index}`} />
            ))}
          </div>
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
          <div className="flex flex-wrap gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={`post-skeleton-${index}`} />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : visiblePosts.length === 0 ? (
          <p className="text-[#5a4636]">No posts found.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-6">
              {visiblePosts.map((post) => (
                <ArtPostCard key={post.id} post={post} />
              ))}
            </div>

            {hasMorePosts && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleShowMorePosts}
                  className="rounded-xl bg-[#3e2c23] px-5 py-2.5 text-sm font-semibold text-[#f5efe6] transition hover:bg-[#5a4636]"
                >
                  Show More
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </MainLayout>
  );
}

function RecentUploadSkeleton() {
  return (
    <div className="flex w-60 animate-pulse flex-col overflow-hidden rounded-2xl bg-[#f7f4f0] shadow-md">
      <div className="border-b border-[#e8dfd3] p-3">
        <div className="h-5 w-3/4 rounded bg-[#e6d3b3]" />
      </div>

      <div className="h-65 w-full bg-[#eadfce]" />

      <div className="border-t border-[#e8dfd3] p-3">
        <div className="flex gap-4">
          <div className="h-4 w-20 rounded bg-[#e6d3b3]" />
          <div className="h-4 w-24 rounded bg-[#e6d3b3]" />
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="mx-auto w-220 max-w-full animate-pulse overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex items-center gap-3 border-b border-[#e8dfd3] p-4">
        <div className="h-10 w-10 rounded-full bg-[#e6d3b3]" />

        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-[#e6d3b3]" />
          <div className="h-3 w-20 rounded bg-[#eadfce]" />
        </div>
      </div>

      <div className="space-y-2 px-4 pb-3 pt-3">
        <div className="h-5 w-1/2 rounded bg-[#e6d3b3]" />
        <div className="h-4 w-3/4 rounded bg-[#eadfce]" />
      </div>

      <div className="h-80 w-full bg-[#eadfce]" />

      <div className="flex gap-5 p-4">
        <div className="h-4 w-20 rounded bg-[#e6d3b3]" />
        <div className="h-4 w-24 rounded bg-[#e6d3b3]" />
      </div>
    </div>
  );
}