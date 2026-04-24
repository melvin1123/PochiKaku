import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

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

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUserFromToken().catch(() => null);
    const { userId } = await context.params;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid user id." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
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
        { error: "User not found." },
        { status: 404 }
      );
    }

    const cloudinaryBaseUrl = "https://res.cloudinary.com/dh8rpbwxq/";

    const artworks = user.posts
      .filter((post) => typeof post.imageUrl === "string" && post.imageUrl.startsWith(cloudinaryBaseUrl))
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
        avatar: user.avatarUrl || "/avatar.jpg",
        description: post.description || "",
      }));

    let isFollowed = false;

    if (currentUser && currentUser.id !== user.id) {
      const existingFollow = await prisma.follow.findFirst({
        where: {
          followerId: currentUser.id,
          followingId: user.id,
        },
        select: { id: true },
      });

      isFollowed = Boolean(existingFollow);
    }

    return NextResponse.json(
      {
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl || "/avatar.jpg",
          bio: user.bio || "",
          isOwnProfile: currentUser ? currentUser.id === user.id : false,
          isFollowed,
        },
        stats: {
          posts: artworks.length,
          followers: user.followers.length,
          following: user.following.length,
        },
        artworks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/profile/[userId] error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load profile.",
      },
      { status: 500 }
    );
  }
}