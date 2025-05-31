import prisma from "@packages/libs/prisma";

// Define the structure of the event object for type safety
interface AnalyticsEvent {
  userId: string;
  productId?: string;
  shopId?: string;
  action:
    | "product_view"
    | "add_to_cart"
    | "remove_from_cart"
    | "add_to_wishlist"
    | "remove_from_wishlist"
    | "purchase";
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  ip?: string;
  device?: string;
}

// Define the structure of an action object as a JSON-compatible type
type Action = {
  productId?: string;
  action: string;
  shopId?: string;
  timestamp: string; // Store as ISO string
};

export const updateUserAnalytics = async (event: AnalyticsEvent) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
    });

    // Safely cast existing actions to Action[] or initialize as empty array
    let updatedActions: Action[] = (existingData?.actions as Action[]) || [];

    const actionExists = updatedActions.some(
      (entry) =>
        entry.productId === event.productId && event.action === entry.action
    );

    // Always store `product_view` actions
    if (event.action === "product_view") {
      updatedActions.push({
        productId: event?.productId,
        action: event.action,
        shopId: event?.shopId,
        timestamp: new Date().toISOString(),
      });
    } else if (
      ["add_to_cart", "add_to_wishlist"].includes(event.action) &&
      !actionExists
    ) {
      updatedActions.push({
        productId: event?.productId,
        action: event.action,
        shopId: event?.shopId,
        timestamp: new Date().toISOString(),
      });
    }
    // Remove add_to_cart when remove_from_cart triggered
    else if (event.action === "remove_from_cart") {
      updatedActions = updatedActions.filter(
        (entry) =>
          !(
            entry.action === "add_to_cart" &&
            entry.productId === event.productId
          )
      );
    }
    // Remove add_to_wishlist when remove_from_wishlist triggered
    else if (event.action === "remove_from_wishlist") {
      updatedActions = updatedActions.filter(
        (entry) =>
          !(
            entry.action === "add_to_wishlist" &&
            entry.productId === event.productId
          )
      );
    }
    // Keep only the last 100 actions
    if (updatedActions.length > 100) {
      updatedActions.shift();
    }

    const extraFields: Record<string, any> = {};

    if (event?.country) {
      extraFields.country = event.country;
    }
    if (event?.city) {
      extraFields.city = event.city;
    }
    if (event?.region) {
      extraFields.region = event.region;
    }
    if (event?.latitude) {
      extraFields.latitude = event.latitude;
    }
    if (event?.longitude) {
      extraFields.longitude = event.longitude;
    }
    if (event?.ip) {
      extraFields.ip = event.ip;
    }
    if (event?.device) {
      extraFields.device = event.device;
    }

    // Update or create user analytics record
    await prisma.userAnalytics.upsert({
      where: {
        userId: event.userId,
      },
      update: {
        lastVisited: new Date(),
        actions: updatedActions as any, // Use 'as any' to bypass type mismatch
        ...extraFields,
      },
      create: {
        userId: event.userId,
        lastVisited: new Date(),
        actions: updatedActions as any, // Use 'as any' to bypass type mismatch
        ...extraFields,
      },
    });

    // Update product analytics
    await updateProductAnalytics(event);
  } catch (error) {
    console.error("Error updating user analytics:", error);
  }
};

export const updateProductAnalytics = async (event: AnalyticsEvent) => {
  try {
    if (!event.productId) return;

    // Define update fields dynamically
    const updateFields: any = {};

    if (event?.action === "product_view") {
      updateFields.views = { increment: 1 };
    }

    if (event?.action === "add_to_cart") {
      updateFields.cartAdds = { increment: 1 };
    }

    if (event?.action === "remove_from_cart") {
      updateFields.cartAdds = { decrement: 1 };
    }

    if (event?.action === "add_to_wishlist") {
      updateFields.wishListAdds = { increment: 1 };
    }

    if (event?.action === "remove_from_wishlist") {
      updateFields.wishListAdds = { decrement: 1 };
    }

    if (event?.action === "purchase") {
      updateFields.purchases = { increment: 1 };
    }

    // Add or update product analytics record
    await prisma.productAnalytics.upsert({
      where: {
        productId: event.productId,
      },
      update: {
        lastViewedAt: new Date(),
        ...updateFields,
      },
      create: {
        productId: event.productId,
        shopId: event?.shopId,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishListAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating product analytics:", error);
  }
};
