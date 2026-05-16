import { prisma } from "./prisma"; 
import { pusherServer } from "./pusher"; // Ensure this uses process.env.PUSHER_APP_ID, etc.
import { NotificationType } from "../generated/prisma/client";

type NotificationInput = {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
};

export async function createNotification({
  recipientId,
  actorId,
  type,
  postId,
  commentId,
}: NotificationInput) {
  // 1. Never notify a user about their own actions
  if (recipientId === actorId) return null; 

  try {
    // 2. Commit to Database
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        actorId,
        type,
        postId,
        commentId,
      },
      include: {
        actor: {
          select: { username: true, avatarUrl: true }
        }
      }
    });

    // 3. Trigger Real-Time Pusher Alert with a flattened payload
    await pusherServer.trigger(
      `user-${recipientId}`,
      "new-notification",
      {
        id: notification.id,
        type: notification.type,
        actorName: notification.actor.username,
        actorAvatar: notification.actor.avatarUrl,
        createdAt: notification.createdAt.toISOString(), // Serialized to string
        postId: notification.postId,                     // Required for UI routing
      }
    );

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null; 
  }
}