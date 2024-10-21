require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const validateGroup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('group name cannot be empty')
    .isLength({ min: 3, max: 1500 })
    .withMessage('group name must be at least 3 characters long'),
  body('usersIds')
    .isArray({ min: 2 })
    .withMessage('To create a group you must add at least two users to a conversation'),
]

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
          sender: true
        }
      }
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
      messages: {
        include: {
          sender: true
        }
      }
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
          sender: true
        }
      }
    }
  });

  res.json(conversation);
});


const removeUserFromConversation = asyncHandle(async (req, res, next) => {
  //* be careful here, it can result in multiple users-empty OR one-user conversation records
  //* The next block of code is mean to clean the empty conversations once in a while from the db
  /*  
    const allConversations = await prisma.conversation.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          }
        },
        messages: true
      }
    })
    const emptyConversations = allConversations.filter(conversation => conversation.users.length <= 1);
    for (let i = 0; i < emptyConversations.length; i++) {
      await prisma.message.deleteMany({
        where: {
          conversationId: emptyConversations[i].id,
        }
      });
      const resa = await prisma.conversation.delete({
        where: {
          id: emptyConversations[i].id
        }
      });
    }
    */
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
          sender: true
        }
      }
    }
  });

  res.json(conversation);
});



const getGroupByUserId = asyncHandle(async (req, res, next) => {
  const { groupId } = req.params;

  const group = await prisma.conversation.findUnique({
    where: {
      id: groupId
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
          receivers: true,
          sender: true
        }
      }
    }
  })

  res.json(group);
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
          receivers: true,
          sender: true
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
  validateGroup,
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
        messages: {
          include: {
            sender: true,
            receiver: true
          }
        },
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          }
        },
      }
    });


    res.json(group);

  })];

const removeUserFromGroup = asyncHandle(async (req, res, next) => {
  const { groupId, userId } = req.body;
  const groups = await prisma.conversation.update({
    where: {
      id: groupId,
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
          sender: true,
          receiver: true
        }
      }
    }
  });

  res.json(groups);
});

module.exports = {
  getAllConversationsByUserId,
  createOrGetIfExistConversationBetweenTwoUsers,
  removeUserFromConversation,
  getGroupByUserId,
  getAllGroupsByUserId,
  createGroup,
  removeUserFromGroup,

};
