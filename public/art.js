// 그림 모음. 전부 이 프로젝트용으로 직접 그린 SVG이고, 외부 이미지 파일은 쓰지 않는다.
// client.js 가 roleArt('merlin') 처럼 불러서 HTML 문자열로 끼워 넣는다.

// 메달 테두리 안에 들어갈 인물 그림. 좌표계는 100 x 100.
const ROLE_FIGURES = {
  // 멀린: 별 달린 고깔모자와 흰 수염
  merlin: `
    <path d="M14 100 Q16 70 50 66 Q84 70 86 100Z" fill="#2c4f9e"/>
    <circle cx="50" cy="50" r="14" fill="#e2c4a0"/>
    <circle cx="45" cy="48" r="1.5" fill="#2b2118"/><circle cx="55" cy="48" r="1.5" fill="#2b2118"/>
    <path d="M36 52 Q38 86 50 93 Q62 86 64 52 Q57 60 50 60 Q43 60 36 52Z" fill="#efeadf"/>
    <path d="M41 53 Q46 57 50 54 Q54 57 59 53" stroke="#d6cfbf" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M33 39 Q45 30 53 5 Q59 30 67 39Z" fill="#2c4f9e"/>
    <ellipse cx="50" cy="39.5" rx="25" ry="5.5" fill="#1f3a78"/>
    <path d="M51 17l1.8 3.8 4.2.5-3.1 2.9.8 4.1-3.7-2-3.7 2 .8-4.1-3.1-2.9 4.2-.5z" fill="#e3c26b"/>`,

  // 퍼시벌: 붉은 깃털을 꽂은 기사 투구
  percival: `
    <path d="M12 100 Q14 72 50 68 Q86 72 88 100Z" fill="#8f99a6"/>
    <path d="M34 66 Q50 78 66 66 L68 78 Q50 88 32 78Z" fill="#6f7884"/>
    <path d="M50 17 Q55 0 74 5 Q63 9 63 20 Q57 13 50 17Z" fill="#c0392b"/>
    <path d="M32 34 Q32 16 50 16 Q68 16 68 34 V60 Q50 70 32 60Z" fill="#c9d0d8"/>
    <path d="M50 16 Q68 16 68 34 V60 Q59 65 50 66Z" fill="#a4adb8"/>
    <rect x="36" y="38" width="28" height="4.5" rx="1" fill="#141821"/>
    <rect x="48" y="28" width="4" height="37" fill="#8f99a6"/>
    <g fill="#141821"><circle cx="40" cy="51" r="1.2"/><circle cx="44" cy="56" r="1.2"/><circle cx="56" cy="56" r="1.2"/><circle cx="60" cy="51" r="1.2"/></g>
    <path d="M47 82h6v5h5v5h-5v8h-6v-8h-5v-5h5z" fill="#e3c26b"/>`,

  // 아서의 충신: 철모를 쓰고 십자 방패를 든 병사
  servant: `
    <path d="M14 100 Q16 72 50 68 Q84 72 86 100Z" fill="#3b63b0"/>
    <circle cx="50" cy="50" r="14" fill="#e2c4a0"/>
    <path d="M34 48 Q32 70 50 72 Q68 70 66 48 Q66 63 50 65 Q34 63 34 48Z" fill="#8f99a6"/>
    <path d="M34 46 Q34 24 50 24 Q66 24 66 46Z" fill="#c9d0d8"/>
    <rect x="32" y="43" width="36" height="4" rx="2" fill="#8f99a6"/>
    <rect x="48" y="44" width="4" height="12" rx="1" fill="#a4adb8"/>
    <circle cx="44" cy="52" r="1.5" fill="#2b2118"/><circle cx="56" cy="52" r="1.5" fill="#2b2118"/>
    <path d="M36 72 H64 V84 Q64 94 50 100 Q36 94 36 84Z" fill="#efeadf" stroke="#c9a24b" stroke-width="2"/>
    <path d="M48 75h4v7h8v4h-8v10h-4v-10h-8v-4h8z" fill="#c0392b"/>`,

  // 암살자: 두건 속 붉은 눈과 단검
  assassin: `
    <path d="M10 100 Q14 70 50 64 Q86 70 90 100Z" fill="#2a0a0c"/>
    <path d="M50 14 Q22 22 28 68 Q50 60 72 68 Q78 22 50 14Z" fill="#4a1418"/>
    <path d="M50 26 Q36 32 38 60 Q50 66 62 60 Q64 32 50 26Z" fill="#0d0405"/>
    <path d="M41 45 l7 3 -7 1z" fill="#ff5a4d"/><path d="M59 45 l-7 3 7 1z" fill="#ff5a4d"/>
    <path d="M39 54 Q50 60 61 54 L60 62 Q50 66 40 62Z" fill="#6b1a1f"/>
    <path d="M76 40 L80 72 H72Z" fill="#d7dce2"/>
    <rect x="68" y="72" width="16" height="3" rx="1" fill="#c9a24b"/>
    <rect x="74" y="75" width="4" height="10" fill="#4a2a18"/>
    <circle cx="76" cy="87" r="2.5" fill="#c9a24b"/>`,

  // 모르가나: 긴 검은 머리와 붉은 보석 머리띠의 마녀
  morgana: `
    <path d="M14 100 Q16 72 50 68 Q84 72 86 100Z" fill="#5a1450"/>
    <path d="M28 100 Q22 50 34 34 Q42 22 50 22 Q58 22 66 34 Q78 50 72 100Z" fill="#140a12"/>
    <rect x="45" y="58" width="10" height="13" fill="#d9b796"/>
    <path d="M38 72 Q50 84 62 72 L64 100 H36Z" fill="#5a1450"/>
    <ellipse cx="50" cy="48" rx="12" ry="14" fill="#ecd3b8"/>
    <path d="M38 47 Q37 30 50 30 Q63 30 62 47 Q58 37 50 37 Q42 37 38 47Z" fill="#140a12"/>
    <path d="M41.5 44 l6.5 2" stroke="#140a12" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M58.5 44 l-6.5 2" stroke="#140a12" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M42 48 q3 -2 6 0.8 q-3 1.2 -6 -0.8z" fill="#140a12"/>
    <path d="M58 48 q-3 -2 -6 0.8 q3 1.2 6 -0.8z" fill="#140a12"/>
    <path d="M46.5 56 q3.5 1.2 7 -0.6" stroke="#9c1f2e" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M37 35 Q50 27 63 35" stroke="#c9a24b" stroke-width="2.5" fill="none"/>
    <path d="M50 26 l3 4.5 -3 5 -3 -5z" fill="#e0453a"/>
    <path d="M40 76 Q50 86 60 76" stroke="#c9a24b" stroke-width="1.8" fill="none"/>`,

  // 모드레드: 왕관을 쓴 검은 투구의 반역자
  mordred: `
    <path d="M10 100 Q12 70 50 66 Q88 70 90 100Z" fill="#23262d"/>
    <path d="M16 80 L8 60 L28 72Z" fill="#3a3f49"/><path d="M84 80 L92 60 L72 72Z" fill="#3a3f49"/>
    <path d="M32 26 L30 7 L40 18 L50 3 L60 18 L70 7 L68 26Z" fill="#c9a24b"/>
    <path d="M32 36 Q32 22 50 22 Q68 22 68 36 V58 L50 70 L32 58Z" fill="#474d59"/>
    <path d="M50 22 Q68 22 68 36 V58 L50 70Z" fill="#30343d"/>
    <rect x="31" y="24" width="38" height="4.5" fill="#a8842f"/>
    <circle cx="50" cy="26.2" r="1.8" fill="#e0453a"/>
    <path d="M36 40 H64 V45 H52 V63 H48 V45 H36Z" fill="#0b0c0f"/>
    <rect x="39" y="41.5" width="6" height="2" fill="#ff5a4d"/><rect x="55" y="41.5" width="6" height="2" fill="#ff5a4d"/>`,

  // 오베론: 사슴뿔과 뼈 가면의 정체불명
  oberon: `
    <path d="M12 100 Q14 72 50 68 Q86 72 88 100Z" fill="#20372a"/>
    <path d="M40 30 Q34 20 34 6 M36 19 Q28 17 24 7 M38 26 Q30 28 21 22 M60 30 Q66 20 66 6 M64 19 Q72 17 76 7 M62 26 Q70 28 79 22"
      stroke="#b79a6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M33 44 Q30 70 50 74 Q70 70 67 44Z" fill="#14241b"/>
    <path d="M36 40 Q36 26 50 26 Q64 26 64 40 Q64 58 50 68 Q36 58 36 40Z" fill="#ddd6c4"/>
    <path d="M39 42 q5 -5 9 0 q-4 5 -9 0z" fill="#0b0c0f"/><path d="M52 42 q4 -5 9 0 q-5 5 -9 0z" fill="#0b0c0f"/>
    <path d="M50 47 V61" stroke="#9a927f" stroke-width="1.5"/>
    <path d="M46 62 h8" stroke="#9a927f" stroke-width="1.2"/>`,

  // 모드레드의 하수인: 뿔 달린 투구의 졸개
  minion: `
    <path d="M12 100 Q14 72 50 68 Q86 72 88 100Z" fill="#3b0f12"/>
    <path d="M35 36 Q17 34 15 12 Q25 26 39 28Z" fill="#ddd6c4"/><path d="M65 36 Q83 34 85 12 Q75 26 61 28Z" fill="#ddd6c4"/>
    <path d="M32 44 Q32 24 50 24 Q68 24 68 44 V57 Q50 66 32 57Z" fill="#6a717d"/>
    <path d="M50 24 Q68 24 68 44 V57 Q59 62 50 63Z" fill="#555b66"/>
    <path d="M38 43 H62 V54 Q50 60 38 54Z" fill="#0d0405"/>
    <circle cx="44.5" cy="48.5" r="1.8" fill="#ff5a4d"/><circle cx="55.5" cy="48.5" r="1.8" fill="#ff5a4d"/>
    <rect x="48.5" y="38" width="3" height="16" fill="#6a717d"/>
    <path d="M50 78 l6 8 -6 8 -6 -8z" fill="#c9a24b"/>`,
};

const ROLE_TEAM = {
  merlin: 'good', percival: 'good', servant: 'good',
  assassin: 'evil', morgana: 'evil', mordred: 'evil', oberon: 'evil', minion: 'evil',
};

// 메달 배경색: 선은 감청, 악은 진홍
const MEDAL_BG = { good: '#1a2f5c', evil: '#4d1014', none: '#2a2119' };

// 금테 두른 둥근 메달 안에 figure 를 넣어 완성된 <svg> 문자열을 만든다.
let medalCount = 0;
function medal(figure, background) {
  // 그림마다 고유한 id를 쓴다. 같은 id를 쓰면 화면에 안 보이는(숨겨진) 그림의 것을 참조해 원 밖으로 삐져나온다.
  const clipId = 'medal-clip-' + medalCount++;
  return `
    <svg class="art" viewBox="0 0 100 100" aria-hidden="true">
      <defs><clipPath id="${clipId}"><circle cx="50" cy="50" r="45"/></clipPath></defs>
      <circle cx="50" cy="50" r="48" fill="${background}"/>
      <g clip-path="url(#${clipId})">${figure}</g>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#c9a24b" stroke-width="3"/>
      <circle cx="50" cy="50" r="43.5" fill="none" stroke="#e3c26b" stroke-width="0.8" opacity="0.7"/>
    </svg>`;
}

// 역할 초상
function roleArt(role) {
  return medal(ROLE_FIGURES[role], MEDAL_BG[ROLE_TEAM[role]]);
}

// 덮어 둔 역할 카드의 뒷면: 검 문양
function cardBackArt() {
  return medal(
    `<path d="M50 12 L55 22 V62 H45 V22Z" fill="#c9d0d8"/>
     <path d="M50 12 L55 22 V62 H50Z" fill="#a4adb8"/>
     <rect x="34" y="62" width="32" height="5" rx="2" fill="#c9a24b"/>
     <rect x="47" y="67" width="6" height="14" fill="#5a3a22"/>
     <circle cx="50" cy="85" r="4.5" fill="#c9a24b"/>`,
    MEDAL_BG.none
  );
}

// 아직 정체를 모르는 플레이어의 자리 표시: 이름 첫 글자를 새긴 메달.
// initial 은 사용자가 입력한 글자이므로 호출하는 쪽에서 이스케이프해서 넘긴다.
function initialArt(initial) {
  return medal(
    `<path d="M50 14 L80 24 V52 Q80 76 50 90 Q20 76 20 52 V24Z" fill="#3a2c1e" stroke="#8a6a25" stroke-width="1.5"/>
     <text x="50" y="65" text-anchor="middle" font-size="38" font-weight="700" fill="#e3c26b" font-family="'Gowun Batang', serif">${initial}</text>`,
    MEDAL_BG.none
  );
}

// 작은 아이콘 (글자 색을 따라간다)
const ICON = {
  crown: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 19h18v2H3zM2 7l5 4 5-7 5 7 5-4-2 10H4z"/></svg>',
  shield: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/></svg>',
  // 원정 성공: 성배
  grail: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h14v3c0 4-2.6 7.2-6 7.9V18h4v3H7v-3h4v-4.1C7.6 13.2 5 10 5 6z"/></svg>',
  // 원정 실패: 부러진 검
  broken: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 2l2 3-1 5-3 1-1-4zM7 15h10v2H7zM11 17h2v5h-2zM10 12l4-1 .5 3h-5z"/></svg>',
};
