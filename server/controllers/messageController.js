require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const asyncHandle = require("express-async-handler");

const prisma = new PrismaClient();

const getMessageReadStatus = asyncHandle(async (req, res, next) => {
  const { conversationId } = req.params;

  const messages = await prisma.message.findMany({
    where: {
      receiverId: req.currentUser.id,
      conversationId: conversationId,
      isRead: false,
    },
  });

  res.json({ unReadMessagesCount: messages.length });
});
const handleMessageReadStatusChange = asyncHandle(async (req, res, next) => {
  const { conversationId } = req.body;

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      messages: {
        updateMany: {
          where: {
            isRead: false,
          },
          data: {
            isRead: true,
          },
        },
      },
    },
  });

  res.json({ unReadMessagesCount: 0 });
});

module.exports = {
  getMessageReadStatus,
  handleMessageReadStatusChange,
};
