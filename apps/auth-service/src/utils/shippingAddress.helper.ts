import prisma from "@packages/libs/prisma";
import { z } from "zod";
// Define a schema for address validation using Zod
export const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
  isDefault: z.boolean().optional().default(false),
});

// Shared logic to handle default address
export const handleDefaultAddress = async (
  userId: string,
  excludeId?: string
) => {
  await prisma.shippingAddress.updateMany({
    where: {
      userId,
      ...(excludeId && { id: { not: excludeId } }),
    },
    data: { isDefault: false },
  });
};
