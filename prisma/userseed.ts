import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const plainPassword = "password";

  // 🔐 hash password properly
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 🧹 optional: delete existing test user to avoid unique errors
  await prisma.user.deleteMany({
    where: {
      email: "test@example.com",
    },
  });

  // 👤 create user
  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(), // generates unique id
      email: "test@example.com",
      username: "testuser",
      password: hashedPassword,
      avatarUrl: null,
      bio: "Test account",
    },
  });

  console.log("✅ Seeded user:");
  console.log({
    email: user.email,
    password: plainPassword, // so you know what to login with
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });