import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken }  from "@/lib/auth/auth";

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

    const posts = await prisma.post.findMany({
      where: {
        type: "post",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const cloudinaryBaseUrl = "https://res.cloudinary.com/dh8rpbwxq/";

    const following = await prisma.follow.findMany({
      where: {
        followerId: currentUser.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = new Set(following.map((f) => f.followingId));

    const formattedPosts = posts
      .filter((post) => post.imageUrl.startsWith(cloudinaryBaseUrl))
      .map((post) => ({
        id: post.id,
        image: post.imageUrl,
        title: post.title || "Untitled",
        description: post.description || "",
        artist: post.user.username,
        artistId: post.user.id,
        avatar: post.user.avatarUrl || "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg",
        likes: post.likes.length,
        comments: post.comments.length,
        time: formatTimeAgo(post.createdAt),
        isLiked: post.likes.some((like) => like.userId === currentUser.id),
        isFollowed:
          post.user.id === currentUser.id
            ? true
            : followingIds.has(post.user.id),
        commentsPreview: post.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          user: {
            id: comment.user.id,
            username: comment.user.username,
            avatarUrl: comment.user.avatarUrl || "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg",
          },
        })),
      }));

    const recentUploads = formattedPosts
      .filter((post) => post.artistId === currentUser.id)
      .slice(0, 3);

    return NextResponse.json(
      {
        currentUser: {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.username,
        },
        recentUploads,
        posts: formattedPosts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/posts error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}
