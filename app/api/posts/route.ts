import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";
import type { CommentItem } from "@/app/types/comment";
import type { PostItem } from "@/app/types/post";

type CurrentUser = {
  id: string;
  email: string;
  username: string;
};

type FollowItem = {
  followingId: string;
};

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

type PostWithRelations = {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  userId: string;
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
    const currentUser = (await getCurrentUserFromToken()) as CurrentUser | null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })) as PostWithRelations[];

    const following = (await prisma.follow.findMany({
      where: {
        followerId: currentUser.id,
      },
      select: {
        followingId: true,
      },
    })) as FollowItem[];

    const followingIds = new Set<string>(
      following.map((follow: FollowItem) => follow.followingId),
    );

    const formattedPosts: PostItem[] = posts
      .filter((post: PostWithRelations) => Boolean(post.imageUrl))
      .map((post: PostWithRelations): PostItem => {
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
          image: post.imageUrl,
          title: post.title ?? "Untitled",
          description: post.description ?? "",
          artist: post.user.username,
          artistId: post.user.id,
          avatar: post.user.avatarUrl ?? DEFAULT_AVATAR,
          likes: post.likes.length,
          comments: post.comments.length,
          time: formatTimeAgo(post.createdAt),
          userId: post.userId,
          createdAt: post.createdAt.toISOString(),
          isLiked: post.likes.some(
            (like: PostLike) => like.userId === currentUser.id,
          ),
          isFollowed:
            post.user.id === currentUser.id || followingIds.has(post.user.id),
          commentsPreview,
        };
      });

    const recentUploads: PostItem[] = formattedPosts
      .filter((post: PostItem) => post.artistId === currentUser.id)
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
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/posts error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch posts",
      },
      { status: 500 },
    );
  }
}