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
    origin: ['http://127.0.0.1:5500', 'https://admin.socket.io'],
    // methods: ['GET', 'POST'],
    credentials: true,
  },
});

// controllers
const indexRouter = require('./routes/index');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
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
});

app.use('/', indexRouter);

const users = {};
io.on('connection', (socket) => {
  socket.on('send-chat-message', (message, room) => {
    // send the message to all connected users

    if (room === '') {
      socket.broadcast.emit('receive-all-message', message)
    } else {
      socket.to(room).emit('receive-all-message', message);
    }
  });

  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('new-user', (newUser) => {
    users[socket.id] = newUser;
    io.emit('user-connected', newUser);
  });

  // disconnect isn't a custom event
  // It triggers when closing the connection with the client
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
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
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.status(err.status || 500);
  res.json(err);
});

// server.listen(4000, () => {
//   console.log('server running');
// });

module.exports = { app, server };
