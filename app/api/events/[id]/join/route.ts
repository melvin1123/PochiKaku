import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const user = await getCurrentUser();

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
        { status: 409 }
      );
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        userId: user.id,
        eventId,
        status: "joined",
      },
    });

    return NextResponse.json(
      { message: "Joined successfully", participant },
      { status: 201 }
    );
  } catch (error) {
    console.error("JOIN_EVENT_ERROR", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
