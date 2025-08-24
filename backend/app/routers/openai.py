# app/routers/openai.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .users import token_required
from openai import OpenAI
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/api/openAI", tags=["openAI"])


class RecipeMessage(BaseModel):
    message: str


class ChatGPT:
    def __init__(self, api_key: str | None):
        self.client = OpenAI(api_key=api_key)

    def get_response(self, message: str) -> str:
        try:
            resp = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You will objectively critique the recipe in three lines.",
                    },
                    {"role": "user", "content": message},
                ],
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            return f"Error communicating with ChatGPT: {e}"


@router.post("")  # POST /api/openAI
def openai_endpoint(
    payload: RecipeMessage,
    current_user_id: int = Depends(token_required),
):
    if not payload.message:
        raise HTTPException(status_code=400, detail="No recipe provided")

    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    chatgpt = ChatGPT(api_key=api_key)
    chat_response = chatgpt.get_response(payload.message)
    return {"response": chat_response}
