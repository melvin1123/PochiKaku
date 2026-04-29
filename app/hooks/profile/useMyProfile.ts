import { useUserProfileBase } from "./useUserProfileBase";

export function useMyProfile() {
  return useUserProfileBase("/api/profile/me");
}