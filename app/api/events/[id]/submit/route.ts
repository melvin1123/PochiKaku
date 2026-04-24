import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromToken } from "@/lib/auth/auth";
import crypto from "node:crypto";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function uploadImageToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "event-submissions";

  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("CLOUDINARY_UPLOAD_ERROR", data);
    throw new Error(data?.error?.message || "Failed to upload image.");
  }

  return {
    imageUrl: data.secure_url as string,
    publicId: data.public_id as string,
  };
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUserFromToken();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await context.params;
    const formData = await req.formData();

    const titleValue = formData.get("title");
    const descriptionValue = formData.get("description");
    const captionValue = formData.get("caption");
    const imageValue = formData.get("image");

    const title =
      typeof titleValue === "string" && titleValue.trim()
        ? titleValue.trim()
        : null;

    const description =
      typeof descriptionValue === "string" && descriptionValue.trim()
        ? descriptionValue.trim()
        : null;

    const caption =
      typeof captionValue === "string" && captionValue.trim()
        ? captionValue.trim()
        : null;

    const imageFile = imageValue instanceof File ? imageValue : null;

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 },
      );
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        startDate: true,
        deadline: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const now = new Date();

    if (now < event.startDate) {
      return NextResponse.json(
        { error: "This event has not started yet." },
        { status: 400 },
      );
    }

    if (now > event.deadline) {
      return NextResponse.json(
        { error: "This event has already ended." },
        { status: 400 },
      );
    }

    const participant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: currentUser.id,
          eventId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You must join this event before submitting." },
        { status: 403 },
      );
    }

    const existingSubmission = await prisma.eventSubmission.findFirst({
      where: {
        eventId,
        userId: currentUser.id,
      },
      select: {
        id: true,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted to this event." },
        { status: 409 },
      );
    }

    const uploadedImage = await uploadImageToCloudinary(imageFile);

    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title,
          description,
          imageUrl: uploadedImage.imageUrl,
          imagePublicId: uploadedImage.publicId,
          type: "event",
          userId: currentUser.id,
        },
      });

      const submission = await tx.eventSubmission.create({
        data: {
          caption,
          participantId: participant.id,
          userId: currentUser.id,
          eventId,
          postId: post.id,
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
                  createdAt: "asc",
                },
              },
            },
          },
        },
      });

      return { post, submission };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Submission created successfully.",
        submission: {
          id: result.submission.id,
          caption: result.submission.caption,
          createdAt: result.submission.createdAt.toISOString(),
          user: {
            id: result.submission.user.id,
            username: result.submission.user.username,
            avatarUrl: result.submission.user.avatarUrl || "/avatar.jpg",
          },
          post: {
            id: result.submission.post.id,
            imageUrl: result.submission.post.imageUrl,
            title: result.submission.post.title,
            description: result.submission.post.description,
            likesCount: result.submission.post.likes.length,
            commentsCount: result.submission.post.comments.length,
            isLiked: false,
            comments: result.submission.post.comments.map((comment) => ({
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
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("EVENT_SUBMIT_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit artwork.",
      },
      { status: 500 },
    );
  }
}
