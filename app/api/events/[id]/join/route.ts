import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CurrentUser = {
  id: string;
};

type EventParticipantResponse = {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  createdAt?: Date;
};


export async function POST(_req: Request, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { message: "Event id is required" },
        { status: 400 },
      );
    }

    const user = (await getCurrentUser()) as CurrentUser | null;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { message: "You already joined this event" },
        { status: 409 },
      );
    }

    const participant = (await prisma.eventParticipant.create({
      data: {
        userId: user.id,
        eventId,
        status: "joined",
      },
    })) as EventParticipantResponse;

    return NextResponse.json(
      {
        message: "Joined successfully",
        participant: {
          id: participant.id,
          userId: participant.userId,
          eventId: participant.eventId,
          status: participant.status,
          createdAt: participant.createdAt?.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("JOIN_EVENT_ERROR", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}