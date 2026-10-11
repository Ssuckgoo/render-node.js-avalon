// 그림 모음. 전부 이 프로젝트용으로 직접 그린 SVG이고, 외부 이미지 파일은 쓰지 않는다.
//
// 구조:
//   1) 이 파일이 로드될 때 화면에 보이지 않는 <svg> 하나를 body 에 넣는다. 그 안에 색(그라디언트)과
//      역할별 초상(<symbol>)이 한 번씩만 정의되어 있다.
//   2) client.js 가 roleArt('merlin') 을 부르면 그 symbol 을 가리키는 짧은 <svg><use/></svg> 를 돌려준다.
//      초상이 화면에 여러 번 나와도 그림 데이터는 한 벌뿐이라, 화면을 자주 다시 그려도 가볍다.
//
// 좌표계는 200 x 200. 얼굴 중심은 대략 (100, 96).

// ---------- 공통 색 ----------

const ART_DEFS = `
  <linearGradient id="av-gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbeab0"/><stop offset="0.45" stop-color="#d4aa4f"/><stop offset="1" stop-color="#8a6620"/>
  </linearGradient>
  <linearGradient id="av-steel" x1="0" y1="0" x2="1" y2="0.3">
    <stop offset="0" stop-color="#f4f6f9"/><stop offset="0.45" stop-color="#b4bdc8"/><stop offset="1" stop-color="#66717d"/>
  </linearGradient>
  <linearGradient id="av-steel-dark" x1="0" y1="0" x2="1" y2="0.4">
    <stop offset="0" stop-color="#98a1ad"/><stop offset="0.5" stop-color="#555d68"/><stop offset="1" stop-color="#23272e"/>
  </linearGradient>
  <linearGradient id="av-iron" x1="0" y1="0" x2="1" y2="0.5">
    <stop offset="0" stop-color="#6c7480"/><stop offset="0.4" stop-color="#2e333b"/><stop offset="1" stop-color="#0c0d10"/>
  </linearGradient>
  <linearGradient id="av-wood" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#9a6a36"/><stop offset="1" stop-color="#3f2610"/>
  </linearGradient>
  <linearGradient id="av-bone" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbf6e6"/><stop offset="0.6" stop-color="#d9cdae"/><stop offset="1" stop-color="#9c8f70"/>
  </linearGradient>
  <linearGradient id="av-beard" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b9c0cf"/>
  </linearGradient>
  <linearGradient id="av-blue" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#5584e6"/><stop offset="0.5" stop-color="#2c4fb0"/><stop offset="1" stop-color="#16255c"/>
  </linearGradient>
  <linearGradient id="av-red" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#e2474f"/><stop offset="0.5" stop-color="#a21c25"/><stop offset="1" stop-color="#4f0b10"/>
  </linearGradient>
  <linearGradient id="av-hood" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#8f232b"/><stop offset="0.5" stop-color="#4f0f14"/><stop offset="1" stop-color="#1c0406"/>
  </linearGradient>
  <linearGradient id="av-purple" x1="0" y1="0" x2="0.5" y2="1">
    <stop offset="0" stop-color="#8d37a0"/><stop offset="0.5" stop-color="#541a63"/><stop offset="1" stop-color="#220a2a"/>
  </linearGradient>
  <radialGradient id="av-skin" cx="0.4" cy="0.35" r="0.75">
    <stop offset="0" stop-color="#fbe3c6"/><stop offset="0.7" stop-color="#e2b78a"/><stop offset="1" stop-color="#bf8a5c"/>
  </radialGradient>
  <radialGradient id="av-skin-pale" cx="0.42" cy="0.35" r="0.75">
    <stop offset="0" stop-color="#fdf1e6"/><stop offset="0.7" stop-color="#e9cdbd"/><stop offset="1" stop-color="#b9938a"/>
  </radialGradient>
  <radialGradient id="av-bg-good" cx="0.5" cy="0.38" r="0.7">
    <stop offset="0" stop-color="#4a78dc"/><stop offset="0.55" stop-color="#1b3274"/><stop offset="1" stop-color="#091230"/>
  </radialGradient>
  <radialGradient id="av-bg-evil" cx="0.5" cy="0.4" r="0.7">
    <stop offset="0" stop-color="#a82a31"/><stop offset="0.55" stop-color="#4f0e13"/><stop offset="1" stop-color="#1a0305"/>
  </radialGradient>
  <radialGradient id="av-bg-witch" cx="0.5" cy="0.38" r="0.7">
    <stop offset="0" stop-color="#8a2c8e"/><stop offset="0.55" stop-color="#3a0f42"/><stop offset="1" stop-color="#120315"/>
  </radialGradient>
  <radialGradient id="av-bg-forest" cx="0.5" cy="0.36" r="0.7">
    <stop offset="0" stop-color="#3f7350"/><stop offset="0.55" stop-color="#14301f"/><stop offset="1" stop-color="#040c07"/>
  </radialGradient>
  <radialGradient id="av-bg-none" cx="0.5" cy="0.4" r="0.7">
    <stop offset="0" stop-color="#5a442c"/><stop offset="0.6" stop-color="#2a1e12"/><stop offset="1" stop-color="#120c06"/>
  </radialGradient>
  <radialGradient id="av-orb" cx="0.38" cy="0.32" r="0.7">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.4" stop-color="#9fe3ff"/><stop offset="1" stop-color="#2a74d8"/>
  </radialGradient>
  <radialGradient id="av-glow-blue"><stop offset="0" stop-color="#9fe3ff" stop-opacity="0.75"/><stop offset="1" stop-color="#9fe3ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="av-glow-red"><stop offset="0" stop-color="#ff6a4d" stop-opacity="0.9"/><stop offset="1" stop-color="#ff6a4d" stop-opacity="0"/></radialGradient>
  <radialGradient id="av-glow-green"><stop offset="0" stop-color="#9dffb0" stop-opacity="0.8"/><stop offset="1" stop-color="#9dffb0" stop-opacity="0"/></radialGradient>
  <radialGradient id="av-glow-fire"><stop offset="0" stop-color="#ffb347" stop-opacity="0.8"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient>
  <!-- 사슬 갑옷 무늬 -->
  <pattern id="av-mail" width="8" height="6" patternUnits="userSpaceOnUse">
    <rect width="8" height="6" fill="#727c88"/>
    <path d="M0 3a4 3 0 0 1 8 0M-4 6a4 3 0 0 1 8 0M4 6a4 3 0 0 1 8 0M-4 0a4 3 0 0 1 8 0M4 0a4 3 0 0 1 8 0" fill="none" stroke="#cfd6de" stroke-width="1"/>
  </pattern>
  <clipPath id="av-clip"><circle cx="100" cy="100" r="89"/></clipPath>
`;

// 네 꼭짓점 별 (x, y 중심, s 크기)
function sparkle(x, y, s, color, opacity) {
  return `<path d="M${x} ${y - s} L${x + s * 0.25} ${y - s * 0.25} L${x + s} ${y} L${x + s * 0.25} ${y + s * 0.25} L${x} ${y + s} L${x - s * 0.25} ${y + s * 0.25} L${x - s} ${y} L${x - s * 0.25} ${y - s * 0.25}Z" fill="${color}" opacity="${opacity}"/>`;
}

// 사람 눈 한 쪽 (cx, cy 중심, 홍채 색)
function eye(cx, cy, iris) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="4.6" ry="3" fill="#fff"/>
    <circle cx="${cx}" cy="${cy}" r="2.5" fill="${iris}"/>
    <circle cx="${cx}" cy="${cy}" r="1.1" fill="#0b0d14"/>
    <circle cx="${cx - 0.9}" cy="${cy - 0.9}" r="0.6" fill="#fff"/>
    <path d="M${cx - 5} ${cy} q5 -4.5 10 0" stroke="#3a2415" stroke-width="1.1" fill="none"/>`;
}

// 메달 테두리: 금테, 구슬 장식, 네 방향의 보석
function frame(gem) {
  let beads = '';
  for (let i = 0; i < 36; i++) {
    const a = (Math.PI * 2 * i) / 36;
    beads += `<circle cx="${(100 + 94.5 * Math.cos(a)).toFixed(1)}" cy="${(100 + 94.5 * Math.sin(a)).toFixed(1)}" r="1.5" fill="#fff6cf" opacity="0.85"/>`;
  }
  const gems = [[100, 5.5], [194.5, 100], [100, 194.5], [5.5, 100]]
    .map(([x, y]) => `<path d="M${x} ${y - 5.5} l5.5 5.5 -5.5 5.5 -5.5 -5.5z" fill="${gem}" stroke="#5c4215" stroke-width="1"/><path d="M${x} ${y - 5.5} l5.5 5.5 h-11z" fill="#fff" opacity="0.35"/>`)
    .join('');
  return `
    <circle cx="100" cy="100" r="89" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="5"/>
    <circle cx="100" cy="100" r="94.5" fill="none" stroke="url(#av-gold)" stroke-width="10"/>
    <circle cx="100" cy="100" r="99.4" fill="none" stroke="#5c4215" stroke-width="1.2"/>
    <circle cx="100" cy="100" r="89.6" fill="none" stroke="#5c4215" stroke-width="1.2"/>
    ${beads}${gems}`;
}

const GEM = { good: '#4f8dff', evil: '#e0453a', none: '#c9a24b' };

// ---------- 역할별 초상 ----------
// 각 항목: bg(배경 그라디언트 id), team, art(메달 안에 그릴 내용. 아래에서부터 위로 겹쳐 그린다)

const PORTRAITS = {
  // 멀린: 별밤 아래, 수정 지팡이를 든 흰 수염의 마법사
  merlin: {
    team: 'good',
    bg: 'av-bg-good',
    art: `
      <circle cx="46" cy="50" r="14" fill="#f6efc9" opacity="0.9"/><circle cx="53" cy="45" r="13" fill="#27458f"/>
      ${sparkle(30, 86, 4, '#fff', 0.8)}${sparkle(74, 26, 3, '#fff', 0.7)}${sparkle(142, 28, 3.5, '#fff', 0.8)}${sparkle(172, 104, 3, '#fff', 0.6)}${sparkle(26, 126, 2.5, '#fff', 0.6)}
      <circle cx="120" cy="20" r="1" fill="#fff"/><circle cx="60" cy="66" r="0.9" fill="#fff"/><circle cx="178" cy="76" r="1" fill="#fff"/>
      <!-- 지팡이와 수정 -->
      <path d="M160 64 L168 204 H160 L154 64Z" fill="url(#av-wood)"/>
      <circle cx="157" cy="52" r="26" fill="url(#av-glow-blue)"/>
      <path d="M144 62 q13 10 26 0 l-4 10 h-18z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.8"/>
      <circle cx="157" cy="52" r="12" fill="url(#av-orb)"/>
      ${sparkle(157, 52, 7, '#fff', 0.9)}
      <!-- 로브 -->
      <path d="M18 204 Q22 152 70 138 L100 152 L130 138 Q178 152 182 204Z" fill="url(#av-blue)"/>
      <path d="M70 138 L100 204 L130 138 L100 154Z" fill="#101c4a"/>
      <path d="M68 139 L99 202 M132 139 L101 202" stroke="url(#av-gold)" stroke-width="4.5" fill="none"/>
      <path d="M30 170 Q46 152 66 146 M170 170 Q154 152 134 146" stroke="#8fb0ff" stroke-width="1.5" fill="none" opacity="0.45"/>
      <!-- 옆머리 -->
      <path d="M75 90 Q62 122 72 158 Q82 134 82 104Z" fill="url(#av-beard)"/>
      <path d="M125 90 Q138 122 128 158 Q118 134 118 104Z" fill="url(#av-beard)"/>
      <!-- 얼굴 -->
      <ellipse cx="100" cy="98" rx="25" ry="29" fill="url(#av-skin)"/>
      <path d="M100 96 Q95 109 100 112 Q105 109 100 96" fill="#c9905f"/>
      ${eye(89.5, 97, '#3b6fd0')}${eye(110.5, 97, '#3b6fd0')}
      <path d="M83 104 q6 3 11 0 M106 104 q6 3 11 0" stroke="#b9855a" stroke-width="0.9" fill="none"/>
      <path d="M80 92 Q89 83 98 91 Q89 88 80 94Z" fill="#fff"/><path d="M120 92 Q111 83 102 91 Q111 88 120 94Z" fill="#fff"/>
      <!-- 수염 -->
      <path d="M75 108 Q70 152 100 190 Q130 152 125 108 Q113 124 100 124 Q87 124 75 108Z" fill="url(#av-beard)"/>
      <path d="M86 126 Q84 152 97 180 M100 126 V184 M114 126 Q116 152 103 180 M79 118 Q76 144 90 168 M121 118 Q124 144 110 168" stroke="#9aa2b5" stroke-width="1.1" fill="none" opacity="0.8"/>
      <path d="M100 113 Q89 108 78 119 Q91 124 100 117 Q109 124 122 119 Q111 108 100 113Z" fill="#fff"/>
      <path d="M100 113 Q92 114 82 119 M100 113 Q108 114 118 119" stroke="#b9c0cf" stroke-width="0.9" fill="none"/>
      <!-- 모자 -->
      <path d="M64 82 Q88 62 103 16 Q112 6 124 15 Q113 17 111 27 Q119 62 136 82Z" fill="url(#av-blue)"/>
      <path d="M106 34 Q114 64 128 80 L136 82 Q119 62 111 27Z" fill="#000" opacity="0.22"/>
      <path d="M103 16 Q112 6 124 15 Q113 17 111 27Z" fill="#16255c"/>
      <ellipse cx="100" cy="83" rx="47" ry="10" fill="#132052"/>
      <ellipse cx="100" cy="80.5" rx="47" ry="9" fill="#3d68cf"/>
      <path d="M58 78 Q100 66 142 78" stroke="#9db8ff" stroke-width="1.2" fill="none" opacity="0.6"/>
      <path d="M69 77 Q100 90 131 77 L129 68 Q100 81 71 68Z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.6"/>
      ${sparkle(97, 50, 7, '#f6e3a4', 1)}${sparkle(86, 64, 3, '#f6e3a4', 0.9)}${sparkle(112, 60, 2.5, '#f6e3a4', 0.9)}
      <path d="M104 34 a6 6 0 1 0 7 7 a4.6 4.6 0 1 1 -7 -7z" fill="#f6e3a4"/>`,
  },

  // 퍼시벌: 햇살을 등진 기사. 붉은 깃털 투구와 은빛 갑옷
  percival: {
    team: 'good',
    bg: 'av-bg-good',
    art: `
      <g fill="#fff" opacity="0.13">
        <path d="M100 96 L44 0 H72Z"/><path d="M100 96 L92 0 H112Z"/><path d="M100 96 L132 0 H160Z"/><path d="M100 96 L0 40 V68Z"/><path d="M100 96 L200 40 V68Z"/><path d="M100 96 L0 104 V128Z"/><path d="M100 96 L200 104 V128Z"/>
      </g>
      <path d="M0 204V150h8v-8h7v8h8v-8h7v8h8v54zM162 204V146h8v-8h7v8h8v-8h7v8h8v58z" fill="#081030" opacity="0.6"/>
      <!-- 망토 -->
      <path d="M14 204 Q18 150 62 138 L58 204Z" fill="url(#av-red)"/><path d="M186 204 Q182 150 138 138 L142 204Z" fill="#5e0f14"/>
      <!-- 흉갑 -->
      <path d="M34 204 Q38 158 72 146 Q100 162 128 146 Q162 158 166 204Z" fill="url(#av-steel)"/>
      <path d="M100 160 Q128 150 140 152 Q162 164 166 204 H100Z" fill="#000" opacity="0.2"/>
      <path d="M100 160 V204" stroke="#59626e" stroke-width="2"/>
      <path d="M93 166h14v10h11v11h-11v17h-14v-17h-11v-11h11z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="1"/>
      <!-- 어깨 갑옷 -->
      <path d="M20 182 Q20 146 56 140 Q76 146 76 168 Q50 164 28 188Z" fill="url(#av-steel)" stroke="#59626e" stroke-width="1.5"/>
      <path d="M180 182 Q180 146 144 140 Q124 146 124 168 Q150 164 172 188Z" fill="url(#av-steel-dark)" stroke="#3a424c" stroke-width="1.5"/>
      <path d="M28 172 Q42 154 68 154 M34 180 Q48 164 72 162" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.6"/>
      <path d="M172 172 Q158 154 132 154 M166 180 Q152 164 128 162" stroke="#cfd6de" stroke-width="1.2" fill="none" opacity="0.4"/>
      <g fill="#5c4215"><circle cx="34" cy="166" r="1.8"/><circle cx="50" cy="152" r="1.8"/><circle cx="66" cy="150" r="1.8"/><circle cx="166" cy="166" r="1.8"/><circle cx="150" cy="152" r="1.8"/><circle cx="134" cy="150" r="1.8"/></g>
      <path d="M70 138 Q100 158 130 138 L132 152 Q100 172 68 152Z" fill="url(#av-steel-dark)"/>
      <path d="M70 144 Q100 164 130 144" stroke="#cfd6de" stroke-width="1" fill="none" opacity="0.5"/>
      <!-- 깃털 장식 -->
      <path d="M100 44 Q102 2 150 8 Q180 14 182 46 Q166 28 150 32 Q174 46 168 70 Q156 48 134 48 Q148 60 142 76 Q128 52 104 52Z" fill="url(#av-red)"/>
      <path d="M104 46 Q112 16 150 15 M112 48 Q132 30 164 36 M118 50 Q138 46 158 60 M124 52 Q134 56 140 68" stroke="#ff9d94" stroke-width="1.2" fill="none" opacity="0.65"/>
      <!-- 투구 -->
      <path d="M64 72 Q64 34 100 34 Q136 34 136 72 V124 Q118 142 100 144 Q82 142 64 124Z" fill="url(#av-steel)"/>
      <path d="M100 34 Q136 34 136 72 V124 Q118 142 100 144Z" fill="#000" opacity="0.24"/>
      <path d="M72 64 Q74 46 92 40" stroke="#fff" stroke-width="3.5" fill="none" opacity="0.7" stroke-linecap="round"/>
      <rect x="95.5" y="34" width="9" height="110" fill="url(#av-gold)"/>
      <rect x="64" y="74" width="72" height="8" fill="url(#av-gold)"/>
      <path d="M95.5 34 v110 M104.5 34 v110 M64 74 h72 M64 82 h72" stroke="#6b4e14" stroke-width="0.7"/>
      <rect x="70" y="86" width="23" height="5.5" rx="2" fill="#05070b"/><rect x="107" y="86" width="23" height="5.5" rx="2" fill="#05070b"/>
      <g fill="#05070b"><circle cx="74" cy="104" r="1.5"/><circle cx="81" cy="104" r="1.5"/><circle cx="88" cy="104" r="1.5"/><circle cx="74" cy="112" r="1.5"/><circle cx="81" cy="112" r="1.5"/><circle cx="88" cy="112" r="1.5"/><circle cx="78" cy="120" r="1.5"/><circle cx="85" cy="120" r="1.5"/>
        <circle cx="126" cy="104" r="1.5"/><circle cx="119" cy="104" r="1.5"/><circle cx="112" cy="104" r="1.5"/><circle cx="126" cy="112" r="1.5"/><circle cx="119" cy="112" r="1.5"/><circle cx="112" cy="112" r="1.5"/><circle cx="122" cy="120" r="1.5"/><circle cx="115" cy="120" r="1.5"/></g>
      <g fill="#6b4e14"><circle cx="70" cy="78" r="1.3"/><circle cx="82" cy="78" r="1.3"/><circle cx="118" cy="78" r="1.3"/><circle cx="130" cy="78" r="1.3"/><circle cx="100" cy="48" r="1.3"/><circle cx="100" cy="62" r="1.3"/><circle cx="100" cy="100" r="1.3"/><circle cx="100" cy="116" r="1.3"/><circle cx="100" cy="132" r="1.3"/></g>
      <path d="M90 37 Q100 24 110 37Z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.7"/>`,
  },

  // 아서의 충신: 깃발 든 창과 십자 방패의 젊은 병사
  servant: {
    team: 'good',
    bg: 'av-bg-good',
    art: `
      <ellipse cx="60" cy="60" rx="34" ry="10" fill="#fff" opacity="0.1"/><ellipse cx="130" cy="36" rx="30" ry="8" fill="#fff" opacity="0.08"/>
      <!-- 깃발 든 창 -->
      <rect x="150" y="18" width="5" height="190" fill="url(#av-wood)"/>
      <path d="M152.5 0 l7 20 h-14z" fill="url(#av-steel)" stroke="#59626e" stroke-width="0.8"/>
      <path d="M155 24 h32 q-8 10 0 20 q-8 10 0 20 h-32z" fill="url(#av-red)"/>
      <path d="M166 36h6v6h6v6h-6v10h-6v-10h-6v-6h6z" fill="url(#av-gold)"/>
      <!-- 사슬 갑옷 소매와 겉옷 -->
      <path d="M22 204 Q26 158 70 144 Q100 160 130 144 Q174 158 178 204Z" fill="url(#av-mail)"/>
      <path d="M22 204 Q26 158 70 144 Q100 160 130 144 Q174 158 178 204Z" fill="#0a1433" opacity="0.25"/>
      <path d="M52 204 Q56 164 78 150 Q100 162 122 150 Q144 164 148 204Z" fill="url(#av-blue)"/>
      <path d="M78 150 Q100 162 122 150" stroke="url(#av-gold)" stroke-width="3" fill="none"/>
      <path d="M100 168 q-11 11 0 28 q11 -17 0 -28z M87 183 q-9 0 -9 11 q11 2 15 -5z M113 183 q9 0 9 11 q-11 2 -15 -5z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.6"/>
      <!-- 목과 사슬 두건 -->
      <path d="M66 98 Q60 146 100 156 Q140 146 134 98 Q134 68 100 68 Q66 68 66 98Z" fill="url(#av-mail)"/>
      <path d="M100 68 Q134 68 134 98 Q140 146 100 156Z" fill="#0a1433" opacity="0.22"/>
      <!-- 얼굴 -->
      <ellipse cx="100" cy="104" rx="21.5" ry="26" fill="url(#av-skin)"/>
      <path d="M80 112 Q100 138 120 112 Q116 130 100 131 Q84 130 80 112Z" fill="#b9855a" opacity="0.3"/>
      <path d="M100 102 Q96 114 100 117 Q104 114 100 102" fill="#c9905f"/>
      ${eye(90, 103, '#6b4a2a')}${eye(110, 103, '#6b4a2a')}
      <path d="M83 96 q7 -5 13 -1 M117 96 q-7 -5 -13 -1" stroke="#5a3a1c" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M92 122 q8 3 16 0" stroke="#9a5a44" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="84" cy="112" r="5" fill="#e58f7a" opacity="0.25"/><circle cx="116" cy="112" r="5" fill="#e58f7a" opacity="0.25"/>
      <!-- 철모 -->
      <path d="M68 86 Q68 46 100 44 Q132 46 132 86Z" fill="url(#av-steel)"/>
      <path d="M100 44 Q132 46 132 86 H100Z" fill="#000" opacity="0.2"/>
      <path d="M76 76 Q78 56 94 50" stroke="#fff" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round"/>
      <path d="M100 44 V84" stroke="#59626e" stroke-width="2"/>
      <path d="M54 88 Q100 72 146 88 Q100 102 54 88Z" fill="url(#av-steel-dark)"/>
      <path d="M58 87 Q100 74 142 87" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.55"/>
      <g fill="#3a424c"><circle cx="72" cy="84" r="1.4"/><circle cx="86" cy="81" r="1.4"/><circle cx="114" cy="81" r="1.4"/><circle cx="128" cy="84" r="1.4"/></g>
      <path d="M95.5 84 h9 v24 q-4.5 5 -9 0z" fill="url(#av-steel)" stroke="#59626e" stroke-width="0.8"/>
      <!-- 방패 -->
      <g transform="translate(14 -10)">
        <path d="M22 136 h56 v32 q0 28 -28 44 q-28 -16 -28 -44z" fill="#f4f1e8" stroke="url(#av-gold)" stroke-width="4.5"/>
        <path d="M44.5 140 h11 v20 h19 v11 h-19 v34 h-11 v-34 h-19 v-11 h19z" fill="url(#av-red)"/>
        <path d="M50 136 h28 v32 q0 28 -28 44z" fill="#000" opacity="0.12"/>
        <path d="M26 140 h20" stroke="#fff" stroke-width="2" opacity="0.7"/>
      </g>`,
  },

  // 암살자: 붉은 달 아래, 두건 속에서 빛나는 눈과 치켜든 단검
  assassin: {
    team: 'evil',
    bg: 'av-bg-evil',
    art: `
      <circle cx="56" cy="54" r="36" fill="#ffb9a3" opacity="0.14"/><circle cx="56" cy="54" r="26" fill="#ffd2c2" opacity="0.16"/>
      <path d="M0 150 q30 -14 60 -4 q30 10 60 -2 q40 -14 80 2 v60 H0z" fill="#12030a" opacity="0.5"/>
      <!-- 망토와 가죽 갑옷 -->
      <path d="M8 204 Q14 150 66 136 L100 152 L134 136 Q186 150 192 204Z" fill="#190406"/>
      <path d="M8 204 Q14 150 66 136 L74 150 Q36 166 30 204Z" fill="#2c0a0d"/>
      <path d="M58 204 Q62 162 100 152 Q138 162 142 204Z" fill="#3b1519"/>
      <path d="M64 152 L138 204 M136 152 L98 180" stroke="#7a4426" stroke-width="7"/>
      <path d="M64 152 L138 204 M136 152 L98 180" stroke="#3f2010" stroke-width="1" stroke-dasharray="2 3"/>
      <rect x="93" y="172" width="13" height="13" rx="2" fill="#190406" stroke="url(#av-gold)" stroke-width="3"/>
      <!-- 두건 -->
      <path d="M100 24 Q40 32 48 122 Q52 146 70 152 Q100 132 130 152 Q148 146 152 122 Q160 32 100 24Z" fill="url(#av-hood)"/>
      <path d="M100 24 Q160 32 152 122 Q148 146 130 152 Q112 138 100 138Z" fill="#000" opacity="0.28"/>
      <path d="M100 24 q7 -11 3 -18 q-10 6 -3 18z" fill="#5a1218"/>
      <path d="M78 38 Q56 64 56 114" stroke="#d2515a" stroke-width="3" fill="none" opacity="0.5" stroke-linecap="round"/>
      <path d="M100 26 Q72 52 64 122 M100 26 Q128 52 136 122" stroke="#16040a" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- 그늘진 얼굴 -->
      <path d="M100 46 Q66 58 70 114 Q84 140 100 142 Q116 140 130 114 Q134 58 100 46Z" fill="#070102"/>
      <path d="M78 88 Q100 78 122 88 L120 102 Q100 96 80 102Z" fill="#2f1814"/>
      <circle cx="88" cy="95" r="9" fill="url(#av-glow-red)"/><circle cx="112" cy="95" r="9" fill="url(#av-glow-red)"/>
      <path d="M80 93 l14 4 -13 2z" fill="#ff7a62"/><path d="M120 93 l-14 4 13 2z" fill="#ff7a62"/>
      <path d="M79 89 l15 5 M121 89 l-15 5" stroke="#070102" stroke-width="2.4"/>
      <path d="M74 104 Q100 114 126 104 L124 126 Q100 144 76 126Z" fill="#521117"/>
      <path d="M80 112 Q100 121 120 112 M82 120 Q100 130 118 120" stroke="#2a0709" stroke-width="1.2" fill="none"/>
      <path d="M74 104 Q100 114 126 104" stroke="#8f232b" stroke-width="1.2" fill="none"/>
      <!-- 단검 -->
      <path d="M154 40 L165 126 H143Z" fill="url(#av-steel)"/>
      <path d="M154 40 L165 126 H154Z" fill="#000" opacity="0.28"/>
      <path d="M154 54 V122" stroke="#59626e" stroke-width="1"/>
      <rect x="134" y="124" width="40" height="8" rx="4" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.8"/>
      <path d="M142 134 q-6 6 -4 18 q12 10 28 2 q4 -12 -2 -20z" fill="#2c1512"/>
      <path d="M142 142 q12 4 24 0 M141 149 q12 4 26 0" stroke="#120806" stroke-width="1.2" fill="none"/>
      <circle cx="154" cy="162" r="5.5" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.8"/>
      ${sparkle(158, 62, 6, '#fff', 0.95)}`,
  },

  // 모르가나: 보랏빛 안개 속, 붉은 보석 왕관을 쓴 마녀
  morgana: {
    team: 'evil',
    bg: 'av-bg-witch',
    art: `
      <circle cx="150" cy="46" r="15" fill="#f1dcf5" opacity="0.75"/><circle cx="157" cy="42" r="14" fill="#5a1c62"/>
      <path d="M26 160 q12 -32 -4 -56 q22 16 18 44 q8 -10 6 -24 q14 22 0 48z" fill="#9dffb0" opacity="0.13"/>
      <path d="M176 170 q-12 -30 2 -52 q-20 16 -16 42 q-8 -10 -6 -22 q-12 20 2 44z" fill="#d58cff" opacity="0.14"/>
      ${sparkle(34, 44, 3, '#f1dcf5', 0.7)}${sparkle(170, 96, 2.5, '#f1dcf5', 0.6)}${sparkle(60, 22, 2, '#f1dcf5', 0.6)}
      <!-- 뒷머리 -->
      <path d="M48 204 Q30 112 58 64 Q76 34 100 34 Q124 34 142 64 Q170 112 152 204Z" fill="#0b0610"/>
      <path d="M60 82 Q46 134 54 196 M70 60 Q52 114 64 186 M140 82 Q154 134 146 196 M130 60 Q148 114 136 186" stroke="#54408a" stroke-width="2" fill="none" opacity="0.75"/>
      <!-- 높은 깃과 드레스 -->
      <path d="M52 204 L64 118 Q72 152 100 164 Q128 152 136 118 L148 204Z" fill="url(#av-purple)"/>
      <path d="M64 118 Q72 152 100 164 Q128 152 136 118" stroke="url(#av-gold)" stroke-width="2.5" fill="none"/>
      <path d="M22 204 Q28 166 70 154 Q100 176 130 154 Q172 166 178 204Z" fill="url(#av-purple)"/>
      <path d="M100 172 Q130 160 150 162 Q172 172 178 204 H100Z" fill="#000" opacity="0.25"/>
      <path d="M34 190 q10 -14 26 -18 M166 190 q-10 -14 -26 -18" stroke="url(#av-gold)" stroke-width="1.5" fill="none" opacity="0.8"/>
      <!-- 목과 가슴 -->
      <path d="M89 120 h22 v28 q-11 9 -22 0z" fill="url(#av-skin-pale)"/>
      <path d="M89 124 q11 9 22 0 v8 q-11 9 -22 0z" fill="#9c7a78" opacity="0.5"/>
      <path d="M82 152 Q100 164 118 152 L100 190Z" fill="url(#av-skin-pale)"/>
      <path d="M80 153 Q100 176 120 153" stroke="url(#av-gold)" stroke-width="2.5" fill="none"/>
      <path d="M100 168 l6.5 9 -6.5 11 -6.5 -11z" fill="#e0453a" stroke="url(#av-gold)" stroke-width="1.5"/>
      <path d="M100 168 l6.5 9 h-13z" fill="#fff" opacity="0.35"/>
      <!-- 얼굴 -->
      <path d="M75 88 Q75 54 100 54 Q125 54 125 88 Q125 114 100 136 Q75 114 75 88Z" fill="url(#av-skin-pale)"/>
      <path d="M77 98 Q82 120 100 136 Q88 114 84 96Z" fill="#9c7a78" opacity="0.3"/><path d="M123 98 Q118 120 100 136 Q112 114 116 96Z" fill="#9c7a78" opacity="0.45"/>
      <path d="M100 96 q-3.5 13 0 15.5 q3.5 -2.5 0 -15.5" fill="#c7a093" opacity="0.85"/>
      <path d="M80 91 q9 -9 17 0 q-8 -3 -17 0z" fill="#6a1a62" opacity="0.85"/><path d="M120 91 q-9 -9 -17 0 q8 -3 17 0z" fill="#6a1a62" opacity="0.85"/>
      <path d="M81 94 q8 -6 16 0 q-8 6 -16 0z" fill="#fff"/><path d="M119 94 q-8 -6 -16 0 q8 6 16 0z" fill="#fff"/>
      <circle cx="89.5" cy="94" r="3" fill="#a556e8"/><circle cx="89.5" cy="94" r="1.3" fill="#0b0610"/><circle cx="88.5" cy="93" r="0.7" fill="#fff"/>
      <circle cx="110.5" cy="94" r="3" fill="#a556e8"/><circle cx="110.5" cy="94" r="1.3" fill="#0b0610"/><circle cx="109.5" cy="93" r="0.7" fill="#fff"/>
      <path d="M76 91 l5 3 q8 -7 16 0 M124 91 l-5 3 q-8 -7 -16 0" stroke="#0b0610" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M80 84 L97 88 M120 84 L103 88" stroke="#0b0610" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M91 119 q4.5 -3.5 9 -1.2 q4.5 -2.3 9 1.2 q-9 7 -18 0z" fill="#b3182b"/>
      <path d="M91 119 q9 2.5 18 0" stroke="#6b0d18" stroke-width="0.9" fill="none"/>
      <!-- 앞머리 -->
      <path d="M72 100 Q64 48 100 44 Q136 48 128 100 Q124 70 100 62 Q76 70 72 100Z" fill="#0b0610"/>
      <path d="M92 60 Q100 76 108 60 Q100 55 92 60Z" fill="#0b0610"/>
      <path d="M78 66 Q72 80 74 96 M122 66 Q128 80 126 96" stroke="#54408a" stroke-width="1.6" fill="none" opacity="0.8"/>
      <!-- 왕관과 귀걸이 -->
      <path d="M84 64 l5 -14 5 11 6 -21 6 21 5 -11 5 14 Q100 56 84 64Z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.7"/>
      <path d="M72 72 Q100 54 128 72 L126 79 Q100 62 74 79Z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.7"/>
      <path d="M100 48 l4.5 7 -4.5 8 -4.5 -8z" fill="#e0453a"/><path d="M100 48 l4.5 7 h-9z" fill="#fff" opacity="0.4"/>
      <circle cx="87" cy="65" r="2" fill="#9dffb0"/><circle cx="113" cy="65" r="2" fill="#9dffb0"/>
      <path d="M73 106 l2.5 11 -2.5 5 -2.5 -5z" fill="url(#av-gold)"/><path d="M127 106 l2.5 11 -2.5 5 -2.5 -5z" fill="url(#av-gold)"/>
      <!-- 마법 구슬 -->
      <circle cx="38" cy="152" r="26" fill="url(#av-glow-green)"/><circle cx="38" cy="152" r="9" fill="#d6ffe2" opacity="0.9"/>
      ${sparkle(38, 152, 8, '#fff', 0.95)}`,
  },

  // 모드레드: 불길을 등진 검은 갑옷의 왕. 왕관 쓴 투구 속 붉은 눈
  mordred: {
    team: 'evil',
    bg: 'av-bg-evil',
    art: `
      <ellipse cx="100" cy="204" rx="110" ry="70" fill="url(#av-glow-fire)"/>
      <path d="M8 204 L18 112 L26 150 L34 96 L44 204Z M156 204 L166 98 L174 148 L182 108 L192 204Z" fill="#0b0203" opacity="0.85"/>
      <path d="M52 204 q-4 -22 6 -34 q0 14 8 18 q-4 -18 6 -30 q10 26 0 46z M148 204 q4 -20 -6 -30 q0 12 -8 16 q4 -16 -6 -26 q-10 22 0 40z" fill="#ff8a3a" opacity="0.35"/>
      <!-- 망토 -->
      <path d="M12 204 Q18 150 60 138 L54 204Z" fill="url(#av-red)"/><path d="M188 204 Q182 150 140 138 L146 204Z" fill="#4f0b10"/>
      <!-- 흉갑 -->
      <path d="M32 204 Q36 156 72 144 Q100 162 128 144 Q164 156 168 204Z" fill="url(#av-iron)"/>
      <path d="M72 144 Q100 162 128 144" stroke="#d2343c" stroke-width="3" fill="none"/>
      <path d="M100 162 V204" stroke="#0c0d10" stroke-width="2"/>
      <path d="M100 168 l11 11 -6.5 2.5 6.5 15 -11 -8.5 -11 8.5 6.5 -15 -6.5 -2.5z" fill="url(#av-red)" stroke="#2a0507" stroke-width="0.8"/>
      <!-- 가시 돋친 어깨 갑옷 -->
      <path d="M30 152 L14 118 L44 142Z M50 142 L46 106 L64 140Z" fill="url(#av-steel-dark)" stroke="#0c0d10" stroke-width="1"/>
      <path d="M170 152 L186 118 L156 142Z M150 142 L154 106 L136 140Z" fill="url(#av-iron)" stroke="#0c0d10" stroke-width="1"/>
      <path d="M18 186 Q18 148 56 140 Q76 146 76 168 Q48 166 26 192Z" fill="url(#av-iron)" stroke="#d2343c" stroke-width="1.5"/>
      <path d="M182 186 Q182 148 144 140 Q124 146 124 168 Q152 166 174 192Z" fill="#15171c" stroke="#8a1c21" stroke-width="1.5"/>
      <path d="M26 176 Q42 156 68 156" stroke="#aab2bd" stroke-width="1.4" fill="none" opacity="0.55"/>
      <path d="M70 138 Q100 158 130 138 L132 152 Q100 172 68 152Z" fill="#15171c"/>
      <!-- 투구 -->
      <path d="M62 78 Q62 38 100 38 Q138 38 138 78 V120 L120 144 H80 L62 120Z" fill="url(#av-iron)"/>
      <path d="M100 38 Q138 38 138 78 V120 L120 144 H100Z" fill="#000" opacity="0.35"/>
      <path d="M70 72 Q70 50 90 44" stroke="#c3cad3" stroke-width="3.5" fill="none" opacity="0.55" stroke-linecap="round"/>
      <path d="M100 38 V84" stroke="#4a505b" stroke-width="3"/>
      <path d="M70 84 H130 V97 H107 V138 H93 V97 H70Z" fill="#030304"/>
      <path d="M70 84 H130 V97 H107 V138 H93 V97 H70Z" fill="none" stroke="#d2343c" stroke-width="1" opacity="0.6"/>
      <circle cx="83" cy="90.5" r="10" fill="url(#av-glow-red)"/><circle cx="117" cy="90.5" r="10" fill="url(#av-glow-red)"/>
      <path d="M75 89 l15 -1 -1 5 -13 1z" fill="#ff7a62"/><path d="M125 89 l-15 -1 1 5 13 1z" fill="#ff7a62"/>
      <g fill="#0c0d10"><circle cx="68" cy="108" r="1.6"/><circle cx="72" cy="120" r="1.6"/><circle cx="132" cy="108" r="1.6"/><circle cx="128" cy="120" r="1.6"/></g>
      <!-- 왕관 -->
      <path d="M60 64 L55 20 L73 46 L85 12 L100 42 L115 12 L127 46 L145 20 L140 64 Q100 52 60 64Z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="1"/>
      <path d="M100 42 L115 12 L127 46 L145 20 L140 64 Q120 56 100 54Z" fill="#000" opacity="0.18"/>
      <path d="M60 64 Q100 52 140 64 L139 73 Q100 61 61 73Z" fill="#a8842f" stroke="#6b4e14" stroke-width="0.8"/>
      <circle cx="100" cy="61" r="4.5" fill="#e0453a" stroke="#6b4e14" stroke-width="0.8"/><circle cx="98.6" cy="59.6" r="1.4" fill="#fff" opacity="0.7"/>
      <circle cx="78" cy="65" r="3" fill="#4a0d6e" stroke="#6b4e14" stroke-width="0.7"/><circle cx="122" cy="65" r="3" fill="#4a0d6e" stroke="#6b4e14" stroke-width="0.7"/>
      <g fill="#fbeab0"><circle cx="55" cy="20" r="2.4"/><circle cx="85" cy="12" r="2.4"/><circle cx="115" cy="12" r="2.4"/><circle cx="145" cy="20" r="2.4"/></g>`,
  },

  // 오베론: 달빛 숲의 정체불명. 사슴뿔과 뼈 가면
  oberon: {
    team: 'evil',
    bg: 'av-bg-forest',
    art: `
      <circle cx="100" cy="66" r="56" fill="#d8ffd0" opacity="0.1"/><circle cx="100" cy="66" r="40" fill="#e8ffe0" opacity="0.08"/>
      <path d="M0 204 V110 l10 -34 10 34 V204Z M20 204 V132 l9 -28 9 28 V204Z M162 204 V128 l9 -30 9 30 V204Z M180 204 V104 l10 -36 10 36 V204Z" fill="#030a06" opacity="0.7"/>
      <g fill="#e6ff9a"><circle cx="34" cy="92" r="1.6"/><circle cx="164" cy="70" r="1.6"/><circle cx="150" cy="124" r="1.3"/><circle cx="46" cy="140" r="1.3"/><circle cx="172" cy="150" r="1.2"/></g>
      <circle cx="34" cy="92" r="6" fill="url(#av-glow-green)"/><circle cx="164" cy="70" r="6" fill="url(#av-glow-green)"/><circle cx="150" cy="124" r="5" fill="url(#av-glow-green)"/>
      <!-- 사슴뿔 -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M84 62 Q68 44 70 12 M75 40 Q56 36 48 14 M72 26 Q60 20 58 6 M80 54 Q58 58 40 44 M56 51 Q44 46 38 32" stroke="#6b6250" stroke-width="9"/>
        <path d="M116 62 Q132 44 130 12 M125 40 Q144 36 152 14 M128 26 Q140 20 142 6 M120 54 Q142 58 160 44 M144 51 Q156 46 162 32" stroke="#5a5242" stroke-width="9"/>
        <path d="M84 62 Q68 44 70 12 M75 40 Q56 36 48 14 M72 26 Q60 20 58 6 M80 54 Q58 58 40 44 M56 51 Q44 46 38 32" stroke="#efe6cc" stroke-width="6"/>
        <path d="M116 62 Q132 44 130 12 M125 40 Q144 36 152 14 M128 26 Q140 20 142 6 M120 54 Q142 58 160 44 M144 51 Q156 46 162 32" stroke="#c9bd9c" stroke-width="6"/>
      </g>
      <!-- 망토와 잎 깃 -->
      <path d="M20 204 Q26 160 70 148 L100 162 L130 148 Q174 160 180 204Z" fill="#12301f"/>
      <path d="M100 162 L130 148 Q174 160 180 204 H100Z" fill="#000" opacity="0.25"/>
      <path d="M48 178 L56 148 L66 168 L74 144 L85 166 L93 146 L100 168 L107 146 L115 166 L126 144 L134 168 L144 148 L152 178 Q100 198 48 178Z" fill="#3f6a3a"/>
      <path d="M56 148 L66 168 M74 144 L85 166 M93 146 L100 168 M107 146 L115 166 M126 144 L134 168 M144 148 L152 178" stroke="#1c3a20" stroke-width="1.4"/>
      <path d="M48 178 L56 148 L62 160 M134 168 L144 148" stroke="#7fb06e" stroke-width="1.2" fill="none" opacity="0.6"/>
      <!-- 두건과 뼈 가면 -->
      <path d="M60 98 Q56 58 100 52 Q144 58 140 98 Q142 140 100 154 Q58 140 60 98Z" fill="#07140c"/>
      <path d="M71 90 Q71 60 100 60 Q129 60 129 90 Q129 114 115 130 L109 150 H91 L85 130 Q71 114 71 90Z" fill="url(#av-bone)"/>
      <path d="M100 60 Q129 60 129 90 Q129 114 115 130 L109 150 H100Z" fill="#000" opacity="0.18"/>
      <path d="M76 91 Q86 78 97 91 Q91 104 80 100Z" fill="#030a06"/><path d="M124 91 Q114 78 103 91 Q109 104 120 100Z" fill="#030a06"/>
      <circle cx="88" cy="92" r="9" fill="url(#av-glow-green)"/><circle cx="112" cy="92" r="9" fill="url(#av-glow-green)"/>
      <circle cx="88" cy="92.5" r="2.6" fill="#b9ff9a"/><circle cx="112" cy="92.5" r="2.6" fill="#b9ff9a"/>
      <path d="M100 104 l-4.5 11 h9z" fill="#030a06"/>
      <path d="M89 132 h22 M93 127 v11 M100 127 v13 M107 127 v11" stroke="#6b6250" stroke-width="1.3"/>
      <path d="M100 62 V86 M90 66 q10 7 20 0 M76 108 q6 6 8 14 M124 108 q-6 6 -8 14" stroke="#8d8368" stroke-width="1.3" fill="none"/>
      <path d="M76 84 q10 -10 20 -4 M124 84 q-10 -10 -20 -4" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6"/>
      <!-- 잎 왕관 -->
      <g stroke="#1c3a20" stroke-width="0.6">
        <path d="M74 70 q-13 -6 -11 -22 q13 4 11 22z" fill="#5c9a52"/><path d="M86 62 q-9 -11 -3 -24 q10 8 3 24z" fill="#6aae5c"/>
        <path d="M126 70 q13 -6 11 -22 q-13 4 -11 22z" fill="#3f7a3a"/><path d="M114 62 q9 -11 3 -24 q-10 8 -3 24z" fill="#4f8a46"/>
        <path d="M100 60 q-6 -12 0 -24 q6 12 0 24z" fill="#7fc06e"/>
      </g>`,
  },

  // 모드레드의 하수인: 횃불 아래 도끼를 멘 뿔 투구의 졸개
  minion: {
    team: 'evil',
    bg: 'av-bg-evil',
    art: `
      <circle cx="30" cy="84" r="34" fill="url(#av-glow-fire)"/>
      <rect x="27" y="108" width="6" height="100" fill="url(#av-wood)"/>
      <path d="M22 108 h16 l-3 10 h-10z" fill="url(#av-steel-dark)"/>
      <path d="M30 108 q-14 -20 0 -40 q2 14 9 16 q-2 -16 5 -26 q12 26 -2 50z" fill="#ff8a2a"/>
      <path d="M31 106 q-7 -12 0 -24 q3 8 6 9 q0 -8 3 -12 q5 14 -3 27z" fill="#ffe08a"/>
      <!-- 도끼 -->
      <path d="M148 40 L164 204 H156 L142 40Z" fill="url(#av-wood)"/>
      <path d="M146 42 Q190 34 194 80 Q190 118 152 108 Q166 78 146 42Z" fill="url(#av-steel)" stroke="#3a3f49" stroke-width="1.5"/>
      <path d="M150 46 Q168 78 156 106 Q176 110 188 96 Q176 70 150 46Z" fill="#000" opacity="0.18"/>
      <path d="M186 50 Q196 80 186 106" stroke="#fff" stroke-width="2.2" fill="none" opacity="0.7"/>
      <path d="M160 62 l10 6 M158 90 l12 -4" stroke="#59626e" stroke-width="1.2"/>
      <!-- 몸통 -->
      <path d="M20 204 Q24 158 70 146 Q100 162 130 146 Q176 158 180 204Z" fill="#3b1519"/>
      <path d="M62 122 Q56 166 100 176 Q144 166 138 122Z" fill="url(#av-mail)"/>
      <path d="M62 122 Q56 166 100 176 Q144 166 138 122Z" fill="#1a0305" opacity="0.35"/>
      <path d="M100 184 l7 9 -7 9 -7 -9z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.7"/>
      <path d="M36 154 L26 128 L48 148Z" fill="url(#av-steel-dark)" stroke="#0c0d10" stroke-width="1"/>
      <path d="M20 190 Q20 152 58 146 Q74 152 74 172 Q48 170 28 194Z" fill="#6b3420" stroke="#2a0f0a" stroke-width="1.5"/>
      <path d="M180 190 Q180 152 142 146 Q126 152 126 172 Q152 170 172 194Z" fill="#4a2214" stroke="#2a0f0a" stroke-width="1.5"/>
      <g fill="url(#av-gold)"><circle cx="34" cy="172" r="2.4"/><circle cx="48" cy="160" r="2.4"/><circle cx="64" cy="158" r="2.4"/><circle cx="166" cy="172" r="2.4"/><circle cx="152" cy="160" r="2.4"/><circle cx="136" cy="158" r="2.4"/></g>
      <!-- 뿔 -->
      <path d="M70 72 Q34 68 28 20 Q48 46 80 54Z" fill="url(#av-bone)" stroke="#6b6250" stroke-width="1"/>
      <path d="M130 72 Q166 68 172 20 Q152 46 120 54Z" fill="#c9bd9c" stroke="#6b6250" stroke-width="1"/>
      <path d="M40 44 q8 2 12 8 M50 56 q8 0 12 6 M160 44 q-8 2 -12 8 M150 56 q-8 0 -12 6" stroke="#8d8368" stroke-width="1.3" fill="none"/>
      <!-- 투구 -->
      <path d="M62 90 Q62 44 100 44 Q138 44 138 90 V118 Q120 136 100 138 Q80 136 62 118Z" fill="url(#av-steel-dark)"/>
      <path d="M100 44 Q138 44 138 90 V118 Q120 136 100 138Z" fill="#000" opacity="0.3"/>
      <path d="M70 80 Q72 58 92 50" stroke="#dfe5ec" stroke-width="3" fill="none" opacity="0.5" stroke-linecap="round"/>
      <path d="M62 84 H138 V93 H62Z" fill="#23272e"/>
      <g fill="#98a1ad"><circle cx="70" cy="88.5" r="1.7"/><circle cx="84" cy="88.5" r="1.7"/><circle cx="116" cy="88.5" r="1.7"/><circle cx="130" cy="88.5" r="1.7"/></g>
      <path d="M112 54 l11 15 M79 58 l-6 11 M120 60 l4 4" stroke="#15171c" stroke-width="1.6"/>
      <!-- 투구 속 얼굴 -->
      <path d="M72 93 H128 V114 Q114 128 100 128 Q86 128 72 114Z" fill="#0a0203"/>
      <circle cx="87" cy="104" r="8" fill="url(#av-glow-red)"/><circle cx="113" cy="104" r="8" fill="url(#av-glow-red)"/>
      <path d="M80 102 l13 3 -12 2z" fill="#ff7a62"/><path d="M120 102 l-13 3 12 2z" fill="#ff7a62"/>
      <path d="M84 119 l3 6 3 -6 3 6 3 -6 4 7 4 -7 3 6 3 -6 3 6 3 -6" stroke="#e8e0cc" stroke-width="1.7" fill="none" stroke-linejoin="round"/>
      <path d="M94.5 84 h11 v32 l-5.5 6 -5.5 -6z" fill="url(#av-steel-dark)" stroke="#15171c" stroke-width="1"/>`,
  },
};

// 덮어 둔 역할 카드의 뒷면: 빛나는 검과 왕관
const CARD_BACK_ART = `
  <g fill="#f6e3a4" opacity="0.1">
    <path d="M100 100 L80 0 H120Z"/><path d="M100 100 L200 80 V120Z"/><path d="M100 100 L80 200 H120Z"/><path d="M100 100 L0 80 V120Z"/>
    <path d="M100 100 L170 14 L186 30Z"/><path d="M100 100 L186 170 L170 186Z"/><path d="M100 100 L30 186 L14 170Z"/><path d="M100 100 L14 30 L30 14Z"/>
  </g>
  <path d="M74 44 l-4 -18 12 10 8 -16 10 16 10 -16 8 16 12 -10 -4 18z" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.8"/>
  <path d="M100 52 L109 68 V140 H91 V68Z" fill="url(#av-steel)"/>
  <path d="M100 52 L109 68 V140 H100Z" fill="#000" opacity="0.25"/>
  <path d="M100 66 V138" stroke="#59626e" stroke-width="1.2"/>
  <rect x="68" y="138" width="64" height="10" rx="5" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.8"/>
  <rect x="94" y="148" width="12" height="24" fill="url(#av-wood)"/>
  <path d="M94 154 h12 M94 160 h12 M94 166 h12" stroke="#2a180a" stroke-width="1.2"/>
  <circle cx="100" cy="178" r="8" fill="url(#av-gold)" stroke="#6b4e14" stroke-width="0.8"/>
  <circle cx="100" cy="178" r="3" fill="#e0453a"/>`;

// 아직 정체를 모르는 자리: 빈 방패 (이름 첫 글자는 initialArt 가 위에 얹는다)
const BLANK_ART = `
  <path d="M100 26 L158 44 V98 Q158 146 100 178 Q42 146 42 98 V44Z" fill="url(#av-wood)" stroke="url(#av-gold)" stroke-width="5"/>
  <path d="M100 26 L158 44 V98 Q158 146 100 178Z" fill="#000" opacity="0.22"/>
  <path d="M100 34 L150 50 V98 Q150 140 100 168 Q50 140 50 98 V50Z" fill="none" stroke="#6b4e14" stroke-width="1.2"/>`;

// 메달 하나를 <symbol> 로 만든다.
function symbol(id, background, art, gem) {
  return `
    <symbol id="${id}" viewBox="0 0 200 200">
      <g clip-path="url(#av-clip)">
        <g class="av-art">
          <rect width="200" height="200" fill="url(#${background})"/>
          ${art}
        </g>
        <circle cx="100" cy="100" r="89" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="14"/>
      </g>
      ${frame(gem)}
    </symbol>`;
}

// 그림 정의를 담은 보이지 않는 <svg> 를 문서에 한 번 넣는다.
// (display:none 으로 숨기면 그 안의 그라디언트를 다른 곳에서 쓸 수 없어서, 크기 0으로 둔다)
document.body.insertAdjacentHTML(
  'afterbegin',
  `<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true">
     <defs>${ART_DEFS}</defs>
     ${Object.entries(PORTRAITS).map(([role, p]) => symbol('av-role-' + role, p.bg, p.art, GEM[p.team])).join('')}
     ${symbol('av-card-back', 'av-bg-none', CARD_BACK_ART, GEM.none)}
     ${symbol('av-blank', 'av-bg-none', BLANK_ART, GEM.none)}
   </svg>`
);

// ---------- 일러스트 이미지로 바꾸기 ----------
// public/portraits/ 폴더에 merlin.png 처럼 "역할 키.확장자" 이름으로 그림 파일을 넣으면,
// 위의 SVG 초상 대신 그 그림이 금테 메달 안에 들어간다. 파일이 없는 역할은 SVG 를 그대로 쓴다.
// 서버가 /portraits.json 으로 폴더의 파일 목록을 알려 준다. (자세한 안내는 public/portraits/README.md)
fetch('portraits.json')
  .then((res) => res.json())
  .then((files) => {
    for (const file of files) {
      const role = file.replace(/\.[^.]+$/, '');
      const art = document.querySelector(`#av-role-${role} .av-art`);
      if (!art) continue; // 역할 이름과 맞지 않는 파일은 무시한다
      // 그림은 정사각형으로 맞춰 가운데를 채운다. 화면에 이미 나와 있는 초상도 함께 바뀐다.
      art.innerHTML = `<image href="portraits/${encodeURIComponent(file)}" width="200" height="200" preserveAspectRatio="xMidYMid slice"/>`;
    }
  })
  .catch(() => {}); // 목록을 못 받아도 SVG 초상으로 정상 동작한다

// ---------- client.js 가 쓰는 함수 ----------

// 역할 초상
function roleArt(role) {
  return `<svg class="art" viewBox="0 0 200 200" aria-hidden="true"><use href="#av-role-${role}"/></svg>`;
}

// 덮어 둔 역할 카드의 뒷면
function cardBackArt() {
  return '<svg class="art" viewBox="0 0 200 200" aria-hidden="true"><use href="#av-card-back"/></svg>';
}

// 아직 정체를 모르는 플레이어의 자리 표시: 이름 첫 글자를 새긴 방패.
// initial 은 사용자가 입력한 글자이므로 호출하는 쪽에서 이스케이프해서 넘긴다.
function initialArt(initial) {
  return `
    <svg class="art" viewBox="0 0 200 200" aria-hidden="true">
      <use href="#av-blank"/>
      <text x="100" y="128" text-anchor="middle" font-size="74" font-weight="700" fill="#f6e3a4" stroke="#3f2610" stroke-width="2" paint-order="stroke" font-family="'Gowun Batang', serif">${initial}</text>
    </svg>`;
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
