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
  try {
    await consumer.connect();
    console.log("Consumer connected");
    await consumer.subscribe({ topic: "users-events", fromBeginning: true });
    console.log("Subscribed to topic: users-events");
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message || !message.value) {
          console.warn("Empty message received", { topic, partition });
          return;
        }
        try {
          const event = JSON.parse(message.value.toString());
          eventQueue.push(event);
          console.log("Message queued", { event });
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      },
    });
  } catch (error) {
    console.error("Consumer error:", error);
  }
};

consumer.on("consumer.connect", () => console.log("Consumer connected"));
consumer.on("consumer.disconnect", () => console.log("Consumer disconnected"));
consumer.on("consumer.crash", (event) =>
  console.error("Consumer crashed:", event)
);

consumeKafkaMessages().catch((error) =>
  console.error("error initialize", error)
);
