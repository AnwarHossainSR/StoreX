import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAllCollections() {
  try {
    await prisma.shopReviews.deleteMany();
    await prisma.images.deleteMany();
    await prisma.product.deleteMany();
    await prisma.shops.deleteMany();
    await prisma.users.deleteMany();
    await prisma.sellers.deleteMany();
    await prisma.siteConfig.deleteMany();
    await prisma.discountCode.deleteMany();

    console.log("✅ All collections cleared in proper order.");
  } catch (e) {
    console.error("❌ Error clearing DB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllCollections();
