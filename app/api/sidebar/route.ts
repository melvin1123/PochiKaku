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

export async function GET() {
  try {
    const user = (await getCurrentUserFromToken().catch(
      () => null,
    )) as SidebarUser | null;

    const now = new Date();

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

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
          }
        : null,
      events: formattedEvents,
    });
  } catch (error: unknown) {
    console.error("GET /api/sidebar error:", error);

    return NextResponse.json({
      user: null,
      events: [],
    });
  }
}