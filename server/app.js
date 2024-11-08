require('dotenv').config();

const http = require('http');
const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const { Server } = require('socket.io');

// const { instrument } = require('@socket.io/admin-ui');

const app = express();

// create web socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://node-messaging-app.vercel.app', 'https://admin.socket.io'],
    credentials: true,
  },
  cookie: true
});

// routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const conversationRouter = require('./routes/conversation');
const settingsRouter = require('./routes/settings');
const messageRouter = require('./routes/message');

const messagingHandlers = require('./eventHandlers/messagingEvents');


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// custom middlewares to verify and authorize user
const verifyUser = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader === 'undefined') {
    req.currentUser = null;
    req.jwtError = { message: 'authorization header is undefined' };
    return next();
  }

  req.token = bearerHeader.split(' ')[1];

  jwt.verify(req.token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      req.currentUser = null;
      req.jwtError = err;
    } else {
      req.currentUser = user;
    }

    next();
  });
}
const isLoggedIn = (req, res, next) => {
  if (req.currentUser === null) {
    return next(new Error({ message: "User not logged in, hence not authorized" }));
  }
  next()
}



app.use(verifyUser);

app.use('/', indexRouter);
// only logged in users have access for these routes
app.use('/users', isLoggedIn, usersRouter);
app.use('/conversation', isLoggedIn, conversationRouter);
app.use('/message', isLoggedIn, messageRouter);
app.use('/settings', isLoggedIn, settingsRouter);





io.on('connection', (socket) => {

  socket.on('user-connected', (user) => messagingHandlers.handleUserConnect(socket, user));

  socket.on('send-chat-message', (message, conversation) => messagingHandlers.handleMessageSend(socket, message, conversation));

  socket.on('join-room', (room) => messagingHandlers.handleRoomJoin(socket, room));

  socket.on("user-disconnected", (user) => messagingHandlers.handleUserDisconnect(socket, user));

  socket.on("disconect",() => messagingHandlers.handleConnectionLost(socket) )
});

// use socket io admin dashboard
// instrument(io, {
//   auth: false,
// });



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (error, req, res, next) {
  console.log(error);


  if (typeof req.jwtError !== undefined) {
    return res.status(error.status || 500).json({ error, jwtError: req.jwtError });
  }

  res.status(error.status || 500).json(error);
});


module.exports = { app, server };
