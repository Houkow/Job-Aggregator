"""
Point d'entrée FastAPI pour le chatbot Jobby.
Lancé en parallèle du backend Node.js sur le port 5000.

Le backend Node.js (Express) proxy les requêtes /api/chatbot
vers ce serveur Python via http://localhost:5000/chatbot.

Lancement : uvicorn main:app --host 0.0.0.0 --port 5000 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chatbot import ask_chatbot, extract_filters, enough_information
from search import search_jobs, format_jobs_for_response, build_explorer_url

app = FastAPI(title="Jobby Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/chatbot")
def chatbot_endpoint(request: ChatRequest):
    """
    Endpoint principal du chatbot.

    Flux :
    1. Extraire les filtres depuis la conversation complète
    2. Si assez d'infos → chercher des offres + construire l'URL de redirection
    3. Sinon → continuer la conversation
    """

    # Reconstruction de la conversation complète pour l'extraction
    conversation_text = ""
    for msg in request.history:
        role = "Utilisateur" if msg.get("role") == "user" else "Assistant"
        conversation_text += f"{role}: {msg.get('content', '')}\n"
    conversation_text += f"Utilisateur: {request.message}"

    # Extraction des filtres
    filters = extract_filters(conversation_text)

    # Assez d'infos → on redirige vers l'explorer
    if enough_information(filters):
        rows = search_jobs(filters)
        offers = format_jobs_for_response(rows)
        url = build_explorer_url(filters)

        if offers:
            reply = (
                f"Parfait, j'ai trouvé {len(offers)} offre(s) qui correspondent "
                f"à votre recherche ! Je vous redirige vers les résultats..."
            )
        else:
            reply = (
                "Je n'ai pas trouvé d'offres exactement correspondantes, "
                "mais voici les offres les plus proches de vos critères."
            )

        return {
            "reply": reply,
            "redirect": True,
            "url": url,
            "offers": offers,
            "filters": filters
        }

    # Pas assez d'infos → on continue la conversation
    reply = ask_chatbot(request.message, request.history)

    return {
        "reply": reply,
        "redirect": False,
        "offers": [],
        "filters": filters
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot"}