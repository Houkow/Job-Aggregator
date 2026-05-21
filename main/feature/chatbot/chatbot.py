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
1. Le type de contrat (CDI, CDD, Stage, Alternance) n'est PAS un domaine informatique ni un métier.
2. Notre site ne gère QUE l'informatique. L'utilisateur doit obligatoirement préciser un domaine informatique (ex: développement, IA, data, réseau) ou un poste (ex: développeur Python).

COMPORTEMENT SI LE MÉTIER OU LA VILLE EST MANQUANT (MÊME SI L'UTILISATEUR DIT OUI) :
Si l'utilisateur écrit "oui" mais qu'il n'a pas encore donné À LA FOIS son métier tech ET la ville dans laquelle il souhaite travailler, tu ne dois PAS valider la recherche. 
Demande-lui l'information qui manque (le poste ou la ville).

COMPORTEMENT DE PROPOSITION (MÉTIER TECH + VILLE ENFIN CONNUS) :
Uniquement quand tu as un vrai métier/domaine informatique ET une ville ou il souhaite travailler, propose STRICTEMENT le choix suivant sans lancer la recherche :
"J'ai assez d'informations pour vous rediriger vers des offres cohérentes. Souhaitez-vous voir les résultats dès maintenant, ou préférez-vous me donner plus de détails (contrat, salaire) ?"

COMPORTEMENT CRUCIAL DE VALIDATION (MÉTIER + VILLE CONNUS + L'UTILISATEUR CONFIRME) :
Si et seulement si tu connais déjà le métier ET la ville, et que l'utilisateur valide explicitement (ex: "oui", "vas-y"), réponds avec cette structure exacte :
"Parfait ! Je recherche des postes liés à [Métier informatique] dans la région [Nom de la région ou ville]. Lancement de la recherche..."
"""

EXTRACT_PROMPT = """
Analyse la conversation et extrais les filtres de recherche d'emploi sous forme d'un unique objet JSON valide.
Ne rajoute aucune explication textuelle avant ou après le JSON.

Format attendu :
{
  "location": null,
  "contract_type": null,
  "experience": null,
  "salary_min": null,
  "job_type": null
}

Règles :
- location : ville ou région mentionnée (ex: "Paris", "Lyon") ou null
- contract_type : exactement "CDI", "CDD", "Stage", "Alternance", "Freelance" ou null
- experience : "junior", "confirme", "senior" ou null
- salary_min : nombre entier ou null
- job_type : métier ou domaine informatique (ex: "développeur React", "intelligence artificielle") ou null
"""


def extract_filters(conversation: str) -> dict:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": EXTRACT_PROMPT},
                {"role": "user", "content": conversation}
            ],
            temperature=0
            # Suppression du response_format qui brisait l'exécution sur ton LM Studio
        )

        raw = response.choices[0].message.content.strip()

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
    score = 0
    if filters.get("job_type"): score += 1
    if filters.get("location"): score += 1
    if filters.get("contract_type"): score += 1
    return score >= 2


def ask_chatbot(message: str, history: list) -> str:
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