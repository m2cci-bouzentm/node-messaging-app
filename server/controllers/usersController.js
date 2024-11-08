require('dotenv').config();

const { Readable } = require('stream');

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: '2MB', preservePath: true });

const prisma = new PrismaClient();

const validateUserMessage = [
  body('content').trim().notEmpty(),
  body('senderId').trim().notEmpty(),
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
      receiversIds,
      conversationId,
    } = req.body;


    let message;

    // handling the case of group chat with multiple receivers
    if (receiversIds && receiversIds.length > 1) {
      message = await prisma.message.create({
        data: {
          content,
          senderId,
          conversationId,
          receivers: {
            connect: await prisma.user.findMany({ where: { id: { in: receiversIds } } })
          },
        },
        include: {
          receivers: true
        }
      });
    } else {
      message = await prisma.message.create({
        data: {
          content,
          senderId,
          receiverId,
          conversationId,
        }
      });
    }

    await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        updatedAt: new Date()
      },
    });
    

    res.json(message);
  })];

const handleFileUpload = [
  upload.single('file'),
  asyncHandle(async (req, res, next) => {

    const { receiverId, conversationId, receiversIds } = req.body;

    const uploadStream = cloudinary.uploader.upload_stream(
      async (error, uploadRes) => {
        if (error) {
          return next(error);
        }

        const fileUrl = uploadRes.secure_url;


        let message;

        // handling the case of group chat with multiple receivers
        if (receiversIds && receiversIds.length > 1) {
          message = await prisma.message.create({
            data: {
              content: fileUrl,
              senderId: req.currentUser.id,
              conversationId,
              receivers: {
                connect: await prisma.user.findMany({ where: { id: { in: JSON.parse(receiversIds) } } })
              },
            },
            include: {
              receivers: true
            }
          });        
        } else {
          message = await prisma.message.create({
            data: {
              content: fileUrl,
              senderId: req.currentUser.id,
              receiverId,
              conversationId,
            }
          });
        }

        await prisma.conversation.update({
          where: {
            id: conversationId
          },
          data: {
            updatedAt: new Date()
          },
        });

        res.json(message);
      });


    Readable.from(req.file.buffer).pipe(uploadStream);
  })
]

module.exports = {
  getUsers,
  getUserById,
  handleFileUpload,
  sendMessage,
}