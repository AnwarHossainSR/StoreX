// import { Kafka } from "kafkajs";

// export const kafkaClient = new Kafka({
//   clientId: "lkc-2qv80m",
//   brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"],
//   ssl: true,
//   sasl: {
//     mechanism: "plain",
//     username: process.env.KAFKA_API_KEY!,
//     password: process.env.KAFKA_API_SECRET!,
//   },
// });

import { Kafka, Partitioners } from "kafkajs";

export const kafkaClient = new Kafka({
  clientId: "store-X",
  brokers: ["localhost:9092"],
});

// Optional: Create a shared producer instance
export const producer = kafkaClient.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
