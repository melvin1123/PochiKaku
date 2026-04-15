import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { Readable } from "node:stream";

type JwtPayload = {
  userId: string;
  email: string;
  username: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function streamUpload(
  buffer: Buffer,
  options: Parameters<typeof cloudinary.uploader.upload_stream>[0],
) {
  return new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result?.secure_url || !result.public_id) {
        reject(new Error("Cloudinary upload did not return the expected result."));
        return;
      }

      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
    });

    Readable.from(buffer).pipe(upload);
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authenticated user not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const file = formData.get("file");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A valid image file is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Please upload a file under 10 MB." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await streamUpload(buffer, {
      folder: "pochikomporo/posts",
      resource_type: "image",
      overwrite: false,
      unique_filename: true,
      use_filename: false,
    });

    const post = await prisma.post.create({
      data: {
        title,
        description: description || null,
        imageUrl: uploaded.secure_url,
        imagePublicId: uploaded.public_id,
        userId: currentUser.id,
      },
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        post,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload route error:", err);

    const message =
      err instanceof Error ? err.message : "Upload failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}