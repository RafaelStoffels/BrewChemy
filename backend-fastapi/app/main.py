from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .config import settings
from .routers import users
from .routers import equipments
from .routers import fermentables
from .routers import hops
from .routers import misc
from .routers import yeasts
from .routers import recipes

app = FastAPI(title="Brewchemy API")

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.JWT_SECRET,
    same_site="lax",
    https_only=False,
)

# CORS
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

# Routes
app.include_router(users.router)
app.include_router(equipments.router)
app.include_router(fermentables.router)
app.include_router(hops.router)
app.include_router(misc.router)
app.include_router(yeasts.router)
app.include_router(recipes.router)