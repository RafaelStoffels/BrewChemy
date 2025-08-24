# app/openai_routes.py
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from AuthTokenVerifier import token_required  # seu decorator atual
import openai
import os
from dotenv import load_dotenv

# ---------- Adaptação do token_required para FastAPI ----------
# Se seu token_required já valida o token a partir do header e
# injeta o user_id, criamos um "adapter" simples:
def get_current_user_id(request: Request) -> str:
    """
    Adapter para usar o token_required como dependency do FastAPI.
    Espera que o decorator token_required(func) chame func(user_id, *args, **kwargs).
    """
    # Monta uma função dummy compatível com o decorator para capturar o user_id
    user_id_holder = {"value": None}

    @token_required
    def _capture(current_user_id):
        user_id_holder["value"] = current_user_id
        return True

    # Executa a função decorada (irá validar o token presente no request)
    try:
        # Passamos nada além do necessário; se seu decorator usa request context global,
        # ele deve conseguir ler os headers (ex.: Authorization) do framework subjacente.
        _capture()  # apenas para acionar a validação
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    if not user_id_holder["value"]:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    return user_id_holder["value"]

# ---------- Pydantic Schemas ----------
class RecipeMessage(BaseModel):
    message: str

# ---------- OpenAI wrapper ----------
class ChatGPT:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def get_response(self, message: str) -> str:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You will objectively critique the recipe in three lines."},
                    {"role": "user", "content": message},
                ],
            )
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error communicating with ChatGPT: {str(e)}"

# ---------- Router ----------
def get_openai_router() -> APIRouter:
    router = APIRouter(prefix="/openAI", tags=["openAI"])

    @router.post("")
    def openai_endpoint(
        payload: RecipeMessage,
        current_user_id: str = Depends(get_current_user_id),
    ):
        if not payload.message:
            raise HTTPException(status_code=400, detail="No recipe provided")

        try:
            load_dotenv()
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

            chatgpt = ChatGPT(api_key=api_key)
            chat_response = chatgpt.get_response(payload.message)
            return {"response": chat_response}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return router
