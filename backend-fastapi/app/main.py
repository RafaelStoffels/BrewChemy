from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users

app = FastAPI(title="Brewchemy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# rotes
app.include_router(users.router)