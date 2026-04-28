import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GalleryItem } from "@/app/types/gallery";
import type { CommentItem } from "@/app/types/comment";

type PostLike = {
  userId: string;
};

type PostCommentWithUser = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

type GalleryPostWithRelations = {
  id: string;
  title: string | null;
  imageUrl: string;
  description: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  likes: PostLike[];
  comments: PostCommentWithUser[];
};

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

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg";

export async function GET() {
  try {
    const posts = (await prisma.post.findMany({
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
        likes: true,
        comments: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    })) as GalleryPostWithRelations[];

    const galleryItems: GalleryItem[] = posts
      .filter((post: GalleryPostWithRelations) => Boolean(post.imageUrl))
      .map((post: GalleryPostWithRelations): GalleryItem => {
        const commentsPreview: CommentItem[] = post.comments.map(
          (comment: PostCommentWithUser): CommentItem => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            user: {
              id: comment.user.id,
              username: comment.user.username,
              avatarUrl: comment.user.avatarUrl ?? DEFAULT_AVATAR,
            },
          }),
        );

        return {
          id: post.id,
          title: post.title ?? "Untitled",
          image: post.imageUrl,
          artist: post.user.username,
          artistId: post.user.id,
          avatar: post.user.avatarUrl ?? DEFAULT_AVATAR,
          description: post.description ?? "",
          likes: post.likes.length,
          comments: post.comments.length,
          time: formatTimeAgo(post.createdAt),
          createdAt: post.createdAt.toISOString(),
          isLiked: false,
          commentsPreview,
        };
      });

    return NextResponse.json(galleryItems, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/gallery error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch gallery",
      },
      { status: 500 },
    );
  }
}