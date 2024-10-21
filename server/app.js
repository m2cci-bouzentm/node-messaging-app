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
// const indexController = require("./controllers/indexController");

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

app.use(cors());
// app.use(logger('dev'));
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
const isAuthorized = (req, res, next) => {
  if (req.currentUser === null) {
    return next(new Error("User not logged in, hence not authorized"));
  }
  next()
}



app.use('/', indexRouter);

app.use(verifyUser);
// only logged in users have access for these routes
app.use('/users', isAuthorized, usersRouter);
app.use('/conversation', isAuthorized, conversationRouter);
app.use('/settings', isAuthorized, settingsRouter);



const connectedUsersStore = [];

// TODO extract eventHandlers to their own folder inside the controllers folder
io.on('connection', (socket) => {

  socket.on('user-connected', (user) => {

    // send the user the already connected users
    socket.emit('share-connected-user', connectedUsersStore);

    // add the new user to the list of connected users if he isn't  already there
    const userIndex = connectedUsersStore.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      connectedUsersStore.push(user);
    }

    // share to everyone else the updated connected users
    socket.broadcast.emit('share-connected-user', connectedUsersStore);
  });

  socket.on('send-chat-message', (message, conversation) => {

    console.log("sending message to room :", conversation.id);

    // emit notification to the receiver only
    socket.to(message.receiverId).emit('notify-receive-chat-message', message);

    // emit notification to all group members if it's a group
    if (message.receivers) {
      message.receivers.filter(u => u.id !== message.senderId).forEach(receiver => {
        socket.to(receiver.id).emit('notify-receive-chat-message', message, conversation.name);
      });
    }

    // emit the message to the conversation between the two users aka sender/receiver
    socket.to(conversation.id).emit('receive-chat-message', message);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
  });


  // remove user from connected users when he logs off
  socket.on("user-disconnected", (user) => {
    console.log("user disconnected ...");

    const userIndex = connectedUsersStore.findIndex(u => u.id === user.id);
    const disconnectedUser = user;

    if (userIndex !== -1) {
      connectedUsersStore.splice(userIndex, 1);
    }

    // persist user online status for at least 5 secondes before removing it
    setTimeout(() => {
      // if the disconnectedUser hasn't reconnected in 5sec, then he is disconnected
      if (!(connectedUsersStore.some(u => u.id === disconnectedUser.id))) {
        socket.broadcast.emit('share-connected-user', connectedUsersStore);
      }
    }, 5000)
  });

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
