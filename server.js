// 웹 서버 + 소켓 연결 담당. 게임 규칙은 game.js에 있고, 여기서는 메시지를 받아 넘기고 결과를 뿌리기만 한다.
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const Game = require('./game.js');

const app = express();
app.get('/healthz', (_req, res) => res.send('ok'));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

// 방 상태는 메모리에만 둔다. (Render 무료 티어는 디스크가 없고, 재시작하면 초기화된다)
const rooms = new Map(); // 방 코드 -> room
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const EMPTY_ROOM_TTL = 10 * 60 * 1000; // 접속자가 없는 방을 지우기까지의 시간
const CHAT_MAX_LENGTH = 200; // 채팅 한 줄의 최대 글자 수
const CHAT_HISTORY = 100; // 방마다 보관하는 최근 채팅 수 (나중에 들어오거나 재접속한 사람에게 보여 준다)
const CHAT_BURST = 5; // 도배 방지: CHAT_WINDOW 동안 보낼 수 있는 최대 개수
const CHAT_WINDOW = 5000;

function makeCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

// 방의 모든 접속자에게 같은 내용을 보낸다. (채팅처럼 누구에게나 똑같은 것)
function emitToRoom(room, event, payload) {
  for (const player of room.players) {
    if (player.socketId) io.to(player.socketId).emit(event, payload);
  }
}

// 방의 모든 접속자에게 각자의 화면 데이터를 보낸다. 사람마다 볼 수 있는 정보가 달라서 한 명씩 따로 만든다.
function broadcast(room) {
  room.lastActive = Date.now();
  for (const player of room.players) {
    if (player.socketId) io.to(player.socketId).emit('view', Game.viewFor(room, player.id));
  }
  scheduleTimeout(room);
}

// 지금 단계에 제한 시간이 걸려 있으면, 마감 시각에 Game.expire 가 실행되도록 예약한다.
// 상태가 바뀔 때마다(broadcast) 다시 잡으므로 예약은 방마다 항상 하나뿐이다.
function scheduleTimeout(room) {
  clearTimeout(room.timer);
  room.timer = null;
  const deadline = room.game && room.game.deadline;
  if (!deadline) return;

  room.timer = setTimeout(() => {
    if (rooms.get(room.code) !== room) return; // 그 사이 방이 지워졌다
    if (Game.expire(room, Date.now())) broadcast(room);
    else scheduleTimeout(room); // 타이머가 조금 일찍 울렸으면 다시 예약
  }, Math.max(0, deadline - Date.now()) + 20);
}

// 소켓을 지금 있는 방에서 뗀다. (나가기, 접속 끊김, 다른 방으로 이동)
function detach(socket) {
  const room = rooms.get(socket.data.code);
  const playerId = socket.data.playerId;
  socket.data.code = null;
  socket.data.playerId = null;
  if (!room) return;

  // 방이 비어도 바로 지우지 않는다. 혼자 있던 방장이 새로고침해도 같은 코드로 돌아올 수 있게, 아래 정리 타이머에 맡긴다.
  Game.disconnect(room, playerId);
  broadcast(room);
}

io.on('connection', (socket) => {
  // 방 만들기 / 참가 / 재접속
  socket.on('enter', (msg, ack) => {
    if (typeof ack !== 'function') return;
    msg = msg || {};
    const name = String(msg.name || '').trim().slice(0, 12);
    const token = String(msg.token || '');
    if (!name) return ack({ ok: false, error: '이름을 입력해 주세요.' });
    if (token.length < 16) return ack({ ok: false, error: '잘못된 요청입니다.' });

    detach(socket);

    let room;
    if (msg.create) {
      room = Game.createRoom(makeCode());
    } else {
      room = rooms.get(String(msg.code || '').trim().toUpperCase());
      if (!room) return ack({ ok: false, error: '없는 방 코드입니다.' });
    }

    const result = Game.enter(room, token, name);
    if (result.error) return ack({ ok: false, error: result.error });
    rooms.set(room.code, room);
    room.chat = room.chat || []; // 채팅 기록 { playerId, name, text, at }

    // 같은 사람이 다른 창에서 이미 접속해 있었다면 이전 창을 내보낸다.
    const player = result.player;
    const previous = player.socketId && io.sockets.sockets.get(player.socketId);
    if (previous && previous.id !== socket.id) {
      previous.data.code = null;
      previous.data.playerId = null;
      previous.emit('kicked', '다른 창에서 접속했습니다.');
    }

    player.socketId = socket.id;
    player.connected = true;
    socket.data.code = room.code;
    socket.data.playerId = player.id;
    ack({ ok: true, code: room.code });
    broadcast(room);
    socket.emit('chat-history', room.chat);
  });

  // 채팅. 게임 규칙과 무관하게 방 사람 모두에게 그대로 전달한다.
  socket.on('chat', (msg, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const room = rooms.get(socket.data.code);
    const player = room && room.players.find((p) => p.id === socket.data.playerId);
    if (!player) return reply({ ok: false, error: '방을 찾을 수 없습니다.' });

    const text = String((msg && msg.text) || '').trim().slice(0, CHAT_MAX_LENGTH);
    if (!text) return reply({ ok: false, error: '내용을 입력해 주세요.' });

    const now = Date.now();
    socket.data.chatTimes = (socket.data.chatTimes || []).filter((t) => now - t < CHAT_WINDOW);
    if (socket.data.chatTimes.length >= CHAT_BURST) {
      return reply({ ok: false, error: '너무 빠르게 보내고 있습니다. 잠시 후 다시 보내 주세요.' });
    }
    socket.data.chatTimes.push(now);

    const entry = { playerId: player.id, name: player.name, text, at: now };
    room.chat.push(entry);
    if (room.chat.length > CHAT_HISTORY) room.chat.shift();
    room.lastActive = now;
    reply({ ok: true });
    emitToRoom(room, 'chat', entry);
  });

  // 게임 동작 공통 처리: 방을 찾고, game.js 함수를 부르고, 오류면 본인에게만 알리고, 성공이면 전원에게 새 화면을 보낸다.
  function onAction(event, handler) {
    socket.on(event, (msg, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      const room = rooms.get(socket.data.code);
      if (!room) return reply({ ok: false, error: '방을 찾을 수 없습니다.' });
      const error = handler(room, socket.data.playerId, msg || {});
      if (error) return reply({ ok: false, error });
      reply({ ok: true });
      broadcast(room);
    });
  }

  onAction('options', (room, playerId, msg) => Game.setOptions(room, playerId, msg));
  onAction('start', (room, playerId) => {
    const error = Game.start(room, playerId);
    if (!error) {
      // 게임이 시작되면 대기실에서 나눈 대화를 지우고 새로 시작한다. 빈 기록을 보내 각자의 채팅창도 비운다.
      room.chat = [];
      emitToRoom(room, 'chat-history', room.chat);
    }
    return error;
  });
  onAction('propose', (room, playerId, msg) => Game.propose(room, playerId, msg.team));
  onAction('vote', (room, playerId, msg) => Game.vote(room, playerId, msg.approve));
  onAction('quest', (room, playerId, msg) => Game.playCard(room, playerId, msg.success));
  onAction('assassinate', (room, playerId, msg) => Game.assassinate(room, playerId, msg.targetId));
  onAction('lobby', (room, playerId) => Game.toLobby(room, playerId));

  socket.on('leave', () => detach(socket));
  socket.on('disconnect', () => detach(socket));
});

// 게임 중 전원이 끊긴 채 방치된 방을 정리한다.
setInterval(() => {
  const now = Date.now();
  for (const room of rooms.values()) {
    const empty = room.players.every((p) => !p.connected);
    if (empty && now - room.lastActive > EMPTY_ROOM_TTL) {
      clearTimeout(room.timer);
      rooms.delete(room.code);
    }
  }
}, 60 * 1000).unref();

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`avalon server listening on ${PORT}`);
});
