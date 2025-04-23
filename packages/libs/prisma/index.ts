import { PrismaClient } from "@prisma/client";

declare global {
  namespace globalThis {
    // The global variable will hold PrismaClient instance in production to avoid re-creating the client every time
    var prismadb: PrismaClient | undefined;
  }
}

const prisma = globalThis.prismadb || new PrismaClient();

// In production, store the Prisma client on the global object so we don't recreate it every time
if (process.env.NODE_ENV === "production") {
  globalThis.prismadb = prisma;
}

export default prisma;
