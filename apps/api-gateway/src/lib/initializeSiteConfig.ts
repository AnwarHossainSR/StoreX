import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const siteConfig = await prisma.siteConfig.findFirst();

    if (!siteConfig) {
      await prisma.siteConfig.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
            "Health & Beauty",
          ],
          subCategories: {
            Electronics: ["Laptops", "Mobiles", "Tablets"],
            Fashion: ["Mens", "Womens", "Kids"],
            "Home & Kitchen": ["Kitchen", "Dining", "Bedroom"],
            "Sports & Fitness": ["Fitness", "Gym", "Outdoor"],
            "Health & Beauty": ["Skin Care", "Hair Care", "Body Care"],
          },
        },
      });
    }
  } catch (error) {
    console.error("Error initializing site config:", error);
  }
};

export default initializeSiteConfig;
