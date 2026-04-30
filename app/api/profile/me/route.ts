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
          where: { type: "post" },
          orderBy: { createdAt: "desc" },
          include: { likes: true, comments: true },
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
      .filter((post) => Boolean(post.imageUrl))
      .map((post) => ({
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
  } catch (error) {
    console.error("GET /api/profile/me error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = (await getCurrentUserFromToken()) as CurrentUser | null;
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Switch from req.json() to req.formData()
    const formData = await req.formData();
    
    const username = formData.get("username")?.toString().trim();
    const bio = formData.get("bio")?.toString().trim();
    const avatarFile = formData.get("avatar") as File | null;

    // 2. Prepare update data
    const updateData: any = {};

    if (username !== undefined) {
      if (username !== "") {
        updateData.username = username;
      } else {
        return NextResponse.json({ error: "Username cannot be empty." }, { status: 400 });
      }
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // 3. Handle Avatar Upload (Optional Logic)
    if (avatarFile) {
      // Here you would typically upload to Cloudinary/S3 
      // and get a URL back. For now, we'll assume you just update text
      // updateData.avatarUrl = uploadedImageUrl;
      console.log("Avatar file received:", avatarFile.name);
    }

    // 4. Execute Update
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
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
  } catch (error: any) {
    console.error("PATCH /api/profile/me error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}