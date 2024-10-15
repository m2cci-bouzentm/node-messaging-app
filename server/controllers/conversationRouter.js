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
    },
  });

  // create and return the newly created conversation including its users and messages
  const conversation = await prisma.conversation.create({
    data: {
      users: {
        connect: users
      }
    },
    include: {
      users: true,
      messages: true
    }
  });

  res.json(conversation);
})

const getAllConversationsByUserId = asyncHandle(async (req, res, next) => {

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: req.currentUser.id
          }
        },
      },
      include: {
        users: true,
        messages: true
      }
    });


    res.json(conversations)
  } catch (error) {
    console.log(error);

  }


})


module.exports = {
  createOrGetIfExistConversationBetweenTwoUsers,
  getAllConversationsByUserId,

}