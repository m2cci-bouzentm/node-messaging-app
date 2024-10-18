require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const prisma = new PrismaClient();

const createOrGetIfExistConversationBetweenTwoUsers = asyncHandle(async (req, res, next) => {
  const { senderId, receiverId } = req.body;

  // check if there is an existing conversation already established and return it if so
  /*  
  * Query explanation :
  - Condition 1: Ensures that at least one user in the conversation has the id equal to senderId.
  - Condition 2: Ensures that at least one user in the conversation has the id equal to receiverId.
  - Condition 3: Ensures that all users in the conversation are either the sender or the receiver
  */
  const conversationBetweenTwoUsers = await prisma.conversation.findMany({
    where: {
      AND: [
        {
          users: {
            some: {
              id: senderId,
            },
          },
        },
        {
          users: {
            some: {
              id: receiverId,
            },
          },
        },
        {
          users: {
            every: {
              OR: [{ id: senderId }, { id: receiverId }],
            },
          },
        },
      ],
    },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
      messages: true,
    },
    orderBy: {
      updatedAt: 'asc',
    }
  });
  
  if (conversationBetweenTwoUsers.length > 0) {
    return res.json(conversationBetweenTwoUsers[0]);
  }

  // get sender and receiver information
  const users = await prisma.user.findMany({
    where: {
      OR: [{ id: senderId }, { id: receiverId }],
    },
  });

  // create and return the newly created conversation including its users and messages while connecting the users to this conversation 
  const conversation = await prisma.conversation.create({
    data: {
      users: {
        connect: users,
      },
    },
    include: {
      users: true,
      messages: true,
    }
  });

  res.json(conversation);
});


/* 
  Warning: possibly to get the user's groups with the conversations
  Solution: filter the result to get only the conversations with exactly two users
  */
const getAllConversationsByUserId = asyncHandle(async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: req.currentUser.id,
          },
        },
      },
      include: {
        users: true,
        messages: true,
      },
      orderBy: {
        updatedAt: 'desc',
      }
    });
    const userConversation = conversations.filter((conv) => conv.users.length === 2);

    res.json(userConversation);
  } catch (error) {
    console.log(error);
  }
});

const removeUserFromConversation = asyncHandle(async (req, res, next) => {
  // TODO be careful here, can cause multiple users-empty OR one-user conversation records. maybe write a script to clean empty conversations once in a while
  const { conversationId, userId } = req.body;
  const conversation = await prisma.conversation.update({
    where: {
      id: conversationId,
      users: {
        some: {
          id: userId,
        },
      },
    },
    data: {
      users: {
        disconnect: {
          id: userId,
        },
      },
    },
    include: {
      users: true,
      messages: true,
    }
  });

  res.json(conversation);
});

module.exports = {
  createOrGetIfExistConversationBetweenTwoUsers,
  getAllConversationsByUserId,
  removeUserFromConversation,
};
