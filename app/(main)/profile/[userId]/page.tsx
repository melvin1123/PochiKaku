"use client";

import { useParams } from "next/navigation";
import MainLayout from "@/components/main-components/layout/MainLayout";
import ProfileView from "@/components/main-components/profile/ProfileView";
import { useUserProfile } from "@/app/hooks/profile/useUserProfile";

export default function UserProfilePage() {
  const params = useParams();

  const userId = String(params?.userId ?? "");

  const {
    profile,
    stats,
    artworks,
    isLoading,
    error,
    handleFollowToggle,
  } = useUserProfile(userId);

  return (
    <MainLayout>
      <div className="m-3 mt-4">
        <ProfileView
          profile={profile}
          stats={stats}
          artworks={artworks}
          isLoading={isLoading}
          error={error}
          onFollowToggle={handleFollowToggle}
        />
      </div>
    </MainLayout>
  );
}