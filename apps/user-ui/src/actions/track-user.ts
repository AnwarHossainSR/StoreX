"use server";
import { kafkaClient } from "@packages/utils/kafka";
import { Partitioners } from "kafkajs";
interface KafkaEvent {
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

const producer = kafkaClient.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export const sendKafkaEvent = async (event: KafkaEvent) => {
  try {
    await producer.connect();
    await producer.send({
      topic: "users-events",
      messages: [{ value: JSON.stringify(event) }],
    });
  } catch (error) {
    console.error("Error sending Kafka event: ", error);
  } finally {
    await producer.disconnect();
  }
};
