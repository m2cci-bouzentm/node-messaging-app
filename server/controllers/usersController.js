require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const validateUserMessage = [
  body('content').trim().notEmpty(),
  body('senderId').trim().notEmpty(),
  body('receiverId').trim().notEmpty(),
  body('conversationId').trim().notEmpty()
]


const getUsers = asyncHandle(async (req, res, next) => {

  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: req.currentUser.id
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
    },
  });

  res.json(users);
});

const getUserById = asyncHandle(async (req, res, next) => {
  const id = req.params.userId;

  const users = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
    },
  });

  res.json(users);
});

const sendMessage = [
  validateUserMessage,
  asyncHandle(async (req, res, next) => {

    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const {
      content,
      senderId,
      receiverId,
      conversationId,
    } = req.body;

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId,
      }
    });
    
    res.json(message);
  })];





module.exports = {
  getUsers,
  getUserById,
  sendMessage,

}