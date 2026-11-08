# FOC Backend

FastAPI + SQLAlchemy (async) + Alembic.

## Setup

```bash
cd backend
uv sync --group dev
cp ../.env.example ../.env
```

## Run

```bash
uv run backend
# or
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `GET /api/health`

## Migrations

```bash
uv run alembic revision --autogenerate -m "message"
uv run alembic upgrade head
```

## Tests

```bash
uv run pytest
```
