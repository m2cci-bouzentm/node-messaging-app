require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

/* 
  Warning: possibly to get the user's groups with the conversations
  Solution: filter the result to get only the conversations with exactly two users
*/
const getAllConversationsByUserId = asyncHandle(async (req, res, next) => {

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
});

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

const getAllGroupsByUserId = asyncHandle(async (req, res, next) => {

  const groupsAndConversations = await prisma.conversation.findMany({
    where: {
      users: {
        some: {
          id: req.currentUser.id,
        },
      }
    },
    include: {
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        }
      },
      messages: {
        include: {
          receivers: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc',
    }
  })

  const groups = groupsAndConversations.filter((g) => g.users.length > 2);

  res.json(groups);
});

const createGroup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('username cannot be empty')
    .isLength({ min: 3, max: 1500 })
    .withMessage('username must be at least 3 characters long'),
  asyncHandle(async (req, res, next) => {

    const result = validationResult(req);
    const { name, usersIds } = req.body;

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }
    if (usersIds.length < 2) {
      return res.json({
        error: {
          message: 'To create a group you must add at least two users to a conversation'
        }
      });
    }


    const users = await prisma.user.findMany({
      where: {
        id: {
          in: [req.currentUser.id, ...usersIds]
        }
      }
    })

    const group = await prisma.conversation.create({
      data: {
        name,
        users: {
          connect: users
        }
      },
      include: {
        messages: true,
        users: true
      }
    });


    res.json(group);

  })];

const removeUserFromGroup = asyncHandle(async (req, res, next) => {
  res.json({ no: 'no' });
})

module.exports = {
  getAllConversationsByUserId,
  createOrGetIfExistConversationBetweenTwoUsers,
  removeUserFromConversation,
  getAllGroupsByUserId,
  createGroup,
  removeUserFromGroup,

};
