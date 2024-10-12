require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const asyncHandle = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// user input validations
const validateUserSignUp = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('username cannot be empty')
    .isLength({ min: 3, max: 1500 })
    .withMessage('username must be at least 3 characters long'),
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
];
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

// helper function
const isLoggedIn = (res, req, next) => {
  if (req.currentUser === null) {
    return next(new Error('User Not logged In'));
  }
  next();
};

// verify user function to check if user exists in the current database (just like passport verify function) 
const verifyUser = async (username, password) => {

  const user = await prisma.user.findUnique({
    where: { username: username }
  });


  if (!user) {
    return { message: "Incorrect username or doesn't exists" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { message: 'Incorrect password' };
  }
  
  delete user.password;
  return { user };
};

const handleUserLogin = asyncHandle(async (req, res, next) => {
  const { username, password } = req.body;
  const verifyUserRes = await verifyUser(username, password);

  // failed attempt to log in
  if (typeof verifyUserRes.message !== 'undefined') {
    return res.json(verifyUserRes);
  }

  jwt.sign(verifyUserRes.user, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
    if (err) {
      return next(err);
    }

    res.json({ user: verifyUserRes.user, token });
  });
});

const handleUserSignUp = [
  validateUserSignUp,
  asyncHandle(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const userWithoutPw = { ...user, password: '' };
    jwt.sign(userWithoutPw, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        return next(err);
      }

      res.json({ user: userWithoutPw, token });
    });
  }),
];

const verifyUserLogIn = (req, res, next) => {
  if (req.currentUser === null) {
    next(new Error('User Not logged In'));
  }

  res.json(req.currentUser);
};











module.exports = {
  handleUserLogin,
  handleUserSignUp,
  verifyUserLogIn,

}