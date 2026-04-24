import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cloudinaryBaseUrl = "https://res.cloudinary.com/dh8rpbwxq/";

    const posts = await prisma.post.findMany({
      where: {
        type: "post",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const galleryItems = posts
      .filter((post) => post.imageUrl.startsWith(cloudinaryBaseUrl))
      .map((post) => ({
        id: post.id,
        title: post.title || "Untitled",
        artist: post.user.username,
        artistId: post.user.id,
        avatar: post.user.avatarUrl || "/avatar.jpg",
        img: post.imageUrl,
        description: post.description || "",
        createdAt: post.createdAt.toISOString(),
      }));

    return NextResponse.json(galleryItems, { status: 200 });
  } catch (error) {
    console.error("GET /api/gallery error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch gallery",
      },
      { status: 500 }
    );
  }
}