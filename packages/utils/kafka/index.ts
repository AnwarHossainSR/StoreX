import { Kafka } from "kafkajs";

export const kafkaClient = new Kafka({
  clientId: "lkc-2qv80m",
  brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
});
