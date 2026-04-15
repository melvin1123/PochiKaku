import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUserFromToken();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await context.params;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "You cannot follow yourself." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
      select: {
        id: true,
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

      return NextResponse.json({
        success: true,
        isFollowed: false,
      });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    });

    return NextResponse.json({
      success: true,
      isFollowed: true,
    });
  } catch (error) {
    console.error("POST /api/users/[userId]/follow error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle follow",
      },
      { status: 500 }
    );
  }
}