
const connectedUsersStore = [];

function handleUserConnect(socket, user) {

  // send the user the already connected users
  socket.emit('share-connected-user', connectedUsersStore);

  // add the new user to the list of connected users if he isn't  already there
  const userIndex = connectedUsersStore.findIndex(u => u.id === user.id);
  if (userIndex === -1) {
    connectedUsersStore.push({...user, socketId: socket.id});
  }

  // share to everyone else the updated connected users
  socket.broadcast.emit('share-connected-user', connectedUsersStore);
}

function handleMessageSend(socket, message, conversation) {

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
}

function handleRoomJoin(socket, room) {
  socket.join(room);
}

// remove user from connected users when he logs off
function handleUserDisconnect(socket, user) {
  console.log("user disconnected ...");

  const userIndex = connectedUsersStore.findIndex(u => u.id === user.id);
  const disconnectedUser = { ...user };

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
}

function handleConnectionLost(socket) {
  // search the user that has the same socketId as the socket.id and remove it from online Users
  console.log("connection lost");
  console.log(socket.id);
  
  const userIndex = connectedUsersStore.findIndex(u => u.socketId === socket.id);

  if (userIndex !== -1) {
    connectedUsersStore.splice(userIndex, 1);
    socket.broadcast.emit('share-connected-user', connectedUsersStore);
  }

}

module.exports = {
  handleUserConnect,
  handleMessageSend,
  handleRoomJoin,
  handleUserDisconnect,
  handleConnectionLost
}