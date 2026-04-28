import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

type CurrentUser = {
  id: string;
};

type LikeResponse = {
  success: boolean;
  isLiked: boolean;
  likes: number;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const currentUser = (await getCurrentUserFromToken()) as CurrentUser | null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await context.params;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: currentUser.id,
        postId,
      },
      select: {
        id: true,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      const response: LikeResponse = {
        success: true,
        isLiked: false,
        likes: likeCount,
      };

      return NextResponse.json(response);
    }

    await prisma.like.create({
      data: {
        userId: currentUser.id,
        postId,
      },
    });

    const likeCount = await prisma.like.count({
      where: { postId },
    });

    const response: LikeResponse = {
      success: true,
      isLiked: true,
      likes: likeCount,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("POST /api/posts/[postId]/like error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to toggle like",
      },
      { status: 500 },
    );
  }
}