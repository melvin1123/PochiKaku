import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type EventStatus = "Upcoming" | "Ongoing" | "Ended";

type CurrentUser = {
  id: string;
};

type EventCreator = {
  id: string;
  username: string;
};

type EventParticipantWithUser = {
  user: {
    id: string;
    username: string;
  };
};

type EventReferenceImage = {
  id: string;
  imageUrl: string;
};

type EventLike = {
  userId: string;
};

type EventCommentWithUser = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

type EventSubmissionWithDetails = {
  id: string;
  caption: string | null;
  createdAt: Date;
  userId: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  post: {
    id: string;
    title: string | null;
    description: string | null;
    imageUrl: string;
    createdAt: Date;
    likes: EventLike[];
    comments: EventCommentWithUser[];
  };
};

type EventWithDetails = {
  id: string;
  title: string;
  description: string;
  backdropImage: string;
  startDate: Date;
  deadline: Date;
  createdAt: Date;
  createdBy: string;
  creator: EventCreator | null;
  participants: EventParticipantWithUser[];
  referenceImages: EventReferenceImage[];
  submissions: EventSubmissionWithDetails[];
};

function getEventStatus(startDate: Date, deadline: Date): EventStatus {
  const now = new Date();

  if (now > deadline) return "Ended";
  if (now >= startDate && now <= deadline) return "Ongoing";

  return "Upcoming";
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const currentUser = (await getCurrentUserFromToken().catch(
      () => null,
    )) as CurrentUser | null;

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Event id is required." },
        { status: 400 },
      );
    }

    const event = (await prisma.event.findUnique({
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
    })) as EventWithDetails | null;

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 },
      );
    }

    const status = getEventStatus(event.startDate, event.deadline);

    const hasJoined = currentUser
      ? event.participants.some(
          (participant) => participant.user.id === currentUser.id,
        )
      : false;

    const hasSubmitted = currentUser
      ? event.submissions.some(
          (submission) => submission.userId === currentUser.id,
        )
      : false;

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      img: event.backdropImage,
      date: event.startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status,
      startDate: event.startDate.toISOString(),
      deadline: event.deadline.toISOString(),
      createdAt: event.createdAt.toISOString(),
      createdBy: event.createdBy,
      creator: event.creator,
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
          avatarUrl: submission.user.avatarUrl ?? "/avatar.jpg",
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
              avatarUrl: comment.user.avatarUrl ?? "/avatar.jpg",
            },
          })),
        },
      })),
    };

    return NextResponse.json(formattedEvent, { status: 200 });
  } catch (error: unknown) {
    console.error("GET_EVENT_BY_ID_ERROR", error);

    return NextResponse.json(
      { message: "Failed to fetch event." },
      { status: 500 },
    );
  }
}