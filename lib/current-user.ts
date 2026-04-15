import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type CurrentUser = {
  id: string;
  email: string;
  username: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      username: string;
    };

    return {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch {
    return null;
  }
}
