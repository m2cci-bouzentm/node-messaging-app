require('dotenv').config();

const http = require('http');
const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const jwt = require('jsonwebtoken');

const app = express();

// create web socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://admin.socket.io'],
    // methods: ['GET', 'POST'],
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
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const verifyUser = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader === 'undefined') {
    req.currentUser = null;
    req.jwtErrorMessage = 'authorization header is undefined';
    return next();
  }

  req.token = bearerHeader.split(' ')[1];

  jwt.verify(req.token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      req.currentUser = null;
      req.jwtErrorMessage = err;
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





app.use(verifyUser);
app.use('/', indexRouter);

// only logged in users have access for these routes
app.use('/users', isAuthorized, usersRouter);
app.use('/conversation', isAuthorized, conversationRouter);
app.use('/settings', isAuthorized, settingsRouter);

//TODO needs to bo stocked outside of the socket connection, maybe on the db
const connectedUsers = [];

io.on('connection', (socket) => {

  socket.on('user-connected', (user) => {

    // send the user the already connected users
    socket.emit('share-connected-user', connectedUsers);

    // add the new user to the list of connected users if he isn't  already there
    const userIndex = connectedUsers.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      connectedUsers.push(user);
    }

    // share to everyone else the updated connected users
    socket.broadcast.emit('share-connected-user', connectedUsers);
  });

  socket.on('send-chat-message', (message, room) => {
    console.log("sending message to room :", room);

    socket.to(room).emit('receive-chat-message', message);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
  });


  // remove user from connected users when he logs off
  socket.on("user-disconnected", (user) => {
    console.log("user disconnected ...");

    const userIndex = connectedUsers.findIndex(u => u.id === user.id);
    const disconnectedUser = user;

    if (userIndex !== -1) {
      connectedUsers.splice(userIndex, 1);
    }

    // persist user online status for at least 5 secondes before removing it
    setTimeout(() => {
      // if the disconnectedUser hasn't reconnected in 5sec, then he is disconnected
      if (!(connectedUsers.some(u => u.id === disconnectedUser.id))) {
        socket.broadcast.emit('share-connected-user', connectedUsers);
      }
    }, 5000)
  });

});

instrument(io, {
  auth: false,
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (error, req, res, next) {
  res.status(error.status || 500);
  res.json(error);
});


module.exports = { app, server };
