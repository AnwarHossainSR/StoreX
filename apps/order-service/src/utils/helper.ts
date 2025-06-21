import prisma from "@packages/libs/prisma";

// Generate a unique orderId (e.g., SABC-2025-000001)
async function generateOrderId(shopId: string): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const shop = await tx.shops.findUnique({
      where: { id: shopId },
      select: { shopCode: true },
    });

    if (!shop || !shop.shopCode) {
      throw new Error(`Shop with ID ${shopId} not found or missing shopCode`);
    }

    const shopCode = shop.shopCode;
    const year = new Date().getFullYear().toString().slice(-2);
    const maxRetries = 10;
    let sequence = 1;
    let retries = 0;

    // Fetch the last order to initialize sequence
    const lastOrder = await tx.order.findFirst({
      where: {
        shopId,
        orderId: {
          startsWith: `S${shopCode}-${year}-`,
        },
      },
      orderBy: { createdAt: "desc" },
      select: { orderId: true },
    });

    if (lastOrder?.orderId) {
      const lastSequence = parseInt(lastOrder.orderId.split("-")[2], 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    // Try generating a unique orderId
    while (retries < maxRetries) {
      const sequenceStr = sequence.toString().padStart(6, "0");
      const orderId = `S${shopCode}-${year}-${sequenceStr}`;

      // Check if orderId exists
      const existingOrder = await tx.order.findUnique({
        where: { orderId },
      });

      if (!existingOrder) {
        return orderId; // Unique orderId found
      }

      // Conflict found, increment sequence and retry
      sequence++;
      retries++;
    }

    throw new Error(
      `Failed to generate unique orderId for shop ${shopId} after ${maxRetries} retries`
    );
  });
}

// Generate a unique paymentId (e.g., PAY-SABC-25-000001)
async function generatePaymentId(
  orderId: string,
  shopId: string
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const shop = await tx.shops.findUnique({
      where: { id: shopId },
      select: { shopCode: true },
    });

    if (!shop || !shop.shopCode) {
      throw new Error(`Shop with ID ${shopId} not found or missing shopCode`);
    }

    // Fetch order to get orderId (e.g., SABC-25-000001)
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { orderId: true },
    });

    if (!order || !order.orderId) {
      throw new Error(`Order with ID ${orderId} not found or missing orderId`);
    }

    // Derive paymentId from order.orderId
    const paymentId = `PAY-${order.orderId}`;

    // Check for existing paymentId
    const existingPayment = await tx.paymentDistribution.findUnique({
      where: { paymentId },
    });

    if (existingPayment) {
      throw new Error(`Payment ID ${paymentId} already exists`);
    }

    return paymentId;
  });
}

export { generateOrderId, generatePaymentId };
