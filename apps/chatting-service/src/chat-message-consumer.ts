import prisma from "@packages/libs/prisma";
import { incrementUnseenCounter } from "@packages/libs/redis/message.redis";
import { kafkaClient } from "@packages/utils/kafka";
import { EachMessagePayload } from "kafkajs";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat-messages";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;
let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// initialize kafka consumer
export const kafkaConsumer = async () => {
  const consumer = kafkaClient.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log(`[ Consumer ] Subscribed to topic: ${TOPIC}`);

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      const { value } = message;

      try {
        const parsed = JSON.parse(value.toString()) as BufferedMessage;
        buffer.push(parsed);
        // if this is the first message, start a timer to flush the buffer
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDB, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

const flushBufferToDB = async () => {
  if (buffer.length > 0) {
    const toInsert = buffer.splice(0, buffer.length);
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (toInsert.length === 0) return;

    try {
      const prismaPayload = toInsert.map((message) => ({
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderType: message.senderType,
        content: message.content,
        createdAt: new Date(message.createdAt),
      }));

      await prisma.message.createMany({
        data: prismaPayload,
      });

      // redis unseen counter only if db insert is successful
      for (const message of prismaPayload) {
        const receiverType = message.senderType === "user" ? "seller" : "user";
        await incrementUnseenCounter(receiverType, message.conversationId);
      }

      console.log(
        `[ Consumer ] Flushed ${toInsert.length} messages to DB and redis`
      );
    } catch (error) {
      console.error("Error flushing buffer to DB:", error);
      buffer.unshift(...toInsert); // add messages back to the buffer
      if (!flushTimer) {
        flushTimer = setTimeout(flushBufferToDB, BATCH_INTERVAL_MS);
      }
    }
  }
};
