import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUserFromToken();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Event id is required." },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        referenceImages: {
          orderBy: {
            id: "desc",
          },
        },
        submissions: {
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
            post: {
              include: {
                likes: true,
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
                    createdAt: "desc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 },
      );
    }

    const now = new Date();

    let status: "Upcoming" | "Ongoing" | "Ended" = "Upcoming";

    if (now > event.deadline) {
      status = "Ended";
    } else if (now >= event.startDate && now <= event.deadline) {
      status = "Ongoing";
    }

    const hasJoined = currentUser
      ? event.participants.some(
          (participant: { user: { id: string } }) =>
            participant.user.id === currentUser.id,
        )
      : false;

    const hasSubmitted = currentUser
      ? event.submissions.some(
          (submission: { userId: string }) =>
            submission.userId === currentUser.id,
        )
      : false;

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      img: event.backdropImage,
      date: new Date(event.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status,
      startDate: event.startDate.toISOString(),
      deadline: event.deadline.toISOString(),
      createdAt: event.createdAt.toISOString(),
      createdBy: event.createdBy,
      creator: event.creator
        ? {
            id: event.creator.id,
            username: event.creator.username,
          }
        : null,
      joined: hasJoined,
      canSubmit: hasJoined,
      hasSubmitted,
      participants: event.participants.map((participant) => ({
        id: participant.user.id,
        username: participant.user.username,
      })),
      referenceImages: event.referenceImages.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
      })),
      submissions: event.submissions.map((submission) => ({
        id: submission.id,
        caption: submission.caption,
        createdAt: submission.createdAt.toISOString(),
        user: {
          id: submission.user.id,
          username: submission.user.username,
          avatarUrl: submission.user.avatarUrl || "/avatar.jpg",
        },
        post: {
          id: submission.post.id,
          title: submission.post.title,
          description: submission.post.description,
          imageUrl: submission.post.imageUrl,
          createdAt: submission.post.createdAt.toISOString(),
          likesCount: submission.post.likes.length,
          commentsCount: submission.post.comments.length,
          isLiked: currentUser
            ? submission.post.likes.some(
                (like) => like.userId === currentUser.id,
              )
            : false,
          comments: submission.post.comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            user: {
              id: comment.user.id,
              username: comment.user.username,
              avatarUrl: comment.user.avatarUrl || "/avatar.jpg",
            },
          })),
        },
      })),
    };

    return NextResponse.json(formattedEvent, { status: 200 });
  } catch (error) {
    console.error("GET_EVENT_BY_ID_ERROR", error);

    return NextResponse.json(
      { message: "Failed to fetch event." },
      { status: 500 },
    );
  }
}
