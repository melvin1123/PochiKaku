import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";

export async function GET() {
  try {
    const user = await getCurrentUserFromToken();
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        startDate: {
          lte: now,
        },
        deadline: {
          gte: now,
        },
      },
      take: 10,
      orderBy: {
        deadline: "asc",
      },
    });

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
          }
        : null,
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        status: "Ongoing" as const,
        dateLabel: `Ends ${event.deadline.toLocaleDateString()}`,
      })),
    });
  } catch (error) {
    console.error("GET /api/sidebar error:", error);

    return NextResponse.json({
      user: null,
      events: [],
    });
  }
}