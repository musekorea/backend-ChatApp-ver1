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
const submitBtns = document.querySelectorAll('.submit');
const notiContainer = document.querySelector('.notiContainer');
const noti1 = document.querySelector('.noti1');
const noti2 = document.querySelector('.noti2');
const roomListContainer = document.querySelector('#roomListContainer');
const roomListOl = roomListContainer.querySelector('#roomListUl');
const userList = document.querySelector('#usersList');
const chatContainer = document.querySelector('#chatContainer');
const roomTitle = document.querySelector('#roomTitle');

roomContainer.hidden = true;
msgContainer.hidden = true;
userList.hidden = true;
chatContainer.hidden = true;

let roomName;
let nickName = 'anonymous';

const handleNickSubmit = (e) => {
  e.preventDefault();
  roomContainer.hidden = false;
  nickContainer.hidden = true;
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
    addMessage(message, nickName);
  });
  msgInput.value = '';
  checkScroll();
};

const showRoom = (nick) => {
  nickName = nick;
  nickContainer.hidden = true;
  roomContainer.hidden = false;
  noti1.innerHTML = `Welcome ${nickName}!`;
  noti2.innerHTML = `Please Join the room`;
  notiContainer.style.backgroundColor = `tomato`;
  roomInput.focus();
  roomForm.addEventListener('submit', handleRoomSubmit);
};

const showMsg = (nickName, roomName, roomInfo) => {
  notiContainer.remove();
  roomListContainer.remove();
  roomContainer.hidden = true;
  msgContainer.hidden = false;
  chatContainer.hidden = false;
  roomInfo.forEach((room) => {
    if (roomName === room.roomName) {
      const roomUserLength = room.users.length;
      roomTitle.innerHTML = `${roomName}  <span>(${roomUserLength})</span>`;
    }
  });

  msgForm.addEventListener('submit', handleMsgSubmit);
  msgInput.focus();
};

const addMessage = (msg, nick) => {
  const li = document.createElement('li');
  if (nickName === nick) {
    li.className = 'myMsg msgLi';
    li.innerHTML = `${nickName}: ${msg}`;
  } else if (nick === undefined) {
    li.className = 'event msgLi';
    li.innerHTML = `${msg}`;
  } else {
    li.className = 'otherMsg msgLi';
    li.innerHTML = `${nick}: ${msg}`;
  }
  chatUl.append(li);
  msgInput.focus();
};

socket.on('welcomeRoom', (nickName) => {
  addMessage(`🙋‍♀️${nickName} Joined`, undefined);
});

socket.on('byeRoom', (msg) => {
  addMessage(`🧏‍♂️ ${msg} left`, undefined);
});

socket.on('newMessage', (msg, nickName) => {
  addMessage(msg, nickName);
});
const roomListSpan = document.createElement('span');

socket.on('newRoom', (rooms) => {
  if (rooms.length === 0) {
    if (roomListOl.firstChild) {
      roomListOl.hidden = true;
    }
    console.log('noroom');
    roomListContainer.append(roomListSpan);
    roomListSpan.innerHTML = `No rooms now`;
    return;
  }
  roomListSpan.remove();
  roomListOl.hidden = false;
  rooms.forEach((rooms) => {
    if (roomName === rooms.roomName) {
      const roomUserLength = rooms.users.length;
      roomTitle.innerHTML = `${roomName}  <span>(${roomUserLength})</span>`;
    }
  });
  userLiscContainer.innerHTML = ``;
  roomListOl.innerHTML = '';
  rooms.forEach((room) => {
    const roomListLi = document.createElement('li');
    roomListLi.innerHTML = `room ${room.roomName} : ${room.users.length} users`;
    roomListOl.append(roomListLi);
    if (roomName === room.roomName) {
      userList.hidden = false;
      const userSpan = document.createElement('span');
      userSpan.innerHTML = `Participants : ${room.users}`;
      userList.append(userSpan);
    }
  });
});

const checkScroll = () => {
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

nickForm.addEventListener('submit', handleNickSubmit);
nickForm.addEventListener('keydown', (e) => {
  submitBtns[0].classList.add('btnEffect');
});
roomForm.addEventListener('keydown', (e) => {
  submitBtns[1].classList.add('btnEffect');
});
msgForm.addEventListener('keydown', (e) => {
  submitBtns[2].classList.add('btnEffect');
  checkScroll();
});
msgForm.addEventListener('keyup', () => {
  checkScroll();
});

nickInput.focus();
