## 2026-11-09

### 백엔드
- FastAPI 뼈대 구성: `src/backend/` 아래 `api/`, `core/`, `db/`, `models/`, `main.py`
- uv 의존성: FastAPI, SQLAlchemy async(`sqlalchemy[asyncio]`), asyncpg, Alembic, pydantic-settings (`pyproject.toml` / `uv.lock`)
- Alembic async 설정(`alembic/env.py`)과 `Settings.database_url` ↔ Compose `DATABASE_URL` 연동
- Compose `db`(Postgres 16 + healthcheck) / `backend` 서비스, Dockerfile로 이미지 빌드
- `GET /api/health` 엔드포인트와 `tests/test_health.py` 추가
- 해결: `sqlalchemy[asyncio]` 누락으로 생기던 greenlet 오류 → 의존성 추가 후 반영됨
- 확인: `docker compose up --build`로 `foc-db-1` Healthy·`foc-backend-1` Started, `alembic current`가 PostgreSQL에 정상 접속
- 미확인: `.env` 미설정으로 DB가 시작되지 않던 문제의 직접 재현 로그 / 오늘 pytest 재실행 결과 / git 커밋(백엔드는 아직 untracked)

### 프론트엔드
- 2026-11-09 | [FE] | feat | Vite React-TS 프론트 뼈대·health 연결·Docker Compose frontend 서비스 추가 | 확인: npm run lint / tsc --noEmit / build, docker compose config 통과 | 남은 위험: docker compose up·브라우저·gen:api는 미실행, health 응답 타입은 OpenAPI 생성 전 임시 정의
