import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

const app = express();

app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views');

app.get('/', (req, res) => {
  res.render('home.pug');
});

const httpServer = http.createServer(app);
const socketServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

let publicRooms = [];

const findPublicRooms = () => {
  publicRooms = [];
  const sids = socketServer.sockets.adapter.sids;
  const rooms = socketServer.sockets.adapter.rooms;
  rooms.forEach((key, value) => {
    if (sids.get(value) === undefined) {
      let nickNames = [];
      const users = rooms.get(value);
      users.forEach((user) => {
        nickNames.push(socketServer.sockets.sockets.get(user).nickName);
      });
      publicRooms.push({ roomName: value, users: nickNames });
    }
  });
  return publicRooms;
};

socketServer.on('connection', (socket) => {
  socketServer.sockets.emit('newRoom', findPublicRooms());
  console.log(`Socket is connected 📌[${socket.id} ]`);
  socket.on('disconnect', (reason) => {
    console.log(reason);
    socketServer.sockets.emit('newRoom', findPublicRooms());
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('byeRoom', socket.nickName);
    });
  });
  socket.onAny((anyEvent) => {
    console.log(`Socket Event:`, anyEvent);
  });
  socket.on('makeNick', (nickName, showRoom) => {
    if (nickName === '') {
      socket.nickName = `anonymous`;
      showRoom(socket.nickName);
    } else {
      socket.nickName = nickName;
      showRoom(nickName);
    }
  });
  socket.on('enterRoom', (roomName, showMsg) => {
    socket.join(roomName);
    findPublicRooms();
    showMsg(socket.nickName, roomName, findPublicRooms());
    socket.to(roomName).emit('welcomeRoom', socket.nickName);
    socketServer.sockets.emit('newRoom', findPublicRooms());
  });

  socket.on('sendMessage', (msg, nickName, roomName, addMessage) => {
    socket.to(roomName).emit('newMessage', msg, nickName);
    addMessage(nickName);
    console.log(socketServer.sockets.adapter.rooms);
    console.log(socketServer.sockets.adapter.rooms.get(roomName).size);
  });
});

instrument(socketServer, {
  auth: false,
});

httpServer.listen(8080, () => {
  console.log(`Server is listening on Port 8080 💚`);
});
