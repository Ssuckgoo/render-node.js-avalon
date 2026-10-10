// 브라우저 쪽 코드.
// 서버가 보내 주는 view(내가 볼 수 있는 정보만 담긴 객체)를 받아 화면을 통째로 다시 그리고,
// 버튼을 누르면 서버에 메시지를 보낸다. 게임 규칙 판단은 전부 서버(game.js)가 한다.
// 그림(roleArt, initialArt, cardBackArt, ICON)은 art.js 에 있다.

const socket = io();
const $ = (id) => document.getElementById(id);

let view = null; // 서버가 마지막으로 보내 준 화면 데이터. null이면 입장 화면
let roleVisible = false; // 내 역할 카드를 펼쳤는지 (옆 사람이 못 보게 기본은 덮어 둠)
let picked = []; // 리더가 고르는 중인 원정대, 또는 암살자가 고른 대상 (플레이어 id)
let pickKey = ''; // 단계가 바뀌면 picked를 비우기 위한 표시
let clockOffset = 0; // 서버 시계 - 내 시계 (ms). 남은 시간을 서버 기준으로 맞추는 데 쓴다

const ROLE_HINT = {
  merlin: '악의 세력을 알고 있습니다. 정체를 들키면 마지막에 암살당합니다.',
  percival: '멀린을 알아보고 지켜야 합니다.',
  servant: '아는 정보가 없습니다. 원정을 성공시키세요.',
  assassin: '선이 원정을 3번 성공하면, 멀린을 지목해 역전할 수 있습니다.',
  morgana: '퍼시벌에게 멀린처럼 보입니다.',
  mordred: '멀린에게 정체가 보이지 않습니다.',
  oberon: '다른 악과 서로 모릅니다. 멀린에게는 보입니다.',
  minion: '원정을 실패시키세요.',
};

// 캐릭터 설명. 대기 화면에서 초상을 누르면 이 내용이 뜬다.
const ROLE_INFO = {
  merlin: {
    name: '멀린',
    team: 'good',
    tagline: '모든 것을 꿰뚫어 보는 마법사',
    points: [
      ['아는 것', '악의 세력이 누구인지 처음부터 압니다. 단, 모드레드는 보이지 않습니다.'],
      ['약점', '선이 원정을 세 번 성공해도, 암살자가 멀린을 맞히면 악이 이깁니다.'],
      ['요령', '아는 티를 내지 않으면서 원정대 구성과 투표로 선을 이끄세요.'],
    ],
  },
  percival: {
    name: '퍼시벌',
    team: 'good',
    tagline: '멀린을 지키는 기사',
    points: [
      ['아는 것', '멀린이 누구인지 압니다. 모르가나가 있으면 두 사람이 똑같이 멀린 후보로 보입니다.'],
      ['할 일', '누가 진짜 멀린인지 가려내고, 그 사람의 판단을 따르세요.'],
      ['요령', '자신이 멀린인 척해서 암살자의 눈을 끄는 것도 방법입니다.'],
    ],
  },
  servant: {
    name: '아서의 충신',
    team: 'good',
    tagline: '아서 왕에게 충성하는 기사',
    points: [
      ['아는 것', '특별한 정보가 없습니다.'],
      ['할 일', '투표 결과와 원정 결과를 단서로 누가 악인지 추리하세요.'],
      ['제약', '원정 카드는 성공만 낼 수 있습니다.'],
    ],
  },
  assassin: {
    name: '암살자',
    team: 'evil',
    tagline: '마지막 순간에 멀린을 노리는 자',
    points: [
      ['아는 것', '동료 악이 누구인지 압니다. (오베론 제외)'],
      ['능력', '선이 원정을 세 번 성공하면 한 명을 멀린으로 지목합니다. 맞히면 악이 역전합니다.'],
      ['요령', '게임 내내 누가 지나치게 많이 아는 것처럼 구는지 지켜보세요.'],
    ],
  },
  morgana: {
    name: '모르가나',
    team: 'evil',
    tagline: '멀린을 흉내 내는 마녀',
    points: [
      ['아는 것', '동료 악이 누구인지 압니다. (오베론 제외)'],
      ['능력', '퍼시벌에게 멀린처럼 보입니다.'],
      ['요령', '멀린인 것처럼 행동해 퍼시벌을 속이세요. 퍼시벌이 없는 판에서는 효과가 없습니다.'],
    ],
  },
  mordred: {
    name: '모드레드',
    team: 'evil',
    tagline: '멀린의 눈에도 보이지 않는 반역자',
    points: [
      ['아는 것', '동료 악이 누구인지 압니다. (오베론 제외)'],
      ['능력', '멀린에게 정체가 보이지 않습니다.'],
      ['요령', '멀린조차 의심하지 못하니, 믿음직한 선처럼 원정대에 들어가세요.'],
    ],
  },
  oberon: {
    name: '오베론',
    team: 'evil',
    tagline: '홀로 움직이는 정체불명',
    points: [
      ['아는 것', '아무것도 모릅니다. 다른 악도 오베론이 누구인지 모릅니다.'],
      ['약점', '멀린에게는 정체가 보입니다.'],
      ['요령', '동료를 모른 채 혼자 판단해야 합니다. 악에게는 불리한 역할입니다.'],
    ],
  },
  minion: {
    name: '모드레드의 하수인',
    team: 'evil',
    tagline: '특별한 능력이 없는 악의 졸개',
    points: [
      ['아는 것', '동료 악이 누구인지 압니다. (오베론 제외)'],
      ['할 일', '원정대에 들어가 실패 카드를 내거나, 선인 척 혼란을 주세요.'],
      ['요령', '실패를 낼 때는 누가 냈는지 좁혀지지 않게 원정대 구성을 살피세요.'],
    ],
  },
};

// 방장이 고르는 제한 시간. 값은 초, 0은 제한 없음. (game.js 의 TIMER_CHOICES 와 같아야 한다)
const TIMER_CHOICES = [
  [0, '제한 없음'], [30, '30초'], [60, '1분'], [120, '2분'], [180, '3분'], [300, '5분'],
];
const TIMERS = [
  { key: 'team', name: '원정대 구성 · 암살', desc: '리더가 원정대를 고르는 시간, 암살자가 멀린을 지목하는 시간' },
  { key: 'action', name: '투표 · 원정 카드', desc: '찬반 투표와 성공/실패 카드를 내는 시간' },
];

// 방장이 로비에서 켜고 끄는 추가 역할
const OPTIONS = [
  { key: 'percival', name: '퍼시벌', desc: '선 · 멀린을 알아봄' },
  { key: 'morgana', name: '모르가나', desc: '악 · 퍼시벌에게 멀린처럼 보임' },
  { key: 'mordred', name: '모드레드', desc: '악 · 멀린에게 안 보임' },
  { key: 'oberon', name: '오베론', desc: '악 · 다른 악과 서로 모름' },
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// ---------- 저장소 ----------
// token: 서버가 "같은 사람"임을 알아보는 비밀 값. 탭마다 따로 두려고 sessionStorage에 넣는다.
//        (새로고침이나 화면 꺼짐에는 유지되고, 한 브라우저에서 탭을 여러 개 열어 혼자 테스트할 수도 있다)

function getToken() {
  let token = sessionStorage.getItem('avalon.token');
  if (!token) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('avalon.token', token);
  }
  return token;
}

function saveSeat(code, playerName) {
  sessionStorage.setItem('avalon.code', code);
  sessionStorage.setItem('avalon.name', playerName);
  history.replaceState(null, '', '?room=' + code);
}

function clearSeat() {
  sessionStorage.removeItem('avalon.code');
  history.replaceState(null, '', location.pathname);
}

// ---------- 서버와 주고받기 ----------

function enter(request) {
  const playerName = request.name;
  socket.emit('enter', { ...request, token: getToken() }, (res) => {
    if (!res.ok) {
      clearSeat();
      view = null;
      render();
      $('entry-msg').textContent = res.error;
      return;
    }
    $('entry-msg').textContent = '';
    saveSeat(res.code, playerName);
  });
}

function send(event, payload) {
  socket.emit(event, payload || {}, (res) => {
    if (!res.ok) toast(res.error);
  });
}

// 연결될 때마다(처음 접속, 새로고침, 끊겼다 재연결) 앉아 있던 방이 있으면 자동으로 돌아간다.
socket.on('connect', () => {
  $('conn').hidden = true;
  const code = sessionStorage.getItem('avalon.code');
  const playerName = sessionStorage.getItem('avalon.name');
  if (code && playerName) enter({ code, name: playerName });
});

socket.on('disconnect', () => {
  $('conn').hidden = false;
});

socket.on('view', (next) => {
  // 단계, 원정, 리더 중 하나라도 바뀌면 고르던 것을 비운다.
  const key = next.game ? [next.phase, next.game.quest, next.game.leaderId].join('/') : next.phase;
  if (key !== pickKey) {
    pickKey = key;
    picked = [];
  }
  if (next.phase === 'lobby') roleVisible = false;
  clockOffset = next.now - Date.now();
  view = next;
  render();
});

socket.on('kicked', (message) => {
  clearSeat();
  view = null;
  render();
  $('entry-msg').textContent = message;
});

// ---------- 입장 화면 ----------

function readName() {
  const playerName = $('name-input').value.trim();
  if (!playerName) $('entry-msg').textContent = '이름을 입력해 주세요.';
  else localStorage.setItem('avalon.lastName', playerName);
  return playerName;
}

$('btn-create').addEventListener('click', () => {
  const playerName = readName();
  if (playerName) enter({ create: true, name: playerName });
});

$('btn-join').addEventListener('click', () => {
  const playerName = readName();
  const code = $('code-input').value.trim().toUpperCase();
  if (!playerName) return;
  if (!code) return void ($('entry-msg').textContent = '방 코드를 입력해 주세요.');
  enter({ code, name: playerName });
});

// 입장 화면 아래에 등장인물 초상을 늘어놓는다.
const SHOWCASE = ['merlin', 'percival', 'servant', 'oberon', 'assassin', 'morgana', 'mordred', 'minion'];
$('showcase-grid').innerHTML = SHOWCASE.map(
  (key) => `<div class="showcase-item" data-profile="${key}">${roleArt(key)}${key === 'minion' ? '하수인' : ROLE_INFO[key].name}</div>`
).join('');

$('name-input').value = localStorage.getItem('avalon.lastName') || '';
$('code-input').value = (new URLSearchParams(location.search).get('room') || '').toUpperCase();

// ---------- 방 화면: 버튼 처리 ----------

$('room').addEventListener('click', (event) => {
  const pick = event.target.closest('[data-pick]');
  if (pick) return togglePick(pick.dataset.pick);

  const button = event.target.closest('[data-act]');
  if (!button || button.disabled) return;
  const g = view.game;

  switch (button.dataset.act) {
    case 'copy':
      return copyInvite();
    case 'leave':
      if (view.phase !== 'lobby' && !confirm('게임 중입니다. 나가시겠습니까? (같은 이름으로 다시 들어올 수 있습니다)')) return;
      socket.emit('leave');
      clearSeat();
      view = null;
      return render();
    case 'toggle-role':
      roleVisible = !roleVisible;
      return render();
    case 'start':
      return send('start');
    case 'propose':
      return send('propose', { team: picked });
    case 'approve':
      return send('vote', { approve: true });
    case 'reject':
      return send('vote', { approve: false });
    case 'success':
      return send('quest', { success: true });
    case 'fail':
      return send('quest', { success: false });
    case 'assassinate':
      if (confirm(nameOf(picked[0]) + ' 님을 멀린으로 지목합니다. 되돌릴 수 없습니다.')) {
        send('assassinate', { targetId: picked[0] });
      }
      return;
    case 'lobby':
      if (g.end || confirm('진행 중인 게임을 중단하고 로비로 돌아갑니다.')) send('lobby');
      return;
  }
});

$('room').addEventListener('change', (event) => {
  const data = event.target.dataset;
  if (data.opt) send('options', { [data.opt]: event.target.checked });
  if (data.timer) send('options', { timers: { [data.timer]: Number(event.target.value) } });
});

// ---------- 캐릭터 설명 창 ----------
// 초상(data-profile 이 붙은 것)을 누르면 그 캐릭터의 설명을 띄운다. 입장 화면과 대기 화면 어디서든 동작한다.

function openProfile(role) {
  const info = ROLE_INFO[role];
  $('profile-card').className = 'profile-card ' + info.team;
  $('profile-card').innerHTML = `
    ${roleArt(role)}
    <div><span class="rolecard-name">${info.name}</span></div>
    <div class="rolecard-team">${info.team === 'good' ? '선의 세력' : '악의 세력'}</div>
    <p class="profile-tagline">${info.tagline}</p>
    <dl class="profile-points">
      ${info.points.map(([label, text]) => `<dt>${label}</dt><dd>${text}</dd>`).join('')}
    </dl>
    <button type="button" class="wide" data-profile-close>닫기</button>`;
  $('profile').hidden = false;
}

document.addEventListener('click', (event) => {
  const portrait = event.target.closest('[data-profile]');
  if (portrait) {
    event.preventDefault(); // 추가 역할 줄에서는 초상이 체크박스의 label 안에 있어서, 체크가 바뀌지 않게 막는다
    return openProfile(portrait.dataset.profile);
  }
  // 닫기 버튼이나 창 바깥의 어두운 부분을 누르면 닫는다.
  if (event.target.closest('[data-profile-close]') || event.target === $('profile')) $('profile').hidden = true;
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') $('profile').hidden = true;
});

// ---------- 타이머 표시 ----------
// 남은 시간은 view 의 deadline(서버 시각)으로 계산하고, 화면 전체를 다시 그리지 않고 숫자만 갱신한다.

function updateTimer() {
  const display = document.querySelector('.timer');
  if (!display || !view || !view.game || !view.game.deadline) return;
  const left = Math.max(0, Math.ceil((view.game.deadline - (Date.now() + clockOffset)) / 1000));
  display.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  display.classList.toggle('urgent', left <= 10);
}
setInterval(updateTimer, 250);

// 지금 내가 플레이어를 골라야 하는 상황인지: 'team'(원정대 구성), 'assassin'(암살 대상), 아니면 null
function pickMode() {
  const g = view.game;
  if (!g) return null;
  if (view.phase === 'team' && view.you === g.leaderId) return 'team';
  if (view.phase === 'assassin' && view.you === g.assassinId) return 'assassin';
  return null;
}

function togglePick(playerId) {
  const mode = pickMode();
  if (mode === 'assassin') {
    picked = [playerId];
  } else if (mode === 'team') {
    const size = view.game.teamSizes[view.game.quest];
    if (picked.includes(playerId)) picked = picked.filter((id) => id !== playerId);
    else if (picked.length < size) picked.push(playerId);
  }
  render();
}

async function copyInvite() {
  const link = location.origin + location.pathname + '?room=' + view.code;
  try {
    await navigator.clipboard.writeText(link);
    toast('초대 링크를 복사했습니다.');
  } catch {
    prompt('이 링크를 복사해 보내 주세요', link);
  }
}

let toastTimer = null;
function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('toast').hidden = true), 3000);
}

// ---------- 채팅 ----------
// 채팅 내용은 view 에 들어 있지 않고 'chat' / 'chat-history' 메시지로 따로 온다.

let chatUnread = 0; // 창을 닫아 둔 동안 쌓인 안 읽은 메시지 수

// 넓은 화면에서는 채팅창이 항상 펼쳐져 있다. (style.css 의 미디어 쿼리와 같은 기준)
function isChatVisible() {
  return document.body.classList.contains('chat-open') || window.matchMedia('(min-width: 1000px)').matches;
}

function setUnread(count) {
  chatUnread = count;
  $('chat-badge').textContent = count > 99 ? '99+' : count;
  $('chat-badge').hidden = count === 0;
}

function scrollChatToEnd() {
  $('chat-log').scrollTop = $('chat-log').scrollHeight;
}

// 메시지 한 줄을 채팅창에 붙인다. 사용자가 쓴 글이므로 innerHTML 이 아니라 textContent 로 넣는다.
function appendChat(entry) {
  const mine = view && entry.playerId === view.you;
  const time = new Date(entry.at);
  const clock = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');

  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  meta.textContent = mine ? clock : entry.name + ' · ' + clock;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = entry.text;

  const row = document.createElement('div');
  row.className = mine ? 'chat-msg mine' : 'chat-msg';
  row.append(meta, bubble);
  $('chat-log').append(row);
  return mine;
}

// 방에 들어오거나 재접속하면 서버가 최근 대화를 한꺼번에 보내 준다.
socket.on('chat-history', (entries) => {
  $('chat-log').replaceChildren();
  entries.forEach(appendChat);
  scrollChatToEnd();
  setUnread(0);
});

socket.on('chat', (entry) => {
  const log = $('chat-log');
  // 위로 올려 지난 대화를 읽는 중이면, 새 글이 와도 화면을 끌어내리지 않는다.
  const wasAtEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
  const mine = appendChat(entry);
  if (!isChatVisible()) setUnread(chatUnread + 1);
  else if (wasAtEnd || mine) scrollChatToEnd();
});

$('chat-fab').addEventListener('click', () => {
  document.body.classList.add('chat-open');
  setUnread(0);
  scrollChatToEnd();
});

$('chat-close').addEventListener('click', () => {
  document.body.classList.remove('chat-open');
});

$('chat-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = $('chat-input').value.trim();
  if (!text) return;
  $('chat-input').value = '';
  send('chat', { text });
});

// ---------- 방 화면: 그리기 ----------

// 이름은 사용자가 입력한 값이라 HTML에 넣기 전에 반드시 이스케이프한다.
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function nameOf(playerId) {
  const player = view.players.find((p) => p.id === playerId);
  return player ? player.name : '?';
}

function namesOf(playerIds) {
  return playerIds.map((id) => esc(nameOf(id))).join(', ');
}

function render() {
  $('entry').hidden = !!view;
  $('room').hidden = !view;
  // 채팅 버튼과 창은 방 안에 있을 때만 보인다. (보이고 숨기는 것은 style.css 가 이 클래스를 보고 처리)
  document.body.classList.toggle('in-room', !!view);
  if (!view) document.body.classList.remove('chat-open');
  if (!view) return;
  $('room').innerHTML = view.game
    ? headerHtml() + trackHtml() + tableHtml() + phaseHtml() + roleHtml() + lastVoteHtml() + historyHtml()
    : headerHtml() + tableHtml() + lobbyHtml();
  updateTimer();
}

function headerHtml() {
  const isHost = view.you === view.hostId;
  const canAbort = isHost && view.game && !view.game.end;
  return `
    <div class="panel row spread">
      <span><span class="roomcode-label">방 코드</span><span class="roomcode">${view.code}</span></span>
      <span class="row">
        <button class="small" data-act="copy">초대 링크</button>
        ${canAbort ? '<button class="small" data-act="lobby">중단</button>' : ''}
        <button class="small" data-act="leave">나가기</button>
      </span>
    </div>`;
}

// 원정 5개의 진행 상황: 끝난 원정은 성배(성공) / 부러진 검(실패), 나머지는 필요한 인원수
function trackHtml() {
  const g = view.game;
  const quests = g.teamSizes
    .map((size, i) => {
      const result = g.results[i];
      const state = result ? (result.success ? 'ok' : 'bad') : i === g.quest && !g.end ? 'now' : '';
      const coin = result ? (result.success ? ICON.grail : ICON.broken) : size;
      const note = result ? `실패 ${result.fails}장` : g.failsNeeded[i] > 1 ? '실패 2장 필요' : `${size}명`;
      return `
        <div class="quest ${state}">
          <div class="quest-no">${ROMAN[i]}</div>
          <div class="quest-coin">${coin}</div>
          <div class="quest-note">${note}</div>
        </div>`;
    })
    .join('');
  return `<div class="panel"><div class="track">${quests}</div></div>`;
}

// 원탁. 플레이어를 자리 순서대로 둥글게 앉히고, 내 자리가 항상 아래쪽에 오게 돌린다.
function tableHtml() {
  const g = view.game;
  const mode = pickMode();
  const count = view.players.length;
  const myIndex = Math.max(0, view.players.findIndex((p) => p.id === view.you));

  // 내 역할 카드를 펼쳐 둔 동안에만, 내가 아는 사람들의 자리에 표시를 붙인다.
  const known = new Map();
  if (g && roleVisible) for (const k of g.me.knows) known.set(k.id, k.label);

  // 직전 투표의 찬반 토큰을 자리에 올려 둘지: 가결되어 원정 중이거나, 방금 부결됐을 때만
  const last = g && g.lastVote;
  const showLastVote = last && (view.phase === 'quest' || (view.phase === 'team' && !last.approved));
  const questing = ['team', 'vote', 'quest'].includes(view.phase);

  const seats = view.players
    .map((p, i) => {
      const angle = (2 * Math.PI * ((i - myIndex + count) % count)) / count;
      const left = 50 - 40 * Math.sin(angle);
      const top = 50 + 40 * Math.cos(angle);

      const endRole = g && g.end ? g.end.roles[p.id] : null;
      const isMe = p.id === view.you;
      // 원정대 방패와 리더 왕관은 원정을 꾸리고 진행하는 단계에서만 보여 준다.
      const onTeam = questing && (g.team.includes(p.id) || picked.includes(p.id));
      const isTarget = mode === 'assassin' && picked.includes(p.id);
      const selectable = mode === 'team' || (mode === 'assassin' && !isMe);

      let avatar;
      if (endRole) avatar = roleArt(endRole.key);
      else if (isMe && g && roleVisible) avatar = roleArt(g.me.role);
      else avatar = initialArt(esc(Array.from(p.name)[0] || '?'));

      let sub = '';
      let subClass = '';
      if (endRole) {
        sub = endRole.name;
        subClass = 'sub-' + endRole.team;
      } else if (!p.connected) {
        sub = '끊김';
      } else if (known.has(p.id)) {
        sub = known.get(p.id);
        subClass = sub.includes('멀린') ? 'sub-good' : 'sub-evil';
      } else if (p.id === view.hostId && !g) {
        sub = '방장';
      }

      let vote = '';
      if (view.phase === 'vote' && g.voted.includes(p.id)) vote = '<span class="seat-vote"></span>';
      else if (showLastVote && p.id in last.votes) vote = `<span class="seat-vote ${last.votes[p.id] ? 'yes' : 'no'}"></span>`;

      const classes = ['seat', isMe ? 'me' : '', onTeam ? 'onteam' : '', selectable ? 'selectable' : ''];
      classes.push(picked.includes(p.id) ? 'picked' : '', isTarget ? 'target' : '', p.connected ? '' : 'off', subClass);

      return `
        <div class="${classes.join(' ')}" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%" ${selectable ? `data-pick="${p.id}"` : ''}>
          <span class="seat-avatar">
            ${questing && p.id === g.leaderId ? `<span class="seat-crown">${ICON.crown}</span>` : ''}
            ${avatar}
            ${onTeam ? `<span class="seat-shield">${ICON.shield}</span>` : ''}
            ${vote}
          </span>
          <span class="seat-name">${esc(p.name)}</span>
          <span class="seat-sub">${sub}</span>
        </div>`;
    })
    .join('');

  return `<div class="table">${tableTopHtml()}${seats}</div>`;
}

// 제한 시간이 걸린 단계면 남은 시간을 넣을 자리를 만든다. 숫자는 updateTimer 가 채운다.
function timerHtml(g) {
  return g.deadline ? '<div class="timer"></div>' : '';
}

// 원탁 한가운데에 적는 현재 상황
function tableTopHtml() {
  const g = view.game;
  if (!g) {
    return `
      <div class="table-top">
        <div class="table-title">${view.players.length} / 10</div>
        <div class="table-sub">기사들이 모이는 중</div>
      </div>`;
  }
  if (g.end) {
    return `
      <div class="table-top ${g.end.winner}">
        <div class="table-title">${g.end.winner === 'good' ? '선의 승리' : '악의 승리'}</div>
        <div class="table-sub">모든 정체가 밝혀졌습니다</div>
      </div>`;
  }
  if (view.phase === 'assassin') {
    return `
      <div class="table-top evil">
        <div class="table-title">암살의 시간</div>
        <div class="table-sub">멀린은 누구인가</div>
        ${timerHtml(g)}
      </div>`;
  }
  const stage = { team: '원정대 구성', vote: '찬반 투표', quest: '원정 중' }[view.phase];
  const pips = [0, 1, 2, 3, 4].map((i) => `<span class="pip ${i < g.rejects ? 'on' : ''}"></span>`).join('');
  return `
    <div class="table-top">
      <div class="table-title">제 ${g.quest + 1} 원정</div>
      <div class="table-sub">${stage}</div>
      ${timerHtml(g)}
      <div class="pips" title="연속 부결 ${g.rejects}/5">${pips}</div>
      <div class="table-sub">부결 ${g.rejects}/5</div>
    </div>`;
}

// 역할 목록을 초상과 함께 나열한다. 같은 역할이 여럿이면 "×2"로 묶는다.
function castHtml(roles) {
  const counts = new Map();
  for (const role of roles) counts.set(role.key, { name: role.name, n: (counts.get(role.key)?.n || 0) + 1 });
  return [...counts]
    .map(([key, { name, n }]) => `<div class="cast-item" data-profile="${key}">${roleArt(key)}${name}${n > 1 ? ` ×${n}` : ''}</div>`)
    .join('');
}

function lobbyHtml() {
  const isHost = view.you === view.hostId;
  const lobby = view.lobby;

  const options = OPTIONS.map(
    (o) => `
      <label class="opt">
        <span class="opt-art" data-profile="${o.key}">${roleArt(o.key)}</span>
        <span><b>${o.name}</b><small>${o.desc}</small></span>
        <input type="checkbox" data-opt="${o.key}" ${view.options[o.key] ? 'checked' : ''} ${isHost ? '' : 'disabled'}>
      </label>`
  ).join('');

  const cast = lobby.error
    ? `<p class="warn center">${esc(lobby.error)}</p>`
    : `<p class="cast-label good">선의 세력 ${lobby.good.length}명</p>
       <div class="cast">${castHtml(lobby.good)}</div>
       <p class="cast-label evil">악의 세력 ${lobby.evil.length}명</p>
       <div class="cast">${castHtml(lobby.evil)}</div>`;

  const startButton = isHost
    ? `<button class="primary wide" data-act="start" ${lobby.error ? 'disabled' : ''}>게임 시작</button>`
    : '<p class="muted center">방장이 시작하기를 기다리는 중…</p>';

  const timers = TIMERS.map(
    (t) => `
      <label class="opt">
        <span><b>${t.name}</b><small>${t.desc}</small></span>
        <select data-timer="${t.key}" ${isHost ? '' : 'disabled'}>
          ${TIMER_CHOICES.map(([seconds, label]) => `<option value="${seconds}" ${view.options.timers[t.key] === seconds ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>`
  ).join('');

  return `
    <div class="card">
      <h2>이번 판의 등장인물</h2>
      ${cast}
      <p class="muted center">초상을 누르면 캐릭터 설명이 나옵니다.</p>
      ${startButton}
    </div>
    <div class="card">
      <h2>추가 역할</h2>
      <p class="muted center">멀린과 암살자는 항상 포함됩니다.${isHost ? '' : ' 방장이 고릅니다.'}</p>
      ${options}
    </div>
    <div class="card">
      <h2>제한 시간</h2>
      <p class="muted center">${isHost ? '단계마다 주어지는 시간을 정합니다.' : '방장이 정합니다.'}</p>
      ${timers}
      <p class="muted" style="margin-top:10px">시간이 지나면 자동으로 넘어갑니다. 리더가 원정대를 못 정하면 부결 1회, 투표를 안 하면 찬성, 원정 카드를 안 내면 성공으로 처리하고, 암살자가 지목하지 못하면 선이 이깁니다.</p>
    </div>`;
}

// 단계별 안내와 내가 누를 버튼
function phaseHtml() {
  const g = view.game;
  const me = view.you;
  const size = g.teamSizes[g.quest];
  let body = '';

  if (view.phase === 'team') {
    body =
      me === g.leaderId
        ? `<h2>원정대를 꾸리십시오</h2>
           <p class="lead">원탁에서 <b>${size}명</b>을 눌러 고릅니다. (${picked.length}/${size})</p>
           <button class="primary wide" data-act="propose" ${picked.length === size ? '' : 'disabled'}>이 원정대로 제안</button>`
        : `<h2>원정대 구성 중</h2>
           <p class="lead">리더 <b>${esc(nameOf(g.leaderId))}</b> 님이 원정대 ${size}명을 고르고 있습니다.</p>`;
  }

  if (view.phase === 'vote') {
    body = `<h2>이 원정대를 보내겠습니까?</h2><p class="lead">원정대: <b>${namesOf(g.team)}</b></p>`;
    body +=
      g.myVote === null
        ? `<div class="row around">
             <button class="token approve" data-act="approve">찬성<small>APPROVE</small></button>
             <button class="token reject" data-act="reject">반대<small>REJECT</small></button>
           </div>`
        : `<p class="muted center"><b>${g.myVote ? '찬성' : '반대'}</b>에 투표했습니다. 나머지를 기다리는 중 (${g.voted.length}/${view.players.length})</p>`;
  }

  if (view.phase === 'quest') {
    body = `<h2>원정이 진행 중입니다</h2><p class="lead">원정대: <b>${namesOf(g.team)}</b> · 제출 ${g.cardsIn}/${g.team.length}</p>`;
    if (g.team.includes(me) && !g.myCard) {
      const isGood = g.me.team === 'good';
      body += `
        <div class="row around">
          <button class="qcard success" data-act="success">${ICON.grail}성공</button>
          <button class="qcard fail" data-act="fail" ${isGood ? 'disabled' : ''}>${ICON.broken}실패</button>
        </div>
        ${isGood ? '<p class="muted center">선의 세력은 성공만 낼 수 있습니다.</p>' : ''}`;
    } else {
      body += '<p class="muted center">카드가 모두 나오기를 기다리는 중…</p>';
    }
  }

  if (view.phase === 'assassin') {
    body =
      me === g.assassinId
        ? `<h2>멀린을 찾아내십시오</h2>
           <p class="lead">원탁에서 한 명을 누릅니다. 맞히면 악이 역전합니다.</p>
           <button class="danger wide" data-act="assassinate" ${picked.length === 1 ? '' : 'disabled'}>
             ${picked.length === 1 ? esc(nameOf(picked[0])) + ' 님을 지목' : '지목할 사람을 고르세요'}
           </button>`
        : `<h2>선이 원정을 세 번 성공했습니다</h2>
           <p class="lead">암살자 <b>${esc(nameOf(g.assassinId))}</b> 님이 멀린을 찾고 있습니다.</p>`;
  }

  if (view.phase === 'end') {
    const end = g.end;
    const reason = {
      quests: '원정이 세 번 실패했습니다.',
      rejects: '원정대가 다섯 번 연속 부결되었습니다.',
      assassin: `암살자가 멀린(${esc(nameOf(end.targetId))})을 찾아냈습니다.`,
      survived: `암살자가 ${esc(nameOf(end.targetId))} 님을 지목했지만 멀린이 아니었습니다.`,
      timeout: '암살자가 시간 안에 멀린을 지목하지 못했습니다.',
    }[end.reason];
    body = `
      <p class="verdict ${end.winner}">${end.winner === 'good' ? '선의 승리' : '악의 승리'}</p>
      <p class="lead">${reason}</p>
      ${
        me === view.hostId
          ? '<button class="primary wide" data-act="lobby">로비로 돌아가기</button>'
          : '<p class="muted center">방장이 다음 판을 준비합니다.</p>'
      }`;
  }

  // 직전 단계가 시간 초과로 자동 처리됐으면 그 내용을 알린다. (이름이 들어 있어 이스케이프한다)
  const notice = g.notice ? `<p class="notice">${esc(g.notice)}</p>` : '';
  return `<div class="card">${notice}${body}</div>`;
}

// 내 역할 카드. 평소에는 덮어 두고, 누르면 초상과 아는 정보가 펼쳐진다.
function roleHtml() {
  const me = view.game.me;
  if (!roleVisible) {
    return `
      <button class="rolecard back" data-act="toggle-role">
        ${cardBackArt()}
        <span><b>내 역할 확인</b><small>주변에서 화면이 안 보일 때 누르세요</small></span>
      </button>`;
  }
  const knows = me.knows.length
    ? `<ul class="rolecard-knows">${me.knows.map((k) => `<li><b>${esc(nameOf(k.id))}</b><span>${k.label}</span></li>`).join('')}</ul>`
    : '';
  return `
    <div class="rolecard ${me.team}" data-act="toggle-role">
      ${roleArt(me.role)}
      <div><span class="rolecard-name">${me.roleName}</span></div>
      <div class="rolecard-team">${me.team === 'good' ? '선의 세력' : '악의 세력'}</div>
      ${knows}
      <p class="rolecard-hint">${ROLE_HINT[me.role]}</p>
      <p class="rolecard-flip">눌러서 덮기</p>
    </div>`;
}

// 직전 투표 결과: 누가 찬성/반대했는지는 공개 정보다.
function lastVoteHtml() {
  const last = view.game.lastVote;
  if (!last) return '';
  const chips = view.players
    .filter((p) => p.id in last.votes)
    .map((p) => `<span class="chip ${last.votes[p.id] ? 'yes' : 'no'}">${esc(p.name)}</span>`)
    .join('');
  return `
    <div class="card">
      <h2>직전 투표 · 제 ${last.quest + 1} 원정 ${last.approved ? '가결' : '부결'}</h2>
      <p class="muted center">리더 ${esc(nameOf(last.leaderId))} · 원정대 ${namesOf(last.team)}</p>
      <div class="chips">${chips}</div>
      <p class="muted center" style="margin-top:8px">흰색은 찬성, 검은색은 반대</p>
    </div>`;
}

function historyHtml() {
  const results = view.game.results;
  if (results.length === 0) return '';
  const rows = results
    .map(
      (r, i) => `
      <div class="log">
        <span class="log-coin ${r.success ? 'ok' : 'bad'}">${r.success ? ICON.grail : ICON.broken}</span>
        <span><b>제 ${i + 1} 원정 ${r.success ? '성공' : '실패'}</b> · 실패 ${r.fails}장<small>${namesOf(r.team)}</small></span>
      </div>`
    )
    .join('');
  return `<div class="card"><h2>원정 기록</h2>${rows}</div>`;
}

render();
