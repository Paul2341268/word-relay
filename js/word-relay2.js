/* ======================
   상수 및 DOM 참조 (원래 코드)
   ====================== */
const number = Number(prompt('몇 명이 참가하나요?')); // 참가자 수 입력 (원래대로)
const input = document.querySelector('input');
const button = document.querySelector('button');
const wordEl = document.querySelector('#word');
const orderEl = document.querySelector('#order');

/* ======================
   추가: 참가자 정보 및 사용된 단어 집합
   - players: { name: string, active: boolean } 배열로 참가자 관리
   - usedWords: 이미 사용된 단어 저장 (중복 판정용)
   ====================== */
const players = [];            // [추가] 참가자 목록 (이름 + 활성 여부)
const usedWords = new Set();   // [추가] 사용된 단어들 (중복/탈락 판정에 사용)

/* 참가자 이름 입력받기 (추가)
   - number만큼 prompt로 이름을 입력받아 players 배열에 저장
   - 빈 이름이면 자동으로 "참가자N"으로 설정
*/
for (let i = 0; i < number; i++) {
  let name = prompt(`${i + 1}번째 참가자 이름을 입력하세요:`) || '';
  name = name.trim();
  if (!name) name = `참가자${i + 1}`; // 기본 이름
  players.push({ name, active: true });
}

/* ======================
   상태 변수 (원래 코드)
   - newWord: 입력중인 값
   - word: 현재 제시어(마지막으로 수용된 단어)
   - currentIndex: 현재 차례인 참가자(배열 인덱스, 추가)
   ====================== */
let newWord;            // [원래] input으로부터 들어오는 현재 입력값
let word;               // [원래] 현재 제시어(마지막으로 수용된 단어)
let currentIndex = 0;   // [추가] 현재 차례의 참가자 인덱스 (0-based)

/* 초기 화면 표시: 현재 차례(1부터) 표시 */
orderEl.textContent = (currentIndex + 1).toString();

/* ======================
   유틸리티 함수들 (추가)
   ====================== */
// 활성 참가자 수 반환
function getActiveCount() {
  return players.filter(p => p.active).length;
}

// 주어진 인덱스에서 다음 활성 참가자의 인덱스를 반환
// (자기 자신을 제외하고 순환. 만약 자기 자신만 활성이라면 자기 자신 반환)
function getNextActiveIndex(fromIndex) {
  const n = players.length;
  if (getActiveCount() <= 1) return fromIndex; // 한 명 이하인 경우 그대로 반환
  let i = fromIndex;
  do {
    i = (i + 1) % n;
    if (players[i].active) return i;
  } while (i !== fromIndex);
  return fromIndex;
}

// 승리자 체크 후 처리(추가)
function checkForWinnerAndFinish() {
  const active = players.filter(p => p.active);
  if (active.length === 1) {
    const winner = active[0];
    alert(`${winner.name}님의 승리입니다!!`); // 승리 알림
    // 게임 종료 처리: 버튼 비활성화 및 포커스 해제
    button.disabled = true;
    input.disabled = true;
    return true;
  }
  return false;
}

/* ======================
   입력 이벤트(원래 코드)
   - 사용자가 입력창에 타이핑하면 newWord에 값 저장
   ====================== */
const onInput = function (event) {
  newWord = event.target.value;
};

/* ======================
   클릭 핸들러: 통합 로직 (원래 로직 유지 + 추가 기능)
   동작 순서:
   1) 빈 입력이면 무시 (원래 UX)
   2) 입력 정규화 (trim) — 비교/저장 일관성 위해 (추가, 권장)
   3) 중복 단어 입력 시 -> 해당 참가자 탈락 (추가)
   4) 끝말잇기 규칙 위반 시 -> 해당 참가자 탈락 (추가)
   5) 정상 단어면 수용 (원래) + usedWords에 추가 (추가)
   6) 다음 활성 참가자에게 차례 이동 (원래/추가)
   7) 탈락 후 남은 참가자 수가 1이면 승리 처리 (추가)
   ====================== */
const onClickCombined = () => {
  // 1) 입력 비어있음 검사 (원래)
  if (!newWord || newWord.trim() === '') {
    input.value = '';
    input.focus();
    return;
  }

  // 2) 정규화: 앞뒤 공백 제거 (추가)
  // (원하면 toLowerCase()로 대소문자 통일 가능)
  const candidate = newWord.trim();

  // 현재 차례 참가자의 참조(추가)
  const player = players[currentIndex];

  // 안전: 만약 현재 플레이어가 비활성(이미 탈락) 상태면 즉시 다음 활성 참가자로 이동
  if (!player.active) {
    currentIndex = getNextActiveIndex(currentIndex);
    orderEl.textContent = (currentIndex + 1).toString();
    input.value = '';
    input.focus();
    return;
  }

  /* ---------- 중복 검사 ---------- */
  if (usedWords.has(candidate)) {
    // [추가] 중복 단어 입력 => 해당 참가자 탈락
    alert(`${player.name}님은 이미 사용된 단어를 입력하여 탈락했습니다.`);
    player.active = false; // 탈락 처리

    // 탈락 후 남은 참가자 체크
    if (checkForWinnerAndFinish()) return; // 게임 끝났으면 종료

    // 다음 활성 참가자로 차례 이동
    currentIndex = getNextActiveIndex(currentIndex);
    orderEl.textContent = (currentIndex + 1).toString();

    // 입력창 초기화 및 포커스
    input.value = '';
    input.focus();
    return; // 함수 종료 (탈락으로 더이상 진행 안함)
  }

  /* ---------- 끝말잇기 규칙 검사 (원래 로직) ---------- */
  // 원래 조건: 제시어가 비어있거나, 이전 단어의 마지막 글자 === 새 단어의 첫 글자
  // (문법 수정 포함: newWord(0) -> candidate[0])
  if (!word || word.at(-1) === candidate[0]) {
    // [원래] 단어 수용: 화면에 표시
    word = candidate;
    wordEl.textContent = word;

    // [추가] 사용된 단어 목록에 현재 단어 추가 (중복 방지용)
    usedWords.add(candidate);

    // [원래] 차례 계산: 다음 참가자에게 넘어감
    // 단, 다음 참가자는 반드시 '활성'인 참가자로 지정
    currentIndex = getNextActiveIndex(currentIndex);
    orderEl.textContent = (currentIndex + 1).toString();
  } else {
    // [추가] 끝말잇기 규칙 위반 => 해당 참가자 탈락
    alert(`${player.name}님은 규칙을 위반하여 탈락했습니다.`);
    player.active = false; // 탈락 처리

    // 탈락 후 남은 참가자 체크
    if (checkForWinnerAndFinish()) return; // 게임 끝났으면 종료

    // 다음 활성 참가자로 차례 이동
    currentIndex = getNextActiveIndex(currentIndex);
    orderEl.textContent = (currentIndex + 1).toString();
  }

  // [원래] 마무리: 입력창 초기화 및 포커스
  input.value = '';
  input.focus();
};

/* ======================
   이벤트 리스너 등록 (원래 코드와 동일한 방식)
   ====================== */
input.addEventListener('input', onInput);
button.addEventListener('click', onClickCombined);

/* ======================
   (선택) 디버그: 현재 참가자 상태를 콘솔로 출력하고 싶을 때 사용
   // console.log(players);
   // console.log(Array.from(usedWords));
   ====================== */
