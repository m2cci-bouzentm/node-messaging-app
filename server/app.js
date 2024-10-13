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


io.on('connection', (socket) => {

  socket.emit('EventName', 'data');

  socket.on('send-chat-message', (message, room) => {
    socket.to(room).emit('receive-chat-message', message);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
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
