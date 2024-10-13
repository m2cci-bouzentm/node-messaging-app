require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();


const validateUserSettingsChange = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Comment content cannot be empty')
    .isLength({ min: 3, max: 1500 })
    .withMessage('Comment content must be at least 3 characters long'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Password must be at least 3 characters long'),
  body('passwordConfirmation')
    .trim()
    .notEmpty()
    .withMessage('Confirm password cannot be empty')
    .isLength({ min: 3, max: 50 })
    .withMessage('Confirm password must be at least 3 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('avatarUrl'),
];

// controllers to update user information 

const userAndTokenAfterChange = async (user) => {
  return new Promise((resolve, reject) => {
    const userWithoutPw = { ...user, password: '' };
    jwt.sign(userWithoutPw, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
      if (err) return reject(err);
      resolve({ userWithoutPw, token });
    });
  });
};

const handleUsernameChange = [
  validateUserSettingsChange[0],
  async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, username } = req.body;
    let user;
    try {
      user = await prisma.user.update({
        where: {
          id
        },
        data: {
          username,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.json({ errors: [{ msg: 'username already exists' }] });
      }
    }

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);

    res.json({ userWithoutPw, token });
  },
];

const handleEmailChange = [
  validateUserSettingsChange[1],
  async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, email } = req.body;
    let user;

    try {
      user = await prisma.user.update({
        where: {
          id
        },
        data: {
          email,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.json({ errors: [{ msg: 'email already exists' }] });
      }
    }

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);

    res.json({ userWithoutPw, token });
  },
];

const handlePasswordChange = [
  validateUserSettingsChange[2],
  validateUserSettingsChange[3],
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        password: hashedPassword,
      },
    });

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);
    res.json({ userWithoutPw, token });
  })
];

const handleAvatarChange = [
  validateUserSettingsChange[4],
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { id, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        avatarUrl,
      },
    });

    const { userWithoutPw, token } = await userAndTokenAfterChange(user);
    res.json({ userWithoutPw, token });
  }),
];



module.exports = {
  handleUsernameChange,
  handleEmailChange,
  handlePasswordChange,
  handleAvatarChange
}