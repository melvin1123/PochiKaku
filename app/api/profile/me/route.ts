import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}

export async function GET() {
  try {
    const currentUser = await getCurrentUserFromToken();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        posts: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            likes: true,
            comments: true,
          },
        },
        followers: true,
        following: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const cloudinaryBaseUrl = "https://res.cloudinary.com/dh8rpbwxq/";

    const artworks = user.posts
      .filter((post) => post.imageUrl.startsWith(cloudinaryBaseUrl))
      .map((post) => ({
        id: post.id,
        title: post.title || "Untitled",
        imageUrl: post.imageUrl,
        likes: post.likes.length,
        comments: post.comments.length,
        time: formatTimeAgo(post.createdAt),
        createdAt: post.createdAt.toISOString(),
        artist: user.username,
        artistId: user.id,
        avatar: user.avatarUrl || "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg",
        description: post.description || "",
      }));

    return NextResponse.json({
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg",
        bio: user.bio || "",
        isOwnProfile: true,
        isFollowed: false,
      },
      stats: {
        posts: artworks.length,
        followers: user.followers.length,
        following: user.following.length,
      },
      artworks,
    });
  } catch (error) {
    console.error("GET /api/profile/me error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load profile",
      },
      { status: 500 }
    );
  }
}