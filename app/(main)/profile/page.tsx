"use client";

import { useState } from "react";
import MainLayout from "@/components/main-components/layout/MainLayout";
import ProfileView from "@/components/main-components/profile/ProfileView";
import EditProfileModal from "@/components/main-components/profile/EditProfileModal";
import { useMyProfile } from "@/app/hooks/profile/useMyProfile";

export default function MyProfilePage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const {
    profile,
    stats,
    artworks,
    isLoading,
    error,
    refetchProfile,
    handleFollowToggle,
  } = useMyProfile();

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
          onEditProfile={() => setIsEditOpen(true)}
        />
      </div>

      {profile && (
        <EditProfileModal
          isOpen={isEditOpen}
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onUpdated={refetchProfile}
        />
      )}
    </MainLayout>
  );
}