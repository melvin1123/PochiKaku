import { prisma } from "@/lib/prisma";

async function main() {
  // 🔹 Create a user
  const newUser = await prisma.user.create({
    data: {
      id: crypto.randomUUID(), // generate unique id
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
      avatarUrl: null,
      bio: "Hello, this is a test user!",
    },
  });

  console.log("✅ Created user:");
  console.log(newUser);

  // 🔹 Fetch all users
  const users = await prisma.user.findMany();

  console.log("\n📦 All users:");
  console.log(JSON.stringify(users, null, 2));

  // 🔹 Find one user by email
  const foundUser = await prisma.user.findUnique({
    where: {
      email: "testuser@example.com",
    },
  });

  console.log("\n🔍 Found user:");
  console.log(foundUser);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });