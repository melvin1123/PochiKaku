import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
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

  const [
    natureTag,
    portraitTag,
    contestTag,
    streetTag,
    travelTag,
    abstractTag,
  ] = await Promise.all([
    prisma.tag.create({ data: { name: "nature" } }),
    prisma.tag.create({ data: { name: "portrait" } }),
    prisma.tag.create({ data: { name: "contest" } }),
    prisma.tag.create({ data: { name: "street" } }),
    prisma.tag.create({ data: { name: "travel" } }),
    prisma.tag.create({ data: { name: "abstract" } }),
  ]);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        username: "alice",
        password: passwordHash,
        avatarUrl: "/avatar.jpg",
        bio: "Photographer and storyteller.",
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        username: "bob",
        password: passwordHash,
        avatarUrl: "/avatar.jpg",
        bio: "I like street and portrait shots.",
      },
    }),
    prisma.user.create({
      data: {
        email: "carol@example.com",
        username: "carol",
        password: passwordHash,
        avatarUrl: "/avatar.jpg",
        bio: "Event organizer and visual curator.",
      },
    }),
    prisma.user.create({
      data: {
        email: "dave@example.com",
        username: "dave",
        password: passwordHash,
        avatarUrl: "/avatar.jpg",
        bio: "Urban explorer with a camera.",
      },
    }),
    prisma.user.create({
      data: {
        email: "eve@example.com",
        username: "eve",
        password: passwordHash,
        avatarUrl: "/avatar.jpg",
        bio: "Loves mood, texture, and dramatic light.",
      },
    }),
    prisma.user.create({
      data: {
        email: "frank@example.com",
        username: "frank",
        password: passwordHash,
        avatarUrl: "/avatar.jpg",
        bio: "Minimal frames and soft color palettes.",
      },
    }),
  ]);

  const [alice, bob, carol, dave, eve, frank] = users;

  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: bob.id },
      { followerId: alice.id, followingId: carol.id },
      { followerId: alice.id, followingId: eve.id },
      { followerId: bob.id, followingId: alice.id },
      { followerId: bob.id, followingId: dave.id },
      { followerId: carol.id, followingId: alice.id },
      { followerId: carol.id, followingId: bob.id },
      { followerId: dave.id, followingId: eve.id },
      { followerId: eve.id, followingId: alice.id },
      { followerId: frank.id, followingId: carol.id },
      { followerId: frank.id, followingId: bob.id },
    ],
  });

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "Sunrise by the lake",
        description: "Caught this just before the light changed.",
        imageUrl: "https://picsum.photos/seed/post1/1200/1500",
        imagePublicId: null,
        type: "post",
        userId: alice.id,
        tags: {
          create: [{ tagId: natureTag.id }, { tagId: contestTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Street portrait",
        description: "One of my favorite frames this week.",
        imageUrl: "https://picsum.photos/seed/post2/1200/900",
        imagePublicId: null,
        type: "post",
        userId: bob.id,
        tags: {
          create: [{ tagId: portraitTag.id }, { tagId: streetTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Neon crossing",
        description: "Rain, reflections, and night traffic.",
        imageUrl: "https://picsum.photos/seed/post3/1200/1600",
        imagePublicId: null,
        type: "post",
        userId: dave.id,
        tags: {
          create: [{ tagId: streetTag.id }, { tagId: contestTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Quiet balcony light",
        description: "A simple morning scene with soft shadows.",
        imageUrl: "https://picsum.photos/seed/post4/1200/1000",
        imagePublicId: null,
        type: "post",
        userId: eve.id,
        tags: {
          create: [{ tagId: portraitTag.id }, { tagId: abstractTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Road to the coast",
        description: "Travel frame from last weekend.",
        imageUrl: "https://picsum.photos/seed/post5/1200/800",
        imagePublicId: null,
        userId: frank.id,
        tags: {
          create: [{ tagId: travelTag.id }, { tagId: natureTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Window reflections",
        description: "Layered shapes and people in motion.",
        imageUrl: "https://picsum.photos/seed/post6/1200/1450",
        imagePublicId: null,
        userId: alice.id,
        tags: {
          create: [{ tagId: streetTag.id }, { tagId: abstractTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Stillness in blue",
        description: "Minimal composition, lots of negative space.",
        imageUrl: "https://picsum.photos/seed/post7/1200/1700",
        imagePublicId: null,
        userId: eve.id,
        tags: {
          create: [{ tagId: abstractTag.id }, { tagId: contestTag.id }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: "Portrait in warm light",
        description: "Late afternoon sun made this frame work.",
        imageUrl: "https://picsum.photos/seed/post8/1200/1100",
        imagePublicId: null,
        userId: bob.id,
        tags: {
          create: [{ tagId: portraitTag.id }, { tagId: contestTag.id }],
        },
      },
    }),
  ]);

  const [
    post1,
    post2,
    post3,
    post4,
    post5,
    post6,
    post7,
    post8,
  ] = posts;

  await prisma.comment.createMany({
    data: [
      { content: "Love the colors here.", userId: bob.id, postId: post1.id },
      { content: "This portrait feels so real.", userId: alice.id, postId: post2.id },
      { content: "Amazing depth and framing.", userId: eve.id, postId: post3.id },
      { content: "This has such a calm mood.", userId: frank.id, postId: post4.id },
      { content: "Really cinematic.", userId: dave.id, postId: post6.id },
      { content: "The negative space works so well.", userId: carol.id, postId: post7.id },
      { content: "Strong expression here.", userId: eve.id, postId: post8.id },
    ],
  });

  await prisma.like.createMany({
    data: [
      { userId: bob.id, postId: post1.id },
      { userId: carol.id, postId: post1.id },
      { userId: dave.id, postId: post1.id },

      { userId: alice.id, postId: post2.id },
      { userId: carol.id, postId: post2.id },

      { userId: alice.id, postId: post3.id },
      { userId: bob.id, postId: post3.id },
      { userId: eve.id, postId: post3.id },

      { userId: alice.id, postId: post4.id },
      { userId: carol.id, postId: post4.id },

      { userId: bob.id, postId: post5.id },

      { userId: frank.id, postId: post6.id },
      { userId: eve.id, postId: post6.id },

      { userId: alice.id, postId: post7.id },
      { userId: dave.id, postId: post7.id },
      { userId: frank.id, postId: post7.id },

      { userId: carol.id, postId: post8.id },
      { userId: dave.id, postId: post8.id },
    ],
  });

  const ongoingEvent = await prisma.event.create({
    data: {
      title: "April Photo Challenge",
      description:
        "Submit your best original photo for the month. We are looking for strong storytelling, composition, and mood. Use this event page to preview submissions, likes, and comments in a more complete layout.",
      backdropImage: "https://picsum.photos/seed/event1/1800/900",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
      deadline: new Date("2026-04-30T23:59:59.000Z"),
      createdBy: carol.id,
      referenceImages: {
        create: [
          { imageUrl: "https://picsum.photos/seed/ref1/1200/900" },
          { imageUrl: "https://picsum.photos/seed/ref2/1000/1400" },
          { imageUrl: "https://picsum.photos/seed/ref3/1200/1600" },
          { imageUrl: "https://picsum.photos/seed/ref4/1400/1000" },
        ],
      },
    },
  });

  const upcomingEvent = await prisma.event.create({
    data: {
      title: "May Portrait Contest",
      description:
        "An upcoming portrait-focused challenge for expressive and intimate frames.",
      backdropImage: "https://picsum.photos/seed/event2/1800/900",
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      deadline: new Date("2026-05-31T23:59:59.000Z"),
      createdBy: carol.id,
      referenceImages: {
        create: [
          { imageUrl: "https://picsum.photos/seed/upcoming1/1200/1600" },
          { imageUrl: "https://picsum.photos/seed/upcoming2/1200/900" },
        ],
      },
    },
  });

  const endedEvent = await prisma.event.create({
    data: {
      title: "March Street Story Event",
      description:
        "A finished challenge focused on street life, timing, and layered compositions.",
      backdropImage: "https://picsum.photos/seed/event3/1800/900",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      deadline: new Date("2026-03-31T23:59:59.000Z"),
      createdBy: carol.id,
      referenceImages: {
        create: [
          { imageUrl: "https://picsum.photos/seed/ended1/1200/900" },
          { imageUrl: "https://picsum.photos/seed/ended2/1200/1500" },
        ],
      },
    },
  });

  const participants = await Promise.all([
    prisma.eventParticipant.create({
      data: {
        userId: alice.id,
        eventId: ongoingEvent.id,
        status: "joined",
      },
    }),
    prisma.eventParticipant.create({
      data: {
        userId: bob.id,
        eventId: ongoingEvent.id,
        status: "joined",
      },
    }),
    prisma.eventParticipant.create({
      data: {
        userId: dave.id,
        eventId: ongoingEvent.id,
        status: "joined",
      },
    }),
    prisma.eventParticipant.create({
      data: {
        userId: eve.id,
        eventId: ongoingEvent.id,
        status: "joined",
      },
    }),
    prisma.eventParticipant.create({
      data: {
        userId: frank.id,
        eventId: ongoingEvent.id,
        status: "joined",
      },
    }),

    prisma.eventParticipant.create({
      data: {
        userId: alice.id,
        eventId: upcomingEvent.id,
        status: "joined",
      },
    }),
    prisma.eventParticipant.create({
      data: {
        userId: bob.id,
        eventId: upcomingEvent.id,
        status: "joined",
      },
    }),

    prisma.eventParticipant.create({
      data: {
        userId: dave.id,
        eventId: endedEvent.id,
        status: "joined",
      },
    }),
    prisma.eventParticipant.create({
      data: {
        userId: eve.id,
        eventId: endedEvent.id,
        status: "joined",
      },
    }),
  ]);

  const [
    ongoingAliceParticipant,
    ongoingBobParticipant,
    ongoingDaveParticipant,
    ongoingEveParticipant,
    ongoingFrankParticipant,
  ] = participants;

  await Promise.all([
  prisma.eventSubmission.create({
    data: {
      caption: "A quiet sunrise entry with a softer mood and minimal edit.",
      participantId: ongoingAliceParticipant.id,
      userId: alice.id,
      eventId: ongoingEvent.id,
      postId: post1.id,
    },
  }),
  prisma.eventSubmission.create({
    data: {
      caption:
        "My entry for the challenge. I wanted something direct, human, and expressive.",
      participantId: ongoingBobParticipant.id,
      userId: bob.id,
      eventId: ongoingEvent.id,
      postId: post2.id,
    },
  }),
  prisma.eventSubmission.create({
    data: {
      caption:
        "Rainy night, crowded sidewalks, neon reflections, and a bit of motion blur.",
      participantId: ongoingDaveParticipant.id,
      userId: dave.id,
      eventId: ongoingEvent.id,
      postId: post3.id,
    },
  }),
  prisma.eventSubmission.create({
    data: {
      caption:
        "A slower frame built around shape, light, and negative space. I wanted it to feel calm when viewed in the masonry layout.",
      participantId: ongoingEveParticipant.id,
      userId: eve.id,
      eventId: ongoingEvent.id,
      postId: post7.id,
    },
  }),
  prisma.eventSubmission.create({
    data: {
      caption: "Simple travel frame with warm tones and open space.",
      participantId: ongoingFrankParticipant.id,
      userId: frank.id,
      eventId: ongoingEvent.id,
      postId: post5.id,
    },
  }),
]);

  console.log("Seed complete.");
  console.log({
    login: {
      email: "alice@example.com",
      password: "password123",
    },
    users: users.length,
    posts: posts.length,
    ongoingEventId: ongoingEvent.id,
    upcomingEventId: upcomingEvent.id,
    endedEventId: endedEvent.id,
    ongoingEventTitle: ongoingEvent.title,
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
