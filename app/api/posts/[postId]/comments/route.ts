import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";
import { createNotification } from "@/lib/notifications"; 
import type { CommentItem } from "@/app/types/comment";
import { NotificationType } from "@/generated/prisma/client";

type Params = {
  params: Promise<{ 
    postId: string;
  }>;
};

type CurrentUser = {
  id: string;
};

type RequestBody = {
  content?: string;
  parentId?: string | null;
};

type CommentWithUser = {
  id: string;
  content: string;
  createdAt: Date;
  parentId?: string | null;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg";

function formatComment(comment: CommentWithUser): CommentItem {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    parentId: comment.parentId ?? null,
    user: {
      id: comment.user.id,
      username: comment.user.username,
      avatarUrl: comment.user.avatarUrl ?? DEFAULT_AVATAR,
    },
  };
}

function isRequestBody(value: unknown): value is RequestBody {
  return typeof value === "object" && value !== null;
}

// --- GET: Fetch all comments for a post ---
export async function GET(_: Request, { params }: Params) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json({ error: "Post id is required" }, { status: 400 });
    }

    const comments = (await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })) as unknown as CommentWithUser[];

    const formatted: CommentItem[] = comments.map(
      (comment: CommentWithUser) => formatComment(comment),
    );

    return NextResponse.json({ comments: formatted });
  } catch (error: unknown) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// --- POST: Create a comment and trigger notification ---
export async function POST(req: Request, { params }: Params) {
  try {
    const currentUser = (await getCurrentUserFromToken()) as CurrentUser | null;
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    if (!postId) {
      return NextResponse.json({ error: "Post id is required" }, { status: 400 });
    }

    const rawBody: unknown = await req.json();
    if (!isRequestBody(rawBody)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const content = typeof rawBody.content === "string" ? rawBody.content.trim() : "";
    const parentId = typeof rawBody.parentId === "string" ? rawBody.parentId : null;

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // 1. Get the post owner info
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Create the comment in the DB
    const comment = (await prisma.comment.create({
      data: {
        content,
        userId: currentUser.id,
        postId: postId,
        parentId: parentId, 
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
    })) as unknown as CommentWithUser;

    // 3. 🔔 NOTIFICATION LOGIC
    try {
      if (!parentId) {
        // SCENARIO A: Top-level comment -> Type: POST_REPLY
        if (post.userId !== currentUser.id) {
          await createNotification({
            recipientId: post.userId,
            actorId: currentUser.id,
            type: "POST_REPLY" as NotificationType, 
            postId: postId,
            commentId: comment.id,
          });
        }
      } else {
        // SCENARIO B: Reply to another comment -> Type: COMMENT_REPLY
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { userId: true },
        });

        if (parentComment && parentComment.userId !== currentUser.id) {
          await createNotification({
            recipientId: parentComment.userId,
            actorId: currentUser.id,
            type: "COMMENT_REPLY" as NotificationType, 
            postId: postId,
            commentId: comment.id,
          });
        }
      }
    } catch (notifError) {
      console.error("Notification failed:", notifError);
    }

    const commentCount = await prisma.comment.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      comment: formatComment(comment),
      comments: commentCount,
    });
  } catch (error: unknown) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}