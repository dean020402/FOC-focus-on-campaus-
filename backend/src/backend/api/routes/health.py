from fastapi import APIRouter

from backend import __version__

router = APIRouter(tags=["health"])


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok", "version": __version__}
