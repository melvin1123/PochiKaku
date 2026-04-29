import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type CurrentUser = {
  id: string;
};

type UserPost = {
  id: string;
  title: string | null;
  imageUrl: string;
  description: string | null;
  createdAt: Date;
  likes: unknown[];
  comments: unknown[];
};

type EditProfileBody = {
  username?: unknown;
  bio?: unknown;
  avatarUrl?: unknown;
};

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseEditProfileBody(value: unknown): EditProfileBody {
  if (!isRecord(value)) return {};

  return {
    username: value.username,
    bio: value.bio,
    avatarUrl: value.avatarUrl,
  };
}

export async function GET() {
  try {
    const currentUser = (await getCurrentUserFromToken()) as CurrentUser | null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        posts: {
          where: {
            type: "post",
          },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = user.posts as UserPost[];

    const artworks = posts
      .filter((post: UserPost) => Boolean(post.imageUrl))
      .map((post: UserPost) => ({
        id: post.id,
        title: post.title ?? "Untitled",
        imageUrl: post.imageUrl,
        likes: post.likes.length,
        comments: post.comments.length,
        time: formatTimeAgo(post.createdAt),
        createdAt: post.createdAt.toISOString(),
        artist: user.username,
        artistId: user.id,
        avatar: user.avatarUrl ?? DEFAULT_AVATAR,
        description: post.description ?? "",
      }));

    return NextResponse.json({
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl ?? DEFAULT_AVATAR,
        bio: user.bio ?? "",
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
  } catch (error: unknown) {
    console.error("GET /api/profile/me error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load profile",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = (await getCurrentUserFromToken()) as CurrentUser | null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody: unknown = await req.json();
    const body = parseEditProfileBody(rawBody);

    const username =
      typeof body.username === "string" ? body.username.trim() : "";

    const bio = typeof body.bio === "string" ? body.bio.trim() : "";

    const avatarUrl =
      typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "";

    if (!username) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        username,
        bio,
        avatarUrl: avatarUrl || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return NextResponse.json({
      profile: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl ?? DEFAULT_AVATAR,
        bio: updatedUser.bio ?? "",
        isOwnProfile: true,
        isFollowed: false,
      },
    });
  } catch (error: unknown) {
    console.error("PATCH /api/profile/me error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update profile.",
      },
      { status: 500 },
    );
  }
}