import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

type JwtPayload = {
  userId: string;
  email: string;
  username: string;
};

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("cookie")
      ?.split("token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authenticated user not found" },
        { status: 404 }
      );
    }

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        likes: true,
        comments: true,
      },
    });

    const cloudinaryBaseUrl = "https://res.cloudinary.com/";

    const formattedPosts = posts
      .filter((post) => post.imageUrl.startsWith(cloudinaryBaseUrl))
      .map((post) => ({
        id: post.id,
        title: post.title || "Untitled",
        description: post.description || "",
        image: post.imageUrl,
        artist: post.user.username,
        avatar: post.user.avatarUrl || "/avatar.jpg",
        likes: post.likes.length,
        comments: post.comments.length,
        userId: post.userId,
        createdAt: post.createdAt,
      }));

    const recentUploads = formattedPosts
      .filter((post) => post.userId === currentUser.id)
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
    console.error("Fetch posts error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}