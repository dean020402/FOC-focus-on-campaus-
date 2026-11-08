# backend/AGENTS.md — 백엔드 규약

`backend/` 폴더에서 작업할 때 적용되는 규칙입니다. 공통 규칙(기본 원칙, 작업 기록, 협업, Git 등)은 루트 `AGENTS.md`를 따릅니다.
`frontend/` 폴더는 수정하지 않습니다.

---

## 1. 기술 스택

| 영역 | 기술 |
| --- | --- |
| 언어 / 프레임워크 | Python 3.12, FastAPI |
| 검증 / 설정 | Pydantic v2, pydantic-settings |
| ORM / 마이그레이션 | SQLAlchemy 2.0, Alembic |
| DB | PostgreSQL |
| AI | Grok API (xAI) — 서버에서만 호출 |
| 품질 도구 | ruff (린트·포맷), mypy, pytest |
| 패키지 관리 | 기본은 `uv`. 이미 lockfile이 있으면 그것을 따르고 임의로 바꾸지 않는다 |

## 2. 자주 쓰는 명령어

명령어를 추측하지 말고 아래를 사용한다. 실제와 다르면 이 섹션을 먼저 고친다.

| 목적 | 명령어 |
| --- | --- |
| 전체 실행 | `docker compose up` |
| 린트 / 포맷 / 타입 | `ruff check .` / `ruff format .` / `mypy .` |
| 테스트 | `pytest` |
| 마이그레이션 생성 | `alembic revision --autogenerate -m "메시지"` |
| 마이그레이션 적용 | `alembic upgrade head` |

## 3. 폴더 구조

```
src/backend/
  main.py              # FastAPI 앱 생성, 라우터 등록 (엔트리: backend.main:app)
  core/                # 설정, 보안, 공통 예외, 로깅
  db/                  # 세션, Base
  models/              # SQLAlchemy 모델
  api/                 # 라우터 집합 (routes/: health 등)
  schemas/             # (필요할 때 추가) Pydantic 요청/응답 스키마
  services/            # (필요할 때 추가) 비즈니스 로직
  repositories/        # (필요할 때 추가) DB 접근 로직
  ai/                  # (필요할 때 추가) Grok 클라이언트, prompts/, 응답 검증
alembic/               # 마이그레이션
tests/
```

## 4. 코드 규칙

### FastAPI

- 계층을 지킨다: `router → service → repository`. 라우터에 비즈니스 로직이나 쿼리를 넣지 않는다.
- 모든 요청과 응답은 **Pydantic 스키마**로 정의한다 (`response_model` 지정). ORM 모델을 그대로 반환하지 않는다.
- 의존성(DB 세션, 현재 사용자 등)은 `Depends`로 주입한다. 전역 변수로 세션을 들고 있지 않는다.
- 에러는 `HTTPException` 또는 공통 예외로 던지고 응답 형식을 통일한다.
- 환경변수는 `pydantic-settings`의 `Settings`로만 읽는다. `os.environ`을 직접 쓰지 않는다.
- **sync/async를 섞지 않는다.** 기본은 async 통일(`AsyncSession`, `asyncpg`, `httpx.AsyncClient`)이다. async 함수 안에서 블로킹 호출(`requests`, 동기 DB 호출)을 하지 않는다.
- 엔드포인트의 `summary`와 스키마 필드 설명을 채워 OpenAPI 문서가 프론트 개발자에게 읽히게 한다.

### Python 스타일

- 모든 함수에 **타입 힌트**를 쓴다. `Any`는 이유를 주석으로 남길 때만 허용한다.
- 함수는 한 가지 일만 하게 작게 쓰고, 이름은 동사로 시작한다 (`calculate_ranking_score`).
- 매직 넘버(가중치, 제한 횟수 등)는 상수 모듈로 분리한다.
- 변수와 함수는 `snake_case`, 클래스는 `PascalCase`, 상수는 `UPPER_SNAKE_CASE`.

### SQLAlchemy / Alembic

- 스키마 변경은 항상 **Alembic 마이그레이션**으로 남긴다. 자동 생성된 파일은 **내용을 검토한 뒤** 커밋한다.
- 이미 공유된 마이그레이션 파일은 수정하지 않고 새 마이그레이션을 추가한다.
- DB를 직접 수정하거나 `create_all()`로 운영 스키마를 만들지 않는다.
- 목록 조회에서 N+1이 생기지 않게 `selectinload`/`joinedload`를 적절히 쓴다.
- 랭킹처럼 자주 읽는 값은 평가가 생길 때 재계산해서 `RankingSnapshot`에 저장한다.

## 5. Grok API 사용 규칙

### 호출 원칙

- Grok는 **서버(`ai/`, 필요할 때 추가)에서만** 호출한다. 클라이언트에서 직접 호출하지 않는다.
- API 키는 `.env`의 `XAI_API_KEY`로 관리한다. 코드, 로그, 커밋, 에러 메시지에 키를 노출하지 않는다.
- 모델명과 엔드포인트는 환경변수(`GROK_MODEL`, `GROK_BASE_URL`)로 뺀다. 사용 가능한 모델과 요청 형식은 **xAI 공식 문서를 확인한 뒤** 구현하고, 기억에 의존해 추측하지 않는다.
- AI 호출은 `ai/` 한 곳에 모으고, 다른 모듈은 이 클라이언트만 사용한다.

### 안정성

- **타임아웃**을 반드시 설정한다 (기본 10초 이내).
- 실패·타임아웃·형식 오류 시 **점수 기반 추천으로 fallback**한다. AI가 죽어도 서비스는 동작해야 한다.
- 재시도는 최대 1~2회, 지수 백오프로 한다. 무한 재시도는 금지한다.
- 같은 상황(시간대, 카테고리, 후보 목록)의 결과는 짧은 TTL로 **캐싱**한다.
- 사용자당 호출 횟수를 제한해서 비용 폭주를 막는다.

### 입출력 설계

- AI에게 모든 걸 맡기지 않는다. 순서는 **규칙 필터 → 점수 계산 → Grok(최종 정렬과 추천 이유 생성)** 이며, Grok에는 압축된 후보 5~10개만 넘긴다.
- 응답은 **JSON으로 고정**해서 받고 **Pydantic으로 한 번 더 검증**한다 (존재하지 않는 장소 ID, 빈 값은 버린다). 검증 실패 시 fallback 한다.
- 프롬프트는 `ai/prompts/` 아래 별도 파일로 관리하고, 변경 시 이유를 커밋에 남긴다.
- 추천 이유는 **DB에 있는 사실**(영업 시간, 평점, 거리)에만 근거해야 한다. 없는 정보를 지어내지 않도록 프롬프트에 명시한다.

### 개인정보

- LLM에 보내는 데이터에서 이름, 이메일, 학번, 정확한 좌표 등 **식별 정보는 제외**한다. 위치는 "도서관 인근" 같은 구역 단위로만 쓴다.
- 사용자의 리뷰 원문을 외부로 보내기 전에 필요한 범위인지 확인한다.

## 6. 랭킹과 평가 규칙

- 점수 공식(`bayesian_avg`, 최근성, 리뷰 수 가중치)은 `services/ranking` 한 곳에서만 정의한다.
- 가중치 변경은 상수 수정과 변경 이유 기록으로 처리한다.
- 평가 어뷰징 방지: 계정당 장소별 하루 1회 평가, 학교 인증 계정만 평가 가능. 이 제약을 우회하는 코드를 만들지 않는다.

## 7. 백엔드 보안

- 사용자 입력은 항상 Pydantic으로 검증하고, 인증이 필요한 엔드포인트에는 의존성 기반 인증을 적용한다.
- CORS는 필요한 출처만 허용한다. `allow_origins=["*"]`를 운영에 남기지 않는다.
- SQL은 ORM 또는 파라미터 바인딩으로만 작성한다. 문자열 포매팅으로 쿼리를 만들지 않는다.

## 8. 실행 환경

- 컨테이너 시작 시 마이그레이션(`alembic upgrade head`)이 적용되도록 한다.
- 개발: `uvicorn backend.main:app --reload`, 배포: 워커 수 지정, 리로드 끔.

## 9. 테스트와 검증

- 새 기능에는 최소한 핵심 로직(랭킹 점수 계산, 공강 시간 계산, 추천 후보 필터)의 `pytest` 단위 테스트를 추가한다.
- API 테스트는 FastAPI 테스트 클라이언트(`httpx.AsyncClient` 또는 `TestClient`)로 작성한다.
- **Grok 호출은 테스트에서 목(mock)으로 대체한다.** 테스트가 실제 API를 호출하거나 비용을 쓰지 않게 한다.
- 변경 후 `ruff check`, `ruff format --check`, `mypy`, `pytest`가 통과하는지 확인한다. 실행하지 못했다면 그 사실을 솔직히 말한다.

## 10. 백엔드에서 하지 말아야 할 것

- 확인 없는 마이그레이션 파일 수정/삭제
- 프론트를 깨뜨리는 API 스키마 변경을 승인 없이 진행
- async 함수 안에서 블로킹 호출 사용
- Grok 응답을 검증 없이 그대로 사용자에게 반환
- 키나 비밀 값을 코드, 로그에 노출