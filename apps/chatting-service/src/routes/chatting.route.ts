import {
  isAuthenticated,
  withAuth,
} from "@packages/middleware/isAuthenticated";
import express from "express";
import {
  createConversation,
  fetchSellerMessages,
  fetchUserMessages,
  getSellerConversations,
  getUserConversations,
} from "../controllers/chatting.controller";

const router = express.Router();

router.post(
  "/create-user-conversationGroup",
  isAuthenticated,
  createConversation
);

router.get("/get-user-conversations", isAuthenticated, getUserConversations);

router.get(
  "/get-seller-conversations",
  withAuth("seller"),
  getSellerConversations
);

router.get("/get-messages/:conversationId", isAuthenticated, fetchUserMessages);

router.get(
  "/get-seller-messages/:conversationId",
  withAuth("seller"),
  fetchSellerMessages
);

export default router;
