import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Clean in child-to-parent order because of foreign keys
  await prisma.eventSubmission.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.eventReferenceImage.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.event.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [natureTag, portraitTag, contestTag] = await Promise.all([
    prisma.tag.create({
      data: { name: "nature" },
    }),
    prisma.tag.create({
      data: { name: "portrait" },
    }),
    prisma.tag.create({
      data: { name: "contest" },
    }),
  ]);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      password: passwordHash,
      avatarUrl: "/avatar.jpg",
      bio: "Photographer and storyteller.",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      username: "bob",
      password: passwordHash,
      avatarUrl: "/avatar.jpg",
      bio: "I like street and portrait shots.",
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: "carol@example.com",
      username: "carol",
      password: passwordHash,
      avatarUrl: "/avatar.jpg",
      bio: "Event organizer.",
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id },
      { followerId: bob.id, followingId: alice.id },
      { followerId: alice.id, followingId: carol.id },
    ],
  });

  const post1 = await prisma.post.create({
    data: {
      title: "Sunrise by the lake",
      description: "Caught this just before the light changed.",
      imageUrl: "https://picsum.photos/seed/post1/1200/900",
      imagePublicId: null,
      userId: alice.id,
      tags: {
        create: [{ tagId: natureTag.id }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Street portrait",
      description: "One of my favorite frames this week.",
      imageUrl: "https://picsum.photos/seed/post2/1200/900",
      imagePublicId: null,
      userId: bob.id,
      tags: {
        create: [{ tagId: portraitTag.id }],
      },
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        content: "Love the colors here.",
        userId: bob.id,
        postId: post1.id,
      },
      {
        content: "This portrait feels so real.",
        userId: alice.id,
        postId: post2.id,
      },
    ],
  });

  await prisma.like.createMany({
    data: [
      { userId: bob.id, postId: post1.id },
      { userId: carol.id, postId: post1.id },
      { userId: alice.id, postId: post2.id },
    ],
  });

  const event = await prisma.event.create({
    data: {
      title: "April Photo Challenge",
      description: "Submit your best original photo for the month.",
      backdropImage: "https://picsum.photos/seed/event1/1600/900",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
      deadline: new Date("2026-04-30T23:59:59.000Z"),
      createdBy: carol.id,
      referenceImages: {
        create: [
          { imageUrl: "https://picsum.photos/seed/ref1/1200/900" },
          { imageUrl: "https://picsum.photos/seed/ref2/1200/900" },
        ],
      },
    },
  });

  await prisma.postTag.create({
    data: {
      postId: post2.id,
      tagId: contestTag.id,
    },
  });

  const aliceParticipant = await prisma.eventParticipant.create({
    data: {
      userId: alice.id,
      eventId: event.id,
      status: "joined",
    },
  });

  const bobParticipant = await prisma.eventParticipant.create({
    data: {
      userId: bob.id,
      eventId: event.id,
      status: "joined",
    },
  });

  await prisma.eventSubmission.create({
    data: {
      caption: "My entry for the April challenge.",
      participantId: bobParticipant.id,
      userId: bob.id,
      eventId: event.id,
      postId: post2.id,
    },
  });

  console.log("Seed complete.");
  console.log({
    users: 3,
    posts: 2,
    tags: 3,
    participants: 2,
    eventTitle: event.title,
    aliceParticipantId: aliceParticipant.id,
    bobParticipantId: bobParticipant.id,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });