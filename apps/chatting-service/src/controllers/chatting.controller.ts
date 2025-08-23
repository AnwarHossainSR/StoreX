import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "@packages/libs/redis/message.redis";
import { NextFunction, Response } from "express";

// create new conversation
export const createConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { sellerId } = req.body;
  const userId = req.user.id;

  if (!sellerId) {
    return next(new ValidationError("Seller ID is required"));
  }

  try {
    // check is conversationGroup exist
    const conversationGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (conversationGroup) {
      return res.status(200).json({ conversationGroup, isNew: false });
    }

    // create conversationGroup
    const newConversationGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });
    // create participants
    await prisma.participant.createMany({
      data: [
        {
          userId,
          conversationId: newConversationGroup.id,
        },
        {
          sellerId,
          conversationId: newConversationGroup.id,
        },
      ],
    });

    return res
      .status(201)
      .json({ conversationGroup: newConversationGroup, isNew: true });
  } catch (error) {
    return next(error);
  }
};

// get user conversations
export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;

  try {
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          hasEvery: [userId],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (conversation) => {
        // get seller participant inside conversation
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: conversation.id,
            sellerId: {
              not: null,
            },
          },
        });

        // get seller's full information
        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: {
              id: sellerParticipant.sellerId,
            },
            include: {
              shop: {
                select: {
                  avater: true,
                  name: true,
                  id: true,
                },
              },
            },
          });
        }

        // get last message inside conversation
        let lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: conversation.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // check online status form radis
        let isOnline = false;
        if (seller) {
          const isRedisKey = `online:seller:${seller.id}`;
          const redisValue = await redis.get(isRedisKey);
          isOnline = !!redisValue;
        }

        const unreadCount = await getUnseenCount("user", conversation.id);

        return {
          conversationId: conversation.id,
          seller: {
            id: seller?.id,
            name: seller?.shop?.name || "Unknown",
            isOnline,
            avatar: seller?.shop?.avater,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || conversation.createdAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      conversations: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

// getSellerCOnversation
export const getSellerConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const sellerId = req.seller.id;

  try {
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          hasEvery: [sellerId],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (conversation) => {
        // get seller participant inside conversation
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: conversation.id,
            userId: {
              not: null,
            },
          },
        });

        // get seller's full information
        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: {
              id: userParticipant.userId,
            },
            include: {
              avatar: true,
            },
          });
        }

        // get last message inside conversation
        let lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: conversation.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // check online status form radis
        let isOnline = false;
        if (user) {
          const isRedisKey = `online:user:user_${user.id}`;
          const redisValue = await redis.get(isRedisKey);
          isOnline = !!redisValue;
        }

        const unreadCount = await getUnseenCount("seller", conversation.id);

        return {
          conversationId: conversation.id,
          seller: {
            id: user?.id,
            name: user?.name || "Unknown",
            isOnline,
            avatar: user?.avatar,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMessageAt: lastMessage?.createdAt || conversation.createdAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      conversations: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch user messages
export const fetchUserMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    const conversation = await prisma.conversationGroup.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(userId);

    if (!hasAccess) {
      return next(
        new ForbiddenError("You don't have access to this conversation")
      );
    }

    // clear unseen count for this user
    await clearUnseenCount("user", conversationId);

    // get the seller participant
    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId: conversationId,
        sellerId: {
          not: null,
        },
      },
    });

    // fetch seller info
    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: {
          id: sellerParticipant.sellerId,
        },
        include: {
          shop: {
            include: {
              avater: true,
            },
          },
        },
      });

      const isRedisKey = `online:seller:${sellerParticipant.sellerId}`;
      const redisValue = await redis.get(isRedisKey);
      isOnline = !!redisValue;
    }

    // fetch paginated message
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || "Unknown",
        isOnline,
        avatar: seller?.shop?.avater,
      },
      currentPage: page,
      totalPages: Math.ceil(messages.length / limit),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch seller messages
export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { conversationId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    const conversation = await prisma.conversationGroup.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(sellerId);

    if (!hasAccess) {
      return next(
        new ForbiddenError("You don't have access to this conversation")
      );
    }

    // clear unseen count for this user
    await clearUnseenCount("seller", conversationId);

    // get the seller participant
    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId: conversationId,
        userId: {
          not: null,
        },
      },
    });

    // fetch seller info
    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: {
          id: userParticipant.userId,
        },
        include: {
          avatar: true,
        },
      });

      const isRedisKey = `online:user:user_${userParticipant.userId}`;
      const redisValue = await redis.get(isRedisKey);
      isOnline = !!redisValue;
    }

    // fetch paginated message
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: user?.id || null,
        name: user?.name || "Unknown",
        isOnline,
        avatar: user?.avatar,
      },
      currentPage: page,
      totalPages: Math.ceil(messages.length / limit),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    return next(error);
  }
};
