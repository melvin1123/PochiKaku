import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type JwtPayload = {
  userId: string;
  email: string;
  username: string;
};

export async function getCurrentUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    return user;
  } catch (error) {
    console.error("getCurrentUserFromToken error:", error);
    return null;
  }
}