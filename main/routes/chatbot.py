from fastapi import APIRouter
from pydantic import BaseModel

from feature.chatbot.chatbot import (
    ask_chatbot,
    extract_filters,
    enough_information
)

from feature.chatbot.search import (
    search_jobs,
    build_explorer_url
)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list = []


@router.post("/chatbot")
def chatbot(request: ChatRequest):

    filters = extract_filters(
        str(request.history)
        + request.message
    )

    # assez d'infos → explorer
    if enough_information(filters):

        jobs = search_jobs(filters)

        if jobs:
            return {
                "reply":
                "J’ai trouvé des offres adaptées.",
                "redirect": True,
                "url": build_explorer_url(filters),
                "filters": filters
            }

    reply = ask_chatbot(
        request.message,
        request.history
    )

    return {
        "reply": reply,
        "redirect": False,
        "filters": filters
    }