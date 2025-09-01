# app/routers/openai.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from .users import token_required
from ..config import settings

from dotenv import load_dotenv
from openai import AsyncOpenAI, APIConnectionError, APIStatusError

router = APIRouter(prefix="/api/openAI", tags=["openAI"])

load_dotenv()

class RecipeMessage(BaseModel):
    message: str

class ChatGPTAsync:
    def __init__(self, api_key: str | None):
        self.client = AsyncOpenAI(api_key=api_key)

    async def get_response(self, message: str, model: str) -> str:
        try:
            resp = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You will objectively critique the recipe in three lines.",
                    },
                    {"role": "user", "content": message},
                ],
            )
            return resp.choices[0].message.content or ""
        except (APIConnectionError, APIStatusError) as e:
            raise HTTPException(status_code=502, detail=f"{e}") from e
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Unexpected error calling OpenAI: {e}") from e


@router.post("")
async def openai_endpoint(
    payload: RecipeMessage,
    current_user_id: int = Depends(token_required),
):
    if not payload.message:
        raise HTTPException(status_code=400, detail="No recipe provided")

    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    model = "gpt-3.5-turbo"

    chatgpt = ChatGPTAsync(api_key=api_key)
    chat_response = await chatgpt.get_response(payload.message, model=model)
    return {"response": chat_response}
