import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

type SidebarUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

type SidebarEvent = {
  id: string;
  title: string;
  deadline: Date;
};

type SidebarEventResponse = {
  id: string;
  title: string;
  status: "Ongoing";
  dateLabel: string;
};

// Types for the newly integrated notification queries
type DBNotification = {
  id: string;
  type: string;
  postId: string | null;
  createdAt: Date;
  actor: {
    username: string;
    avatarUrl: string | null;
  };
};

type FormattedNotification = {
  id: string;
  type: string;
  actorName: string;
  actorAvatar: string | undefined;
  createdAt: string;
  postId: string | undefined;
};

export async function GET() {
  try {
    const user = (await getCurrentUserFromToken().catch(
      () => null,
    )) as SidebarUser | null;

    const now = new Date();

    // 1. Fetch ongoing events (Your original logic)
    const events = (await prisma.event.findMany({
      where: {
        startDate: {
          lte: now,
        },
        deadline: {
          gte: now,
        },
      },
      select: {
        id: true,
        title: true,
        deadline: true,
      },
      take: 10,
      orderBy: {
        deadline: "asc",
      },
    })) as SidebarEvent[];

    const formattedEvents: SidebarEventResponse[] = events.map(
      (event: SidebarEvent): SidebarEventResponse => ({
        id: event.id,
        title: event.title,
        status: "Ongoing",
        dateLabel: `Ends ${event.deadline.toLocaleDateString()}`,
      }),
    );

    // Initialize notification placeholders if no user token exists
    let unreadCount = 0;
    let formattedNotifications: FormattedNotification[] = [];

    // 2. Add structural notification checks if a user session is active
    if (user?.id) {
      // Fetch unread count matching user destination
      unreadCount = await prisma.notification.count({
        where: {
          recipientId: user.id,
          isRead: false, // Assumes a 'read' boolean flag exists in your notification model
        },
      });

      // Fetch up to 10 recent notifications
      const dbNotifications = (await prisma.notification.findMany({
        where: { recipientId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          actor: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
      })) as unknown as DBNotification[];

      // Flatten structure to ensure strict runtime compatibility with Pusher payloads
      formattedNotifications = dbNotifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        actorName: notif.actor.username,
        actorAvatar: notif.actor.avatarUrl || undefined,
        createdAt: notif.createdAt.toISOString(),
        postId: notif.postId || undefined,
      }));
    }

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
          }
        : null,
      events: formattedEvents,
      unreadCount,
      notifications: formattedNotifications,
    });
  } catch (error: unknown) {
    console.error("GET /api/sidebar error:", error);

    return NextResponse.json({
      user: null,
      events: [],
      unreadCount: 0,
      notifications: [],
    });
  }
}