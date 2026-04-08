import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Prisma Client Properties:", Object.keys(prisma).filter(k => !k.startsWith("_")));
}

main().catch(console.error);
