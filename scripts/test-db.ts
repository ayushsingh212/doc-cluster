import dotenv from "dotenv";
// In your prisma.config.ts or where you initialize prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
dotenv.config()

export { prisma }

async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT 1 as result`;
    console.log("DB query result:", res);
  } catch (err) {
    console.error("DB connection/test query failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
