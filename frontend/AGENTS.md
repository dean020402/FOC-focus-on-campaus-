# frontend/AGENTS.md — 프론트엔드 규약

`frontend/` 폴더에서 작업할 때 적용되는 규칙입니다. 공통 규칙(기본 원칙, 작업 기록, 협업, Git 등)은 루트 `AGENTS.md`를 따릅니다.
`backend/` 폴더는 수정하지 않습니다.

---

## 1. 기술 스택

| 영역 | 기술 |
| --- | --- |
| 언어 / 프레임워크 | TypeScript, React, Vite |
| 라우팅 / 서버 데이터 | React Router, TanStack Query |
| 스타일 | Tailwind CSS |
| API 타입 | `openapi-typescript` (FastAPI의 OpenAPI 스키마에서 생성) |
| 품질 도구 | ESLint, Prettier, Vitest + React Testing Library |
| 패키지 관리 | 기본은 `npm`. 이미 lockfile이 있으면 그것을 따르고 임의로 바꾸지 않는다 |

## 2. 자주 쓰는 명령어

명령어를 추측하지 말고 아래를 사용한다. 실제 스크립트 이름이 다르면 이 섹션을 먼저 고친다.

| 목적 | 명령어 |
| --- | --- |
| 개발 서버 | `npm run dev` |
| 빌드 | `npm run build` |
| 린트 / 타입 검사 | `npm run lint` / `npx tsc --noEmit` |
| 테스트 | `npm run test` |
| API 타입 생성 | `npm run gen:api` (없으면 `package.json`에 스크립트를 추가한다) |

## 3. 폴더 구조

```
src/
  main.tsx, App.tsx
  pages/           # 라우트 단위 화면 (Home, Ranking, PlaceDetail, Timetable, MyPage)
  features/        # 기능별 묶음 (recommendation, ranking, reviews, timetable)
  components/      # 재사용 UI (PlaceCard, RatingInput, EmptyState 등)
  api/             # API 클라이언트, 생성된 타입 (schema.d.ts)
  hooks/
  lib/             # 유틸, 상수
  styles/
```

## 4. 코드 규칙

### React / TypeScript

- 함수형 컴포넌트와 hooks만 쓴다. 컴포넌트는 `PascalCase`, 한 파일에 한 책임을 지킨다.
- `strict` 모드를 유지하고 `any`는 쓰지 않는다. 꼭 필요하면 이유를 주석으로 남긴다.
- 서버 데이터는 **TanStack Query**로 관리한다. 서버 데이터를 `useState`에 복사해 들고 있지 않는다. 전역 상태는 정말 필요할 때만 쓴다.
- 모든 API 호출은 `src/api/`를 거친다. 컴포넌트 안에서 `fetch`를 직접 쓰지 않는다.
- 포맷과 린트는 Prettier, ESLint를 따른다. 커밋 전에 통과시킨다.

### API 연동

- API 요청/응답 타입은 **백엔드 OpenAPI 스키마에서 생성**한 것만 쓴다. 손으로 중복 정의하지 않는다.
- 생성된 타입 파일(`schema.d.ts`)은 직접 수정하지 않는다. 백엔드 스키마가 바뀌면 다시 생성한다.
- 백엔드에 없는 필드나 엔드포인트를 임의로 가정하지 않는다. 필요한 변경은 "백엔드에 요청할 사항"으로 정리해 사용자에게 알린다.
- 백엔드가 준비되지 않은 API는 목 데이터로 개발하되, `src/api/` 계층 뒤에 둬서 나중에 교체하기 쉽게 한다.

### UI / UX

- **모바일 우선**(360~430px 기준)으로 만든다. 터치 영역은 최소 44px, 하단 탭 내비게이션을 기본으로 한다.
- 모든 화면에서 **로딩 / 에러 / 데이터 없음** 상태를 구현한다. AI 실패로 fallback 응답이 와도 화면이 깨지지 않아야 한다.
- 추천 카드의 **추천 이유**는 서버가 준 문장을 그대로 보여준다. 클라이언트에서 AI를 호출하거나 이유 문장을 만들지 않는다. 이유가 비어 있어도 카드는 정상 표시되어야 한다.
- 색상, 간격, 폰트는 Tailwind 설정(디자인 토큰)을 따른다. 임의의 색상 값을 하드코딩하지 않는다.
- 이미지에는 `alt`, 입력창에는 `label`을 붙이는 등 기본 접근성을 지킨다.
- 위치 정보는 사용자 동의 후에만 사용하고, 정확한 좌표가 아닌 캠퍼스 구역 단위로만 서버에 보낸다.

## 5. 프론트엔드 보안

- **프론트엔드 코드에는 비밀 값을 넣지 않는다.** `VITE_` 접두사 환경변수는 빌드 결과물에 그대로 노출되므로, `VITE_API_BASE_URL`처럼 공개되어도 되는 값만 쓴다. Grok 키는 절대 프론트에 두지 않는다.
- 사용자가 입력한 문자열(리뷰 등)을 렌더링할 때 `dangerouslySetInnerHTML`을 쓰지 않는다.
- 카카오맵 등 외부 SDK의 JS 키는 허용 도메인을 제한해서 사용한다.

## 6. 실행 환경

- 개발 중 Vite 개발 서버는 백엔드 API로 프록시해서 CORS 문제 없이 동작하게 한다.

## 7. 테스트와 검증

- **Vitest + React Testing Library**로 핵심 흐름(추천 카드 표시, 평가 제출, 로딩/에러 상태)을 테스트한다.
- API 호출은 테스트에서 목(mock)으로 대체한다.
- 변경 후 린트, 타입 검사(`tsc --noEmit`), 테스트, 빌드가 통과하는지 확인한다. 실행하지 못했다면 그 사실을 솔직히 말한다.

## 8. 프론트엔드에서 하지 말아야 할 것

- API 응답 타입을 손으로 중복 정의하거나 `any`로 덮기
- 생성된 API 타입 파일을 직접 수정하기
- `VITE_` 변수나 코드에 API 키 같은 비밀 값 넣기
- 로딩/에러/빈 상태 처리 없이 "정상 응답만 가정"하고 화면 만들기
- 컴포넌트 안에서 `fetch`를 직접 호출하기