/* ======================
   상수 및 DOM 참조 (원래 코드)
   ====================== */
const number = Number(prompt('몇 명이 참가하나요?'));
const input = document.querySelector('input');
const button = document.querySelector('button');
const wordEl = document.querySelector('#word');
const orderEl = document.querySelector('#order');

/* ======================
   추가 데이터 구조 (추가 기능)
   - usedWords: 이미 사용된 단어를 저장하는 집합
   ====================== */
const usedWords = new Set(); // <-- 추가: 사용된 단어들을 저장 (중복 검사용)

/* ======================
   상태 변수 (원래 코드)
   ====================== */
let newWord; // input 이벤트로부터 들어오는 현재 입력값
let word;    // 현재 제시어(마지막으로 수용된 단어)

/* ======================
   입력 이벤트(원래 코드)
   - 사용자가 입력창에 타이핑하면 newWord에 값 저장
   ====================== */
const onInput = function (event) {
  newWord = event.target.value;
};

/* ======================
   합쳐진 클릭 핸들러 (원래 로직 유지 + 중복 검사 추가)
   - 설명:
   * 1) 빈 입력 체크 (기존과 동일한 UX 유지)
   * 2) 중복 체크 (새로 추가된 기능)
   * 3) 끝말잇기 규칙 검사 (원래 로직; 단, 문법 오류 수정: newWord(0) -> newWord[0])
   * 4) 단어 수용 시 usedWords에 추가 (추가 기능)
   * 5) 차례 계산은 원래 로직과 동일
   ====================== */
const onClickCombined = () => {
  // 1) 입력 비어있음 검사 (기존과 동일)
  if (!newWord || newWord.trim() === '') {
    input.value = '';
    input.focus();
    return;
  }

  // 정규화: 앞뒤 공백 제거 (비교/저장에 일관성 주기 위함)
  // (선택) 대소문자 통일이 필요하면 toLowerCase() 추가 가능
  const candidate = newWord.trim();

  // 2) 중복 검사: usedWords에 이미 있는지 확인 (추가 기능)
  if (usedWords.has(candidate)) {
    alert('이미 사용된 단어입니다. 다른 단어를 입력하세요.');
    input.value = '';
    input.focus();
    return; // 더 이상 진행하지 않음
  }

  // 3) 끝말잇기 규칙 검사 및 기존 로직 수행
  //    (원래 코드의 논리와 동일하되, 문법 오류였던 부분을 수정하여 사용)
  //    원래: if (!word || word.at(-1) === newWord(0)) { ... }
  //    수정: if (!word || word.at(-1) === candidate[0]) { ... }
  if (!word || word.at(-1) === candidate[0]) {
    // 단어 수용: 화면에 표시 (원래 로직)
    word = candidate;
    wordEl.textContent = word;

    // 4) 사용된 단어 목록에 현재 단어 추가 (추가 기능)
    usedWords.add(candidate);

    // 5) 차례 계산(원래 로직 그대로)
    const order = Number(orderEl.textContent);
    if (order + 1 > number) {
      orderEl.textContent = 1;
    } else {
      orderEl.textContent = order + 1;
    }
  } else {
    // 끝말잇기 규칙 위반 (원래 로직)
    alert('틀린 단어입니다.');
  }

  // 마무리: 입력창 초기화 및 포커스 (원래 코드)
  input.value = '';
  input.focus();
};

/* ======================
   이벤트 리스너 등록 (중복 제거)
   - 원래 코드처럼 여러 핸들러를 추가/제거하지 않고
     **한 번만** 통합 핸들러를 등록
   ====================== */
input.addEventListener('input', onInput);           // 원래 입력 이벤트
button.addEventListener('click', onClickCombined); // 통합 클릭 핸들러 (원본 기능 + 추가 기능)

/* ======================
   (선택) 디버그용: 콘솔에서 현재 usedWords 확인 가능
   console.log(Array.from(usedWords));
   ====================== */
