import { NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { getCurrentUserFromToken } from "@/lib/auth/auth";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

type EventStatus = "Ongoing" | "Upcoming" | "Ended";

const MAX_REFERENCE_IMAGES = 7;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];
const BACKDROP_FOLDER = "events/backdrops";
const REFERENCE_FOLDER = "events/references";

function computeStatus(startDate: Date, deadline: Date): EventStatus {
  const now = new Date();

  if (now < startDate) return "Upcoming";
  if (now > deadline) return "Ended";
  return "Ongoing";
}

function formatDateRange(startDate: Date, deadline: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(startDate)} - ${formatter.format(deadline)}`;
}

function formatEventResponse(event: {
  id: string;
  title: string;
  description: string;
  backdropImage: string;
  startDate: Date;
  deadline: Date;
  createdAt: Date;
  createdBy: string;
  creator: {
    id: string;
    username: string;
  } | null;
  referenceImages: Array<{
    id: string;
    imageUrl: string;
  }>;
  participants: Array<{
    user: {
      id: string;
      username: string;
    };
  }>;
}) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    img: event.backdropImage,
    date: formatDateRange(event.startDate, event.deadline),
    status: computeStatus(event.startDate, event.deadline),
    startDate: event.startDate,
    deadline: event.deadline,
    createdAt: event.createdAt,
    createdBy: event.createdBy,
    creator: event.creator,
    referenceImages: event.referenceImages,
    participants: event.participants.map((participant) => ({
      id: participant.user.id,
      username: participant.user.username,
    })),
  };
}

function isValidDate(date: Date | null) {
  return Boolean(date && !Number.isNaN(date.getTime()));
}

async function getFallbackUserId() {
  const fallbackUser = await prisma.user.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  return fallbackUser?.id ?? null;
}

function validateImageFile(file: File, label: string): string | null {
  if (!file || file.size === 0) {
    return `${label} is empty or invalid.`;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `${label} must be a PNG or JPG image.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${label} must be 15MB or smaller.`;
  }

  return null;
}

async function uploadFileToCloudinary(
  file: File,
  folder: string,
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["png", "jpg", "jpeg"],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    const events = await prisma.event.findMany({
      include: {
        referenceImages: true,
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
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    let joinedEventIds: string[] = [];

    if (user) {
      const joined = await prisma.eventParticipant.findMany({
        where: { userId: user.id },
        select: { eventId: true },
      });

      joinedEventIds = joined.map((item) => item.eventId);
    }

    const formatted = events.map((event) => {
      const base = formatEventResponse(event);

      return {
        ...base,
        joined: joinedEventIds.includes(event.id),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/events failed:", error);
    return NextResponse.json(
      { error: "Failed to load events." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const startDateValue = String(formData.get("startDate") ?? "").trim();
    const deadlineValue = String(formData.get("deadline") ?? "").trim();

    const backdropImageEntry = formData.get("backdropImage");
    const referenceImageEntries = formData.getAll("referenceImages");

    const startDate = startDateValue ? new Date(startDateValue) : null;
    const deadline = deadlineValue ? new Date(deadlineValue) : null;

    if (
      !title ||
      !description ||
      !isValidDate(startDate) ||
      !isValidDate(deadline)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields." },
        { status: 400 },
      );
    }

    if (!(backdropImageEntry instanceof File)) {
      return NextResponse.json(
        { error: "Backdrop image is required." },
        { status: 400 },
      );
    }

  if (!startDate) {
  return NextResponse.json(
    { error: "Start date is required." },
    { status: 400 },
  );
  }

  if (!deadline) {
    return NextResponse.json(
      { error: "Deadline is required." },
      { status: 400 },
    );
  }

  if (deadline < startDate) {
    return NextResponse.json(
      { error: "Deadline cannot be earlier than start date." },
      { status: 400 },
    );
  }

    const backdropValidationError = validateImageFile(
      backdropImageEntry,
      "Backdrop image",
    );

    if (backdropValidationError) {
      return NextResponse.json(
        { error: backdropValidationError },
        { status: 400 },
      );
    }

    const referenceFiles = referenceImageEntries.filter(
      (entry): entry is File => entry instanceof File && entry.size > 0,
    );

    if (referenceFiles.length > MAX_REFERENCE_IMAGES) {
      return NextResponse.json(
        {
          error: `You can upload up to ${MAX_REFERENCE_IMAGES} reference images only.`,
        },
        { status: 400 },
      );
    }

    for (const [index, file] of referenceFiles.entries()) {
      const validationError = validateImageFile(
        file,
        `Reference image ${index + 1}`
      );

      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const createdBy = await getFallbackUserId();

    if (!createdBy) {
      return NextResponse.json(
        { error: "No user found to assign as event creator." },
        { status: 400 },
      );
    }

    const backdropImageUrl = await uploadFileToCloudinary(
      backdropImageEntry,
      BACKDROP_FOLDER,
    );

    const referenceImageUrls = await Promise.all(
      referenceFiles.map((file) =>
        uploadFileToCloudinary(file, REFERENCE_FOLDER),
      ),
    );

    const createdEvent = await prisma.event.create({
      data: {
        title,
        description,
        backdropImage: backdropImageUrl,
        startDate,
        deadline,
        createdBy,
        referenceImages: {
          create: referenceImageUrls.map((imageUrl) => ({
            imageUrl,
          })),
        },
      },
      include: {
        referenceImages: true,
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
        },
      },
    });

    return NextResponse.json(formatEventResponse(createdEvent), {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/events failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create event.",
      },
      { status: 500 },
    );
  }
}
