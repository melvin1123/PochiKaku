import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type CurrentUser = {
  id: string;
};

type JoinedEvent = {
  eventId: string;
};

export async function GET() {
  try {
    const user = (await getCurrentUser()) as CurrentUser | null;

    if (!user) {
      return NextResponse.json({ joinedEventIds: [] });
    }

    const joined = (await prisma.eventParticipant.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    })) as JoinedEvent[];

    return NextResponse.json({
      joinedEventIds: joined.map((item) => item.eventId),
    });
  } catch (error: unknown) {
    console.error("GET_JOINED_EVENTS_ERROR", error);

    return NextResponse.json({ joinedEventIds: [] }, { status: 500 });
  }
}