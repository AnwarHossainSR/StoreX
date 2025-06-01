import { kafkaClient } from "@packages/utils/kafka";
import chalk from "chalk";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafkaClient.consumer({
  groupId: "user-events-group",
  maxWaitTimeInMs: 1000,
  maxBytesPerPartition: 1048576,
  metadataMaxAge: 300000,
  sessionTimeout: 30000,
  rebalanceTimeout: 60000,
});

const eventQueue: any[] = [];
const MAX_QUEUE_SIZE = 1000;

const actionColors: Record<string, any> = {
  add_to_wishlist: chalk.magenta,
  remove_from_wishlist: chalk.cyan,
  add_to_cart: chalk.blue,
  remove_from_cart: chalk.yellow,
  product_view: chalk.green,
};

const getColorForAction = (action: string) => {
  return actionColors[action] || chalk.white;
};

const processQueue = async () => {
  if (eventQueue.length === 0) return;

  const batchSize = 100;
  const events = eventQueue.splice(0, Math.min(batchSize, eventQueue.length));

  for (const event of events) {
    if (event.action === "shop_visit") {
      continue;
    }

    const validActions = Object.keys(actionColors);

    if (!event.action || !validActions.includes(event.action)) {
      console.warn(chalk.yellow("Invalid or missing action:"), event);
      continue;
    }

    try {
      await updateUserAnalytics(event);
      const color = getColorForAction(event.action);
      console.log(
        color(
          `Processed event: ${event.action} for ${event.productId} by ${event.userId}`
        )
      );
    } catch (error) {
      console.error(chalk.red("Error processing event:"), error, event);
    }
  }
};

setInterval(processQueue, 3000);

const createTopic = async () => {
  const admin = kafkaClient.admin();
  try {
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes("users-events")) {
      await admin.createTopics({
        waitForLeaders: true,
        topics: [
          {
            topic: "users-events",
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log(chalk.green("Topic users-events created"));
    } else {
      console.log(chalk.green("Topic users-events already exists"));
    }
  } catch (error: any) {
    if (error.type === "TOPIC_ALREADY_EXISTS") {
      console.log(
        chalk.green("Topic users-events already exists, no action needed")
      );
    } else {
      console.error(chalk.red("Error creating/verifying topic:"), error);
    }
  } finally {
    await admin.disconnect();
  }
};

export const consumeKafkaMessages = async () => {
  let retries = 5;
  const retryDelayMs = 5000;

  while (retries > 0) {
    try {
      await consumer.connect();
      console.log(chalk.green("Consumer connected"));
      await consumer.subscribe({ topic: "users-events", fromBeginning: true });
      console.log(chalk.green("Subscribed to topic: users-events"));
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (!message || !message.value) {
            console.warn(chalk.yellow("Empty message received"), {
              topic,
              partition,
            });
            return;
          }
          try {
            const event = JSON.parse(message.value.toString());
            if (eventQueue.length >= MAX_QUEUE_SIZE) {
              console.warn(chalk.yellow("Queue full, dropping event:"), event);
              return;
            }
            eventQueue.push(event);
            const color = getColorForAction(event.action || "");
            console.log(
              color(
                `Message queued: ${event.action} for ${event.productId} by ${event.userId}`
              )
            );
          } catch (error) {
            console.error(chalk.red("Error parsing message:"), error, {
              topic,
              partition,
              value: message.value?.toString(),
            });
          }
        },
      });
      break;
    } catch (error: any) {
      console.error(chalk.red("Consumer error:"), error);
      retries--;
      if (retries === 0) {
        throw new Error(
          `Failed to connect consumer after retries: ${error.message}`
        );
      }
      console.log(
        chalk.yellow(
          `Retrying in ${retryDelayMs}ms... (${retries} retries left)`
        )
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

const shutdown = async () => {
  console.log(chalk.yellow("Shutting down consumer..."));
  try {
    await consumer.disconnect();
    console.log(chalk.green("Consumer disconnected"));
    await processQueue();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error during shutdown:"), error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

consumer.on("consumer.connect", () =>
  console.log(chalk.green("Consumer connected"))
);
consumer.on("consumer.disconnect", () =>
  console.log(chalk.yellow("Consumer disconnected"))
);
consumer.on("consumer.crash", (event) =>
  console.error(chalk.red("Consumer crashed:"), event)
);

const initialize = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await createTopic();
    await consumeKafkaMessages();
  } catch (error) {
    console.error(chalk.red("Error initializing:"), error);
    await shutdown();
  }
};

initialize();
