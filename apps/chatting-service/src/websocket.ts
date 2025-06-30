import redis from "@packages/libs/redis";
import { kafkaClient } from "@packages/utils/kafka";
import { Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";

const producer = kafkaClient.producer();

const connectedUsers: Map<string, WebSocket> = new Map<string, WebSocket>();
const unSeenCount: Map<string, number> = new Map<string, number>();

type incommingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export const createWebsocketServer = async (server: HttpServer) => {
  const wss = new WebSocketServer({ server });
  await producer.connect();
  console.log("kafka producer connected");
  wss.on("connection", (ws: WebSocket) => {
    console.log("New webSocket connection established");
    let registeredUserId: string | null = null;

    ws.on("message", async (message: string) => {
      try {
        const msgStr = message.toString();
        if (!registeredUserId && msgStr.startsWith("{")) {
          registeredUserId = msgStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`registered websocket user ${registeredUserId}`);

          const isSeller = registeredUserId.startsWith("seller_");
          const isRedisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;

          await redis.set(isRedisKey, "true");
          return;
        }

        // process JSON message
        const data: incommingMessage = JSON.parse(msgStr);

        // if it's seen message
        if (data.type === "MARK_AS_SEEN" && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unSeenCount.set(seenKey, 0);
          return;
        }

        // return message
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (
          !fromUserId ||
          !toUserId ||
          !messageBody ||
          !conversationId ||
          !senderType
        ) {
          console.warn("invalid message", data);
          return;
        }

        const now = new Date().toISOString();

        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const receiverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`;

        // Update unceen count dynamically
        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unSeenCount.get(unseenKey) || 0;
        unSeenCount.set(unseenKey, prevCount + 1);

        // send new message to receiver
        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          // also notify unseen count
          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );

          console.log(`Delivered message + unseen count to ${receiverKey}`);
        } else {
          console.log(`User ${receiverKey} offline, message to be queued`);
        }

        // echo message to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Delivered message to ${senderKey}`);
        } else {
          console.log(`User ${senderKey} offline, message to be queued`);
        }

        // send message to kafka
        await producer.send({
          topic: "chatting-service",
          messages: [
            {
              value: JSON.stringify({
                type: "NEW_MESSAGE",
                payload: messagePayload,
              }),
            },
          ],
        });

        console.log(
          `Delivered conversation message to kafka: ${conversationId}`
        );
      } catch (error) {
        console.log("error in ws", error);
      }

      // close connection
      ws.on("close", () => {
        if (registeredUserId) {
          connectedUsers.delete(registeredUserId);
          console.log(`disconnected websocket user ${registeredUserId}`);
          const isSeller = registeredUserId.startsWith("seller_");
          const isRedisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;
          redis.del(isRedisKey);
        }
      });

      ws.on("error", (error) => {
        console.log("error in ws", error);
      });
    });
  });

  console.log("WebSocket server started on port 6004");
};
