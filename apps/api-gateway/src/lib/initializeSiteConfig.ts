import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfigs = await prisma.siteConfig.findMany();

    const configsToCreate = [
      {
        key: "categories",
        config: {
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
      },
      {
        key: "general",
        config: {
          siteName: "E-Shop",
          siteDescription: "Your one-stop shopping destination",
          adminEmail: "admin@example.com",
          supportEmail: "support@example.com",
          phoneNumber: "+1 234 567 890",
          address: "123 E-commerce Street, Digital City, 10001",
          currency: "USD",
          timezone: "UTC",
        },
      },
      {
        key: "appearance",
        config: {
          logo: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
          favicon:
            "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
        },
      },
      {
        key: "email",
        config: {
          smtpHost: "smtp.example.com",
          smtpPort: 587,
          smtpUsername: "username@example.com",
          smtpPassword: "",
          smtpEncryption: "TLS",
        },
      },
      {
        key: "payment",
        config: {
          stripePublicKey: "",
          stripeSecretKey: "",
          webhookSecret: "",
          testMode: false,
        },
      },
    ];

    for (const config of configsToCreate) {
      if (!existingConfigs.some((c: any) => c.key === config.key)) {
        await prisma.siteConfig.create({
          data: {
            key: config.key,
            config: config.config,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error initializing site config:", error);
  }
};

export default initializeSiteConfig;
