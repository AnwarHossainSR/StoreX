import { kafkaClient } from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafkaClient.consumer({ groupId: "user-events-group" });

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;
  for (const event of events) {
    if (event.action === "shop_visit") {
      // update shop analytics
    }

    const validActions = [
      "remove_from_wishlist",
      "add_to_cart",
      "remove_from_cart",
      "product_view",
    ];

    if (!event.action || !validActions.includes(event.action)) continue;

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }
};

setInterval(processQueue, 3000);

export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "users-events", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message) return;
      const value = message.value?.toString();
      if (!value) return;
      const event = JSON.parse(value);
      eventQueue.push(event);
    },
  });
};

consumeKafkaMessages().catch(console.error);
