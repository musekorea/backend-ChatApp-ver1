const socket = io();

const roomContainer = document.querySelector('#roomContainer');
const roomForm = roomContainer.querySelector('#roomForm');
const roomInput = roomForm.querySelector('#roomInput');
const msgContainer = document.querySelector('#msgContainer');
const msgForm = msgContainer.querySelector('#msgForm');
const msgInput = msgForm.querySelector('#msgInput');
const nickContainer = document.querySelector('#nickContainer');
const nickForm = document.querySelector('#nickForm');
const nickInput = document.querySelector('#nickInput');
const chatUl = document.querySelector('#chatUl');
const userLiscContainer = document.querySelector('#usersList');
roomContainer.hidden = true;
msgContainer.hidden = true;

let roomName;
let nickName = 'anonymous';

const handleNickSubmit = (e) => {
  e.preventDefault();
  socket.emit('makeNick', nickInput.value, showRoom);
  nickName = nickInput.value;
  nickInput.value = '';
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  socket.emit('enterRoom', roomInput.value, showMsg);
  roomName = roomInput.value;
  roomInput.value = '';
};

const handleMsgSubmit = (e) => {
  e.preventDefault();
  const message = msgInput.value;
  socket.emit('sendMessage', msgInput.value, nickName, roomName, () => {
    addMessage(`${nickName}: ${message}`);
  });
  msgInput.value = '';
};
const showRoom = (nick) => {
  nickName = nick;
  nickContainer.hidden = true;
  roomContainer.hidden = false;
  const welcomeNick = document.createElement('h3');
  welcomeNick.innerHTML = `👲 Welcome ${nickName}! Please Join the room`;
  roomContainer.prepend(welcomeNick);
  roomInput.focus();
  roomForm.addEventListener('submit', handleRoomSubmit);
};

const showMsg = (nickName, roomName, roomInfo) => {
  roomContainer.hidden = true;
  msgContainer.hidden = false;
  const roomTitle = msgContainer.querySelector('#roomTitle');
  roomInfo.forEach((room) => {
    if (roomName === room.roomName) {
      const roomUserLength = room.users.length;
      roomTitle.innerHTML = `Room Title :  ${roomName} <span>(${roomUserLength}users)</span>`;
    }
  });

  msgForm.addEventListener('submit', handleMsgSubmit);
  msgInput.focus();
};

const addMessage = (msg) => {
  const li = document.createElement('li');
  li.innerHTML = `${msg}`;
  chatUl.append(li);
  msgInput.focus();
};

socket.on('welcomeRoom', (nickName) => {
  addMessage(`🙋‍♀️${nickName} Joined`);
});

socket.on('byeRoom', (msg) => {
  addMessage(`🧏‍♂️ ${msg} left`);
});

socket.on('newMessage', (msg, nickName) => {
  addMessage(`${nickName}: ${msg}`);
  userLiscContainer.innerHTML = ``;
});

socket.on('newRoom', (rooms) => {
  if (rooms === null || rooms === undefined) {
    return;
  }
  userLiscContainer.innerHTML = ``;
  const roomListContainer = document.querySelector('#roomListContainer');
  const roomListUl = roomListContainer.querySelector('#roomListUl');
  roomListUl.innerHTML = '';
  rooms.forEach((room) => {
    const roomListLi = document.createElement('li');
    roomListLi.innerHTML = `room ${room.roomName} -> ${room.users.length} users`;
    roomListUl.append(roomListLi);
    if (roomName === room.roomName) {
      const userList = document.querySelector('#usersList');
      const userSpan = document.createElement('span');
      userSpan.innerHTML = `Participants : ${room.users}`;
      userList.append(userSpan);
    }
  });
});

nickForm.addEventListener('submit', handleNickSubmit);
