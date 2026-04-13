import random

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from data.constraints import AUDIENCES, PROBLEMS, TECHS
from services.llm_service import stream_pitch


router = APIRouter(prefix="/api")


class PitchRequest(BaseModel):
    audience: str
    problem: str
    tech: str


@router.get("/constraints")
def get_constraints():
    return {
        "audiences": AUDIENCES,
        "problems": PROBLEMS,
        "techs": TECHS,
    }


@router.get("/spin")
def spin():
    return {
        "audience": random.choice(AUDIENCES),
        "problem": random.choice(PROBLEMS),
        "tech": random.choice(TECHS),
    }


@router.post("/generate-pitch")
def generate_pitch(req: PitchRequest):
    try:
        return StreamingResponse(
            stream_pitch(req.audience, req.problem, req.tech),
            media_type="text/plain",
            headers={
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "no-cache",
            },
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not reachable. Make sure Ollama is running and mistral:7b-instruct is loaded.",
        )
