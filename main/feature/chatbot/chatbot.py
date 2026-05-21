import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key="lm-studio",
    base_url="http://host.docker.internal:1234/v1"
)

MODEL = "phi-4-mini-instruct"

SYSTEM_PROMPT = """
Tu es Jobby, un assistant virtuel pour un site de recherche d'emploi ENTIÈREMENT DÉDIÉ AUX MÉTIERS DE L'INFORMATIQUE ET DE LA TECH.

RÈGLES DE STYLE ABSOLUES :
- Fais des réponses TRÈS COURTES (1 à 2 phrases maximum). Pas de pavés.
- Ne pose JAMAIS plus d'UNE seule question à la fois.
- Sois naturel, pas de listes à puces.

RÈGLES MÉTIER ET SÉCURITÉ CRUCIALES :
1. Le type de contrat (CDI, CDD, Stage, Alternance) n'est PAS un domaine informatique.
2. Notre site ne gère QUE l'informatique. L'utilisateur doit obligatoirement préciser un domaine informatique (ex: développement, IA, data, réseau, design, produit) ou un poste (ex: développeur Python, DevOps).

COMPORTEMENT SI LE MÉTIER INFORMATIQUE EST MANQUANT :
Si l'utilisateur donne un contrat ou une ville mais pas de métier informatique précis, demande-lui poliment de clarifier son domaine ou poste dans la tech.
Exemple de mauvaise réponse utilisateur : "Je cherche un stage sur Paris"
Exemple de ta relance : "Je peux vous aider à trouver un stage sur Paris ! Quel est votre domaine ou poste dans l'informatique (développement, data, design...) ?"

COMPORTEMENT DE PROPOSITION (MÉTIER TECH + VILLE ENFIN CONNUS) :
Uniquement quand tu as un vrai métier/domaine informatique ET une ville, propose le choix :
"J'ai assez d'informations pour vous rediriger vers des offres cohérentes. Souhaitez-vous voir les résultats dès maintenant, ou préférez-vous me donner plus de détails (contrat, salaire) ?"

COMPORTEMENT CRUCIAL DE VALIDATION (L'UTILISATEUR DIT OUI / ACCEPTE) :
Si l'utilisateur valide (ex: "oui", "vas-y"), réponds avec cette structure exacte :
"Parfait ! Je recherche des postes liés à [Métier informatique] dans la région [Nom de la région ou ville]. Lancement de la recherche..."
"""

EXTRACT_PROMPT = """
Analyse la conversation et extrais les filtres de recherche d'emploi.

Réponds UNIQUEMENT avec un objet JSON valide.

Format attendu :
{
  "location": null,
  "contract_type": null,
  "experience": null,
  "salary_min": null,
  "job_type": null
}

Règles :
- location : ville ou région mentionnée (ex: "Paris", "Lyon", "remote") ou null
- contract_type : exactement l'une de ces valeurs : "CDI", "CDD", "Stage", "Alternance", "Freelance" ou null
- experience : "junior", "confirme" ou "senior" ou null
- salary_min : nombre entier ou null
- job_type : métier ou domaine (ex: "développeur React", "intelligence artificielle") ou null
"""


def extract_filters(conversation: str) -> dict:
    """
    Extrait les filtres de recherche depuis la conversation.
    Retourne un dict avec les clés : location, contract_type, experience, salary_min, job_type
    """
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": EXTRACT_PROMPT},
                {"role": "user", "content": conversation}
            ],
            temperature=0,
            # Force LM Studio à guider le modèle pour générer un JSON valide instantanément
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content.strip()

        # Nettoyage de sécurité au cas où des backticks markdown subsistent
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        return json.loads(raw)

    except Exception as e:
        print(f"[extract_filters] Erreur : {e}")
        return {
            "location": None,
            "contract_type": None,
            "experience": None,
            "salary_min": None,
            "job_type": None
        }


def enough_information(filters: dict) -> bool:
    """
    Retourne True si on a assez de critères pour lancer une recherche.
    Seuil : au moins 2 critères parmi job_type, location, contract_type.
    """
    score = 0

    if filters.get("job_type"):
        score += 1
    if filters.get("location"):
        score += 1
    if filters.get("contract_type"):
        score += 1

    return score >= 2


def ask_chatbot(message: str, history: list) -> str:
    """
    Envoie un message au chatbot avec l'historique de la conversation.
    history : liste de dicts {"role": "user"|"assistant", "content": "..."}
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.6
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"[ask_chatbot] Erreur : {e}")
        return "Désolé, je rencontre un problème technique. Veuillez réessayer."