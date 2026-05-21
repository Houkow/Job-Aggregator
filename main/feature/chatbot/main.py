"""
Point d'entrée FastAPI pour le chatbot Jobby.
Lancé en parallèle du backend Node.js sur le port 5000.

Le backend Node.js (Express) proxy les requêtes /api/chatbot
vers ce serveur Python via http://localhost:5001/chatbot.

Lancement : uvicorn main:app --host 0.0.0.0 --port 5000 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from feature.chatbot.chatbot import ask_chatbot, extract_filters, enough_information
from feature.chatbot.search import search_jobs, format_jobs_for_response, build_explorer_url

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
    # 1. Reconstruction du texte de la conversation
    conversation_text = ""
    for msg in request.history:
        role = "Utilisateur" if msg.get("role") == "user" else "Assistant"
        conversation_text += f"{role}: {msg.get('content', '')}\n"
    conversation_text += f"Utilisateur: {request.message}"

    # 2. Extraction des filtres par l'IA
    filters = extract_filters(conversation_text)

    # 3. Génération de la réponse textuelle de Jobby
    reply = ask_chatbot(request.message, request.history)

    # 4. LA SEULE CONDITION DE REDIRECTION : Le bot a dit la phrase clé suite au "oui" de l'utilisateur
    bot_veut_rediriger = "lancement de la recherche" in reply.lower()

    if bot_veut_rediriger:
        # Sécurité : On s'assure que les filtres essentiels sont là pour l'URL
        if not filters.get("job_type"): 
            filters["job_type"] = "informatique"
        if not filters.get("location"): 
            filters["location"] = "Paris"

        rows = search_jobs(filters)
        offers = format_jobs_for_response(rows)
        url = build_explorer_url(filters)

        print(f"--- REDIRECTION CONFIRMÉE PAR L'UTILISATEUR --- URL: {url}")

        return {
            "reply": reply,
            "redirect": True,
            "url": url,
            "offers": offers,
            "filters": filters
        }

    # Si le mot-clé n'est pas là, on reste sur le chat (il a proposé le choix, ou l'utilisateur donne un salaire)
    return {
        "reply": reply,
        "redirect": False,
        "offers": [],
        "filters": filters
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot"}