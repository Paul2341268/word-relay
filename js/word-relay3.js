/* word-relay.js (아바타 제거 버전)
   - 참가자 이름만 표시합니다.
   - 탈락 시 DOM에서 제거하지 않고 .inactive 클래스로 표시 (반투명 + 줄긋기)
   - 사용된 단어는 좌측 리스트(#used-list)에 기록
*/

/* ============================
   DOM 참조
   ============================ */
const inputEl = document.querySelector('#word-input');
const buttonEl = document.querySelector('#submit-btn');
const usedListEl = document.querySelector('#used-list');
const playersListEl = document.querySelector('#players-list');
const orderEl = document.querySelector('#order');
const wordEl = document.querySelector('#word');
const playerNameEl = document.querySelector('#player-name');

/* ============================
   게임 상태
   ============================ */
const players = [];   // { name, active }
const usedWords = new Set();
let word = '';        // 현재 제시어
let currentIndex = 0; // 현재 차례 인덱스

/* ============================
   참가자 입력받기 (prompt) - **이름만**
   - totalPlayers 만큼 입력을 받고 players 배열 채움
   - 입력 형식: "이름" (빈칸이면 기본 이름 사용)
   ============================ */
function promptPlayers(totalPlayers) {
  for (let i = 0; i < totalPlayers; i++) {
    const raw = (prompt(`${i + 1}번째 참가자 이름을 입력하세요.\n(비워두면 참가자${i + 1}으로 설정됩니다.)`) || '').trim();
    const name = raw || `참가자${i + 1}`;
    players.push({ name, active: true });
  }
}

/* ============================
   UI 렌더링 함수
   - renderPlayersList: players 배열을 기반으로 리스트를 그린다 (inactive 클래스로 탈락 표시)
   - addUsedWordToUI: used-list에 새 항목 추가 (누가 썼는지 함께 표시)
   - highlightCurrentPlayer: 현재 차례 강조 및 order/이름 업데이트
   ============================ */
function renderPlayersList() {
  if (!playersListEl) return;
  playersListEl.innerHTML = '';
  players.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'player';
    li.dataset.index = String(idx);

    // 이름만 표시 (아바타 제거 요청 반영)
    const nameDiv = document.createElement('div');
    nameDiv.className = 'player-name';
    nameDiv.textContent = p.name;

    li.appendChild(nameDiv);

    // 탈락(비활성) 플레이어는 inactive 클래스 추가 (DOM은 남겨둠)
    if (!p.active) li.classList.add('inactive');
    playersListEl.appendChild(li);
  });

  highlightCurrentPlayer();
}

function addUsedWordToUI(wordStr, playerName) {
  if (!usedListEl) return;
  const li = document.createElement('li');
  li.textContent = playerName ? `${playerName}: ${wordStr}` : wordStr;
  usedListEl.appendChild(li);
  usedListEl.scrollTop = usedListEl.scrollHeight;
}

function updateCurrentPlayerNameUI() {
  if (!playerNameEl) return;
  const p = players[currentIndex];
  playerNameEl.textContent = p ? `${p.name}님의 차례` : '';
}

function updateOrderUI() {
  if (!orderEl) return;
  orderEl.textContent = String(currentIndex + 1);
}

function highlightCurrentPlayer() {
  // 현재 차례가 비활성일 경우 다음 활성자로 보정
  if (players.length && (!players[currentIndex] || !players[currentIndex].active)) {
    currentIndex = getNextActiveIndex(currentIndex);
  }

  if (!playersListEl) return;
  playersListEl.querySelectorAll('.player').forEach(li => li.classList.remove('active-current'));
  const curLi = playersListEl.querySelector(`.player[data-index="${currentIndex}"]`);
  if (curLi) curLi.classList.add('active-current');

  updateCurrentPlayerNameUI();
  updateOrderUI();
}

/* ============================
   게임 헬퍼
   ============================ */
function getActiveCount() {
  return players.filter(p => p.active).length;
}

// 다음 활성 플레이어 인덱스 반환 (항상 활성인 사람 중 다음)
function getNextActiveIndex(fromIndex) {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIndex + step) % n;
    if (players[idx].active) return idx;
  }
  return fromIndex; // 모든 비활성일 때 안전 반환
}

/* ============================
   탈락 처리 함수
   - players[idx].active = false 및 li에 .inactive 클래스 추가
   - alert로 탈락 알림, 승자 체크 및 게임 종료 처리
   ============================ */
function eliminatePlayer(index, reasonMessage) {
  if (!players[index]) return;
  if (!players[index].active) return; // 이미 탈락이면 무시

  players[index].active = false;

  // UI: 해당 li에 .inactive 추가
  const li = playersListEl.querySelector(`.player[data-index="${index}"]`);
  if (li) li.classList.add('inactive');

  alert(`${players[index].name}님은 ${reasonMessage}로 탈락했습니다.`);

  // 승자 체크
  const remaining = getActiveCount();
  if (remaining === 1) {
    const winner = players.find(p => p.active);
    alert(`${winner.name}님의 승리입니다!!`);
    if (inputEl) inputEl.disabled = true;
    if (buttonEl) buttonEl.disabled = true;
  }
}

/* ============================
   게임 시작: 참가자 입력 & 초기 렌더링
   ============================ */
const totalPlayers = Number(prompt('몇 명이 참가하나요?')) || 0;
if (totalPlayers <= 0) {
  alert('유효한 참가자 수를 입력하세요.');
} else {
  promptPlayers(totalPlayers);
  renderPlayersList();
  currentIndex = 0;
  highlightCurrentPlayer();
}

/* ============================
   입력 처리 (버튼 클릭 / Enter)
   - 빈 입력 검사
   - 중복 검사 -> 탈락
   - 끝말잇기 규칙 검사 -> 수용 / 탈락
   - usedWords에 추가 및 UI 업데이트
   - 다음 차례로 이동
   ============================ */
if (buttonEl) {
  buttonEl.addEventListener('click', () => {
    if (!inputEl) return;
    const raw = inputEl.value;
    if (!raw || raw.trim() === '') {
      inputEl.value = '';
      inputEl.focus();
      return;
    }
    const candidate = raw.trim();

    // 현재 플레이어가 비활성일 경우 보정
    if (!players[currentIndex] || !players[currentIndex].active) {
      currentIndex = getNextActiveIndex(currentIndex);
      highlightCurrentPlayer();
      inputEl.value = '';
      inputEl.focus();
      return;
    }

    const player = players[currentIndex];

    // 1) 중복 검사
    if (usedWords.has(candidate)) {
      eliminatePlayer(currentIndex, '이미 사용된 단어 입력');
      currentIndex = getNextActiveIndex(currentIndex);
      highlightCurrentPlayer();
      inputEl.value = '';
      inputEl.focus();
      return;
    }

    // 2) 끝말잇기 규칙 검사
    if (!word || word.at(-1) === candidate[0]) {
      // 정상: 수용
      word = candidate;
      if (wordEl) wordEl.textContent = word;

      usedWords.add(candidate);
      addUsedWordToUI(candidate, player.name);

      // 다음 활성 참가자에게 차례 이동
      currentIndex = getNextActiveIndex(currentIndex);
      highlightCurrentPlayer();

    } else {
      // 규칙 위반 -> 탈락
      eliminatePlayer(currentIndex, '규칙 위반');
      currentIndex = getNextActiveIndex(currentIndex);
      highlightCurrentPlayer();
    }

    inputEl.value = '';
    inputEl.focus();
  });
}

/* Enter 키 지원 */
if (inputEl) {
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (buttonEl) buttonEl.click();
    }
  });
}
