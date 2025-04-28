import prisma from "@packages/libs/prisma";
import cron from "node-cron";
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        isDeleted: true,
        createdAt: {
          lte: now,
        },
      },
    });
    console.log(`Deleted ${deletedProducts.count} products at ${now}`);
  } catch (error) {
    console.log(`Error running cron job: ${error}`);
  }
});
