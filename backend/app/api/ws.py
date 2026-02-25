import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select

from app.database import async_session
from app.models.user import User
from app.services.auth_service import decode_token
from app.services.gamification_realtime import gamification_ws_manager

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/gamification")
async def gamification_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        auth_header = websocket.headers.get("authorization") or ""
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        user_id = uuid.UUID(str(payload.get("sub")))
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    async with async_session() as db:
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    await gamification_ws_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data.strip().lower() == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        gamification_ws_manager.disconnect(user_id, websocket)
    except Exception:
        gamification_ws_manager.disconnect(user_id, websocket)
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
