// 아발론 게임 규칙. 서버에서만 실행된다.
// 소켓을 전혀 모르는 순수 로직이다. room 객체를 받아 상태를 바꾸고, 실패하면 오류 문구를, 성공하면 null을 돌려준다.
//
// 진행 단계(room.phase)
//   lobby    : 입장 대기, 방장이 역할 옵션을 고르고 시작
//   team     : 리더가 원정대를 고름
//   vote     : 전원이 원정대에 찬반 투표
//   quest    : 원정대원이 성공/실패 카드를 냄
//   assassin : 선이 3번 성공한 뒤 암살자가 멀린을 지목
//   end      : 종료, 전원의 역할 공개
const crypto = require('crypto');

const GOOD = 'good';
const EVIL = 'evil';

const ROLES = {
  merlin: { name: '멀린', team: GOOD },
  percival: { name: '퍼시벌', team: GOOD },
  servant: { name: '아서의 충신', team: GOOD },
  assassin: { name: '암살자', team: EVIL },
  morgana: { name: '모르가나', team: EVIL },
  mordred: { name: '모드레드', team: EVIL },
  oberon: { name: '오베론', team: EVIL },
  minion: { name: '모드레드의 하수인', team: EVIL },
};

// 인원별 악의 수와 원정(1~5번째)마다 필요한 원정대 인원
const SETUP = {
  5: { evil: 2, teams: [2, 3, 2, 3, 3] },
  6: { evil: 2, teams: [2, 3, 4, 3, 4] },
  7: { evil: 3, teams: [2, 3, 3, 4, 4] },
  8: { evil: 3, teams: [3, 4, 4, 5, 5] },
  9: { evil: 3, teams: [3, 4, 4, 5, 5] },
  10: { evil: 4, teams: [3, 4, 4, 5, 5] },
};

const MAX_PLAYERS = 10;
const MAX_REJECTS = 5;
const OPTION_KEYS = ['percival', 'morgana', 'mordred', 'oberon'];

// 방장이 고를 수 있는 제한 시간(초). 0은 제한 없음.
//   timers.team   : 원정대 구성, 암살 대상 지목 (토론이 필요한 단계)
//   timers.action : 찬반 투표, 원정 카드 제출
const TIMER_KEYS = ['team', 'action'];
const TIMER_CHOICES = [0, 30, 60, 120, 180, 300];

// 7명 이상일 때 4번째 원정만 실패 카드가 2장 있어야 실패한다.
function failsNeeded(playerCount, questIndex) {
  return playerCount >= 7 && questIndex === 3 ? 2 : 1;
}

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 인원과 옵션으로 역할 구성을 만든다. { good: [...], evil: [...] } 또는 { error }
function buildRoles(playerCount, options) {
  const setup = SETUP[playerCount];
  if (!setup) return { error: '5명에서 10명까지 할 수 있습니다.' };

  const evil = ['assassin'];
  for (const key of ['morgana', 'mordred', 'oberon']) {
    if (options[key]) evil.push(key);
  }
  if (evil.length > setup.evil) {
    return { error: `${playerCount}명 게임은 악이 ${setup.evil}명이라 악의 특수 역할을 줄여야 합니다.` };
  }
  while (evil.length < setup.evil) evil.push('minion');

  const good = ['merlin'];
  if (options.percival) good.push('percival');
  while (good.length < playerCount - setup.evil) good.push('servant');

  return { good, evil };
}

function createRoom(code) {
  return {
    code,
    phase: 'lobby',
    players: [], // { id, token, name, socketId, connected } — 배열 순서가 자리(리더가 도는) 순서
    hostId: null,
    options: { percival: false, morgana: false, mordred: false, oberon: false, timers: { team: 0, action: 0 } },
    game: null,
    lastActive: Date.now(),
  };
}

function findPlayer(room, playerId) {
  return room.players.find((p) => p.id === playerId);
}

// 방장이 없거나 접속이 끊겼으면 접속 중인 첫 번째 사람에게 넘긴다.
function ensureHost(room) {
  const host = findPlayer(room, room.hostId);
  if (host && host.connected) return;
  const next = room.players.find((p) => p.connected) || room.players[0];
  room.hostId = next ? next.id : null;
}

// 입장 또는 재접속. { player } 또는 { error }
//   token : 브라우저가 만들어 보관하는 비밀 값. 같은 token이면 같은 사람으로 보고 원래 자리로 돌려보낸다.
function enter(room, token, name) {
  const returning = room.players.find((p) => p.token === token);
  if (returning) return { player: returning };

  if (room.phase !== 'lobby') {
    // 탭을 완전히 닫아 token을 잃은 사람을 위한 복구: 끊긴 자리와 이름이 같으면 그 자리를 준다.
    const seat = room.players.find((p) => !p.connected && p.name === name);
    if (!seat) return { error: '이미 시작된 게임입니다.' };
    seat.token = token;
    return { player: seat };
  }

  if (room.players.length >= MAX_PLAYERS) return { error: '방이 가득 찼습니다.' };
  if (room.players.some((p) => p.name === name)) return { error: '이미 쓰고 있는 이름입니다.' };

  const player = { id: crypto.randomBytes(4).toString('hex'), token, name, socketId: null, connected: false };
  room.players.push(player);
  if (!room.hostId) room.hostId = player.id;
  return { player };
}

// 접속이 끊겼을 때. 로비에서는 자리를 비우고, 게임 중에는 돌아올 수 있게 자리를 남겨 둔다.
function disconnect(room, playerId) {
  const player = findPlayer(room, playerId);
  if (!player) return;
  player.connected = false;
  player.socketId = null;
  if (room.phase === 'lobby') {
    room.players = room.players.filter((p) => p.id !== playerId);
  }
  ensureHost(room);
}

function setOptions(room, playerId, options) {
  if (room.phase !== 'lobby') return '게임 중에는 바꿀 수 없습니다.';
  if (playerId !== room.hostId) return '방장만 바꿀 수 있습니다.';
  for (const key of OPTION_KEYS) {
    if (typeof options[key] === 'boolean') room.options[key] = options[key];
  }
  const timers = options.timers || {};
  for (const key of TIMER_KEYS) {
    if (TIMER_CHOICES.includes(timers[key])) room.options.timers[key] = timers[key];
  }
  return null;
}

// 단계를 바꾸고, 그 단계에 제한 시간이 걸려 있으면 마감 시각을 잡는다.
// 마감이 지났을 때의 처리는 아래 expire() 가 한다.
function enterPhase(room, phase) {
  const timers = room.options.timers;
  let limit = 0;
  if (phase === 'team' || phase === 'assassin') limit = timers.team;
  if (phase === 'vote' || phase === 'quest') limit = timers.action;

  room.phase = phase;
  room.game.timeLimit = limit; // 초
  room.game.deadline = limit ? Date.now() + limit * 1000 : null; // 서버 시각(ms)
}

function start(room, playerId) {
  if (room.phase !== 'lobby') return '이미 시작했습니다.';
  if (playerId !== room.hostId) return '방장만 시작할 수 있습니다.';
  const built = buildRoles(room.players.length, room.options);
  if (built.error) return built.error;

  const deck = shuffle([...built.good, ...built.evil]);
  const roles = {};
  room.players.forEach((player, i) => {
    roles[player.id] = deck[i];
  });

  room.game = {
    roles, // { 플레이어 id: 역할 키 } — 절대 통째로 클라이언트에 보내지 않는다
    leaderIdx: crypto.randomInt(room.players.length),
    quest: 0, // 지금 몇 번째 원정인지 (0~4)
    rejects: 0, // 이번 원정에서 연속으로 부결된 횟수
    team: [], // 제안된 원정대 (플레이어 id)
    votes: {}, // { 플레이어 id: 찬성 여부 }
    cards: {}, // { 플레이어 id: 성공 여부 }
    results: [], // 끝난 원정들 { team, fails, success }
    lastVote: null, // 직전 투표 결과 (공개 정보)
    end: null, // { winner, reason, targetId }
    timeLimit: 0, // 지금 단계의 제한 시간(초), 0이면 없음
    deadline: null, // 지금 단계의 마감 시각(ms), 없으면 null
    notice: null, // 시간 초과로 자동 처리된 내용을 알리는 문구
  };
  enterPhase(room, 'team');
  return null;
}

function leaderOf(room) {
  return room.players[room.game.leaderIdx];
}

function nextLeader(room) {
  const g = room.game;
  g.leaderIdx = (g.leaderIdx + 1) % room.players.length;
  g.team = [];
  enterPhase(room, 'team');
}

function finish(room, winner, reason, targetId) {
  room.game.end = { winner, reason, targetId: targetId || null };
  enterPhase(room, 'end');
}

function propose(room, playerId, team) {
  const g = room.game;
  if (room.phase !== 'team') return '지금은 원정대를 고르는 단계가 아닙니다.';
  if (playerId !== leaderOf(room).id) return '리더만 원정대를 고를 수 있습니다.';

  const size = SETUP[room.players.length].teams[g.quest];
  const valid =
    Array.isArray(team) &&
    team.length === size &&
    new Set(team).size === size &&
    team.every((id) => findPlayer(room, id));
  if (!valid) return `원정대는 ${size}명이어야 합니다.`;

  g.team = [...team];
  g.votes = {};
  g.notice = null;
  enterPhase(room, 'vote');
  return null;
}

function vote(room, playerId, approve) {
  const g = room.game;
  if (room.phase !== 'vote') return '지금은 투표 단계가 아닙니다.';
  if (typeof approve !== 'boolean') return '잘못된 투표입니다.';
  if (!findPlayer(room, playerId)) return '이 방의 플레이어가 아닙니다.';
  if (playerId in g.votes) return '이미 투표했습니다.';

  g.votes[playerId] = approve;
  if (Object.keys(g.votes).length === room.players.length) resolveVote(room);
  return null;
}

// 투표가 다 모였을 때 결과를 낸다. 찬성이 과반이어야 가결(동수는 부결).
function resolveVote(room) {
  const g = room.game;
  const yes = Object.values(g.votes).filter(Boolean).length;
  const approved = yes * 2 > room.players.length;
  g.lastVote = { quest: g.quest, leaderId: leaderOf(room).id, team: g.team, votes: g.votes, approved };
  g.votes = {};

  if (approved) {
    g.rejects = 0;
    g.cards = {};
    enterPhase(room, 'quest');
  } else {
    addReject(room);
  }
}

// 부결 한 번. 5번 연속이면 악의 승리, 아니면 다음 리더로 넘어간다.
function addReject(room) {
  const g = room.game;
  g.rejects++;
  if (g.rejects >= MAX_REJECTS) finish(room, EVIL, 'rejects');
  else nextLeader(room);
}

function playCard(room, playerId, success) {
  const g = room.game;
  if (room.phase !== 'quest') return '지금은 원정 단계가 아닙니다.';
  if (typeof success !== 'boolean') return '잘못된 카드입니다.';
  if (!g.team.includes(playerId)) return '원정대원만 카드를 낼 수 있습니다.';
  if (playerId in g.cards) return '이미 카드를 냈습니다.';
  if (!success && ROLES[g.roles[playerId]].team === GOOD) return '선의 세력은 성공만 낼 수 있습니다.';

  g.cards[playerId] = success;
  if (Object.keys(g.cards).length === g.team.length) resolveQuest(room);
  return null;
}

// 원정 카드가 다 모였을 때 결과를 낸다. 누가 무엇을 냈는지는 남기지 않고 실패 장수만 기록한다.
function resolveQuest(room) {
  const g = room.game;
  const fails = Object.values(g.cards).filter((card) => !card).length;
  const succeeded = fails < failsNeeded(room.players.length, g.quest);
  g.results.push({ team: g.team, fails, success: succeeded });
  g.cards = {};

  const wins = g.results.filter((r) => r.success).length;
  const losses = g.results.length - wins;
  if (wins >= 3) {
    enterPhase(room, 'assassin');
  } else if (losses >= 3) {
    finish(room, EVIL, 'quests');
  } else {
    g.quest++;
    nextLeader(room);
  }
}

// 제한 시간이 지났으면 게임이 멈추지 않도록 자동으로 처리한다. 무언가 바뀌었으면 true.
//   원정대 구성 : 리더가 못 정하면 부결 1회로 치고 다음 리더로
//   찬반 투표   : 안 낸 사람은 찬성으로
//   원정 카드   : 안 낸 사람은 성공으로
//   암살        : 암살자가 지목하지 못하면 선의 승리
function expire(room, now) {
  const g = room.game;
  if (!g || !g.deadline || now < g.deadline) return false;

  if (room.phase === 'team') {
    const leaderName = leaderOf(room).name;
    addReject(room);
    g.notice = `시간 초과: 리더 ${leaderName} 님이 원정대를 정하지 못해 부결 처리되었습니다.`;
  } else if (room.phase === 'vote') {
    const late = room.players.filter((p) => !(p.id in g.votes));
    for (const p of late) g.votes[p.id] = true;
    resolveVote(room);
    g.notice = `시간 초과: ${late.map((p) => p.name).join(', ')} 님은 찬성으로 처리되었습니다.`;
  } else if (room.phase === 'quest') {
    const late = g.team.filter((id) => !(id in g.cards));
    for (const id of late) g.cards[id] = true;
    resolveQuest(room);
    g.notice = `시간 초과: 내지 않은 카드 ${late.length}장은 성공으로 처리되었습니다.`;
  } else if (room.phase === 'assassin') {
    finish(room, GOOD, 'timeout');
  } else {
    return false;
  }
  return true;
}

function assassinate(room, playerId, targetId) {
  const g = room.game;
  if (room.phase !== 'assassin') return '지금은 암살 단계가 아닙니다.';
  if (g.roles[playerId] !== 'assassin') return '암살자만 지목할 수 있습니다.';
  if (!findPlayer(room, targetId) || targetId === playerId) return '지목할 수 없는 대상입니다.';

  if (g.roles[targetId] === 'merlin') finish(room, EVIL, 'assassin', targetId);
  else finish(room, GOOD, 'survived', targetId);
  return null;
}

// 게임을 끝내고 로비로 돌아간다. (종료 후 다시 하기, 또는 진행 중 강제 중단)
function toLobby(room, playerId) {
  if (room.phase === 'lobby') return '이미 로비입니다.';
  if (playerId !== room.hostId) return '방장만 할 수 있습니다.';
  room.players = room.players.filter((p) => p.connected);
  room.game = null;
  room.phase = 'lobby';
  ensureHost(room);
  return null;
}

// 이 플레이어가 역할 덕분에 알고 있는 다른 사람들. [{ id, label }]
function knowledge(room, playerId) {
  const roles = room.game.roles;
  const myRole = roles[playerId];
  const others = room.players.filter((p) => p.id !== playerId);
  const pick = (test, label) => others.filter((p) => test(roles[p.id])).map((p) => ({ id: p.id, label }));

  if (myRole === 'merlin') {
    // 멀린은 모드레드를 뺀 악을 본다. (오베론은 보인다)
    return pick((role) => ROLES[role].team === EVIL && role !== 'mordred', '악의 세력');
  }
  if (myRole === 'percival') {
    // 퍼시벌은 멀린과 모르가나를 보지만 누가 누구인지는 모른다.
    const label = Object.values(roles).includes('morgana') ? '멀린 또는 모르가나' : '멀린';
    return pick((role) => role === 'merlin' || role === 'morgana', label);
  }
  if (ROLES[myRole].team === EVIL && myRole !== 'oberon') {
    // 악은 서로를 안다. 단, 오베론은 아무도 모르고 아무에게도 안 보인다.
    return pick((role) => ROLES[role].team === EVIL && role !== 'oberon', '악의 동료');
  }
  return [];
}

// 한 플레이어에게 보낼 화면 데이터. 그 사람이 알아도 되는 정보만 담는다.
function viewFor(room, playerId) {
  const view = {
    code: room.code,
    phase: room.phase,
    now: Date.now(), // 서버 시각. 브라우저가 자기 시계와의 차이를 구해 남은 시간을 맞추는 데 쓴다
    you: playerId,
    hostId: room.hostId,
    players: room.players.map((p) => ({ id: p.id, name: p.name, connected: p.connected })),
    options: room.options,
    lobby: null,
    game: null,
  };

  if (room.phase === 'lobby') {
    const built = buildRoles(room.players.length, room.options);
    view.lobby = built.error
      ? { error: built.error }
      : {
          good: built.good.map((key) => ({ key, name: ROLES[key].name })),
          evil: built.evil.map((key) => ({ key, name: ROLES[key].name })),
        };
    return view;
  }

  const g = room.game;
  const count = room.players.length;
  const myRole = g.roles[playerId];
  const revealAssassin = room.phase === 'assassin' || room.phase === 'end';

  view.game = {
    quest: g.quest,
    teamSizes: SETUP[count].teams,
    failsNeeded: SETUP[count].teams.map((_, i) => failsNeeded(count, i)),
    results: g.results,
    rejects: g.rejects,
    leaderId: leaderOf(room).id,
    team: g.team,
    voted: Object.keys(g.votes), // 누가 투표를 마쳤는지만. 찬반은 전원이 끝난 뒤 lastVote로 공개
    myVote: playerId in g.votes ? g.votes[playerId] : null,
    cardsIn: Object.keys(g.cards).length,
    myCard: playerId in g.cards,
    lastVote: g.lastVote,
    timeLimit: g.timeLimit,
    deadline: g.deadline,
    notice: g.notice,
    assassinId: revealAssassin ? room.players.find((p) => g.roles[p.id] === 'assassin').id : null,
    me: { role: myRole, roleName: ROLES[myRole].name, team: ROLES[myRole].team, knows: knowledge(room, playerId) },
    end: null,
  };

  if (room.phase === 'end') {
    const roles = {};
    for (const p of room.players) {
      const key = g.roles[p.id];
      roles[p.id] = { key, name: ROLES[key].name, team: ROLES[key].team };
    }
    view.game.end = { ...g.end, roles };
  }
  return view;
}

module.exports = {
  createRoom,
  enter,
  disconnect,
  setOptions,
  start,
  propose,
  vote,
  playCard,
  assassinate,
  expire,
  toLobby,
  viewFor,
};
