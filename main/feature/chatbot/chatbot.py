from openai import OpenAI
import json

client = OpenAI(
    api_key="lm-studio",
    base_url="http://127.0.0.1:1234"
)

MODEL = "lama3-8b-hikikomori-v0.3"

SYSTEM_PROMPT = """
Tu es Jobby, un assistant de recherche d'emploi.

Ton objectif :
- Comprendre quel type de poste l'utilisateur recherche
- Affiner progressivement les critères de recherche
- Aider en cas de doute sur une orientation ou un métier

Tu dois toujours répondre en français, de façon naturelle et concise.

Tu peux collecter les informations suivantes :
- Localisation (ville, région, remote)
- Type de contrat (CDI, CDD, Stage, Alternance, Freelance)
- Niveau d'expérience (junior, confirmé, senior)
- Prétentions salariales
- Métier ou domaine recherché

Quand tu as suffisamment d'informations, dis à l'utilisateur que tu vas
lui trouver des offres correspondantes.
"""

EXTRACT_PROMPT = """
Analyse la conversation et extrais les filtres de recherche d'emploi.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après,
sans balises markdown, sans commentaires.

Format attendu :
{
  "location": null,
  "contract_type": null,
  "experience": null,
  "salary_min": null,
  "job_type": null
}

Règles :
- location : ville ou région mentionnée (ex: "Paris", "Lyon", "remote")
- contract_type : exactement l'une de ces valeurs : "CDI", "CDD", "Stage", "Alternance", "Freelance" ou null
- experience : "junior", "confirme" ou "senior" ou null
- salary_min : nombre entier (salaire annuel brut en euros) ou null
- job_type : métier ou domaine (ex: "développeur React", "data scientist", "designer UX")
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
            temperature=0
        )

        raw = response.choices[0].message.content.strip()

        # Nettoyage au cas où le modèle ajoute des backticks
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