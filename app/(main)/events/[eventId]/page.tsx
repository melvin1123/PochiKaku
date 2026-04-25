import MainLayout from "@/components/main-components/layout/MainLayout";
import Image from "next/image";
import { notFound } from "next/navigation";
import EventDetailsClient from "@/components/main-components/events/EventDetailsClient";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type PageProps = {
  params: {
    eventId: string;
  };
};

async function getEventDetails(eventId: string) {
  const currentUser = await getCurrentUserFromToken();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
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

  if (!event) return null;

  const now = new Date();

  // ✅ SAFE DATE HANDLING
  const startDate = event.startDate;
  const deadline = event.deadline;

  let status: "Upcoming" | "Ongoing" | "Ended" = "Upcoming";

  if (deadline && now > deadline) {
    status = "Ended";
  } else if (startDate && deadline && now >= startDate && now <= deadline) {
    status = "Ongoing";
  }

  // ✅ SAFE participant typing
  const hasJoined = currentUser
    ? event.participants.some(
        (participant) => participant.user.id === currentUser.id
      )
    : false;

  // ✅ SAFE submission typing
  const hasSubmitted = currentUser
    ? event.submissions.some(
        (submission) => submission.userId === currentUser.id
      )
    : false;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    img: event.backdropImage || "/placeholder.jpg", // ✅ fallback
    date: startDate
      ? new Date(startDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "TBA",
    status,
    startDate: startDate?.toISOString() ?? null,
    deadline: deadline?.toISOString() ?? null,
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
              (like) => like.userId === currentUser.id
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
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { eventId } = params;

  const event = await getEventDetails(eventId);

  if (!event) {
    notFound();
  }

  return (
    <MainLayout>
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="overflow-hidden rounded-3xl border border-[#dccfbe] bg-[#f5efe6] shadow-sm">
            <div className="relative h-64 w-full sm:h-80">
              <Image
                src={event.img}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-[#8a6f5a]">
                    Event Page
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-[#3e2c23]">
                    {event.title}
                  </h1>
                </div>

                <span className="rounded-full border border-[#d7c8b8] bg-[#efe5d8] px-3 py-1 text-sm text-[#5a4636]">
                  {event.status}
                </span>
              </div>

              <p className="text-sm text-[#5a4636] sm:text-base">
                {event.description}
              </p>
            </div>
          </div>

          <EventDetailsClient
            eventId={event.id}
            initialSubmissions={event.submissions || []}
            canSubmit={event.canSubmit}
            hasSubmitted={event.hasSubmitted}
            status={event.status}
          />
        </div>
      </section>
    </MainLayout>
  );
}