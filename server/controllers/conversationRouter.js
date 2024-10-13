require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const prisma = new PrismaClient();


const createOrGetIfExistConversationBetweenTwoUsers = asyncHandle(async (req, res, next) => {

  const { senderId, receiverId } = req.body;

  // check if there is an existing conversation already established and return it if so
  // TODO what if conversation has more than 2 users === aka groupchat
  const conversationBetweenTwoUsers = await prisma.conversation.findMany({
    where: {
      AND: [
        {
          users: {
            some: {
              id: senderId
            }
          }
        },
        {
          users: {
            some: {
              id: receiverId
            }
          }
        },
        {
          users: {
            every: {
              OR: [
                { id: senderId },
                { id: receiverId }
              ]
            }
          }
        }
      ]
    },
    include: {
      users: {
        select: {
          id: true, username: true, email: true, avatarUrl: true
        }
      },
      messages: true
    }
  });
  
  if (conversationBetweenTwoUsers.length > 0) {
    return res.json(conversationBetweenTwoUsers[0]);
  }
  
  // create new conversation
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { id: senderId },
        { id: receiverId }
      ],
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      users: {
        connect: users
      }
    }
  });

  res.json(conversation);
})

// const allConversations = await prisma.conversation.findMany({
//   include: {
//     users: true,
//     messages: true
//   }
// })


module.exports = {
  createOrGetIfExistConversationBetweenTwoUsers
}