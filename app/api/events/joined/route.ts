import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ joinedEventIds: [] });
    }

    const joined = await prisma.eventParticipant.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    });

    return NextResponse.json({
      joinedEventIds: joined.map((item) => item.eventId),
    });
  } catch (error) {
    console.error("GET_JOINED_EVENTS_ERROR", error);
    return NextResponse.json(
      { joinedEventIds: [] },
      { status: 500 }
    );
  }
}
