# MY ASSISTANT — 프로젝트 컨텍스트

## 앱 개요
React + Firebase 기반 단일 HTML 파일 웹앱.
배포: Netlify (`harmonious-axolotl-e1a1e3.netlify.app`)
GitHub push → Netlify 자동 배포.

## 파일 구조
```
my-assistant/
├── index.html   ← 앱 전체 (HTML + CSS + React JS 한 파일)
├── sw.js        ← Service Worker (타이머 완료 알림용)
└── CLAUDE.md    ← 이 파일
```

## 기술 스택
- React 18 (CDN, JSX 없음 — React.createElement() 방식)
- Firebase 10 (Auth + Firestore, CDN)
- 빌드 도구 없음, 번들러 없음 — 단일 HTML

## Firebase 설정
```js
projectId: "my-assisance-ver-2"
apiKey: "AIzaSyCWQHApG7JGVbIrc19Y6XFUqc-urFmPpKE"
authDomain: "my-assisance-ver-2.firebaseapp.com"
```
인증: Google 로그인 → Firestore에 사용자별 데이터 저장/불러오기.

## 클라우드 동기화 키 목록 (SYNC_KEYS)
```
todos, tidSeq, habits, hbSeq, habitLog, dailyProgress,
sharedEvs, evSeq, weekGoals, wgSeq, monthGoals, mgSeq,
projects, projSeq, ptaskSeq, projMemos, timerCats,
catSeq, stepSeq, darkMode, memoCategories, memoCatSeq,
memos, memoSeq, woops
```
Firestore에 push/pull할 때 위 키들만 localStorage에서 읽고 씀.
새 데이터를 추가하면 SYNC_KEYS에도 반드시 추가해야 함.

## 앱 구조 (탭)
### PLANNER 탭
- **DAILY**: 할 일(Todo) + 습관(Habit) 오늘 목록
- **CALENDAR**: Weekly / Monthly / Statistics 서브뷰
- **PROJECT**: 프로젝트별 태스크 + D-day

### TIMER 탭
- 단계별 커스텀 타이머 (뽀모도로 등)
- Service Worker 기반 완료 알림 지원

### MEMO 탭
- 카테고리별 메모 (제목 + 본문 + 태그 + 즐겨찾기)

### WOOP 탭
- 매일 아침 작성하는 WOOP (Wish/Outcome/Obstacle/Plan) 기록
- Oettingen의 멘탈 대조(mental contrasting) + If-then 실행계획 기법
- 날짜별 1개 기록, 연속 작성일(streak) 표시, 지난 기록 열람
- localStorage 키: `woops` = { "YYYY-MM-DD": {w, outcome, obstacle, ifPart, thenPart, ts} }

## 주요 데이터 구조
```js
// Todo
{ id, text, pri, done, memo, completedAt }
// pri: "r"|"o"|"y"|"g"|"b"|"p" (색상 우선순위)
// completedAt: "YYYY-MM-DD" (done=true일 때만)

// Habit
{ id, name, icon, days, time, allday, color }
// days: [0~6] (일요일=0)

// Project
{ id, name, icon, targetDate, desc, color, tasks, createdAt }
// tasks: [{ id, text, startDate, endDate, done, memo }]

// TimerCat
{ id, name, icon, steps }
// steps: [{ id, name, min, sec, color }]

// Memo
{ id, catId, title, body, tags, starred, createdAt }
```

## 최근 구현 이력
1. **Service Worker 알림** — `sw.js` 별도 파일, SHOW_NOTIFICATION 메시지 방식
2. **캘린더 격자 버그 수정** — `.cd:nth-child(8n)` (8컬럼 grid)
3. **자정 자동 할 일 숨김** — 완료된 todo는 영구 삭제 아닌 숨김 처리
   - `completedAt` 필드로 날짜 추적
   - `today` state + setTimeout으로 자정 자동 갱신
4. **우선순위 시스템** — 6색상 (r/o/y/g/b/p)

## 배포 워크플로우
```bash
git add .
git commit -m "작업 내용"
git push
# → Netlify가 자동 감지해서 배포 (1~2분)
```

## 코딩 규칙
- JSX 사용 불가 — 반드시 `React.createElement()` 방식
- 빌드/번들 없음 — 수정 후 바로 동작해야 함
- 코드 추가 시 문법 검증 필수 (`node --check`)
- 새 localStorage 키 추가 시 → SYNC_KEYS에도 추가
- 스타일은 `<style>` 블록 내 CSS 변수 시스템 사용 (`--lav`, `--t1`, `--s1` 등)

## 색상 변수
```css
--lav: #8878cc   /* 메인 보라 */
--t1: #24223a    /* 텍스트 기본 */
--t2: #8c8aac    /* 텍스트 서브 */
--t3: #c4c2d8    /* 텍스트 흐림 */
--s1: #ffffff    /* 카드 배경 */
--s2: #f7f5fd    /* 서브 배경 */
--shadow: ...    /* 그림자 */
```
다크모드: `body.dark { ... }` 블록에서 변수 오버라이드.
