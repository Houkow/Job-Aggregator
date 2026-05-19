import psycopg2
from dotenv import dotenv_values
import os

# Charge le .env du backend (chemin relatif depuis main/feature/chatbot/)
config = dotenv_values(
    os.path.join(os.path.dirname(__file__), "../../../backend/.env")
)


def get_connection():
    return psycopg2.connect(
        host=config.get("DB_HOST", "localhost"),
        port=config.get("DB_PORT", 5432),
        dbname=config.get("DB_NAME", "jobdb"),
        user=config.get("DB_USER", "postgres"),
        password=config.get("DB_PASSWORD", "postgres"),
    )


def search_jobs(filters: dict) -> list:
    """
    Recherche des offres en BDD selon les filtres extraits par le chatbot.
    Retourne une liste de tuples (id, title, company_name, formatted_places, contract_types)
    """
    query = """
        SELECT id, title, company_name, formatted_places, contract_types
        FROM offers
        WHERE 1=1
    """
    params = []

    if filters.get("location"):
        query += " AND formatted_places ILIKE %s"
        params.append(f"%{filters['location']}%")

    if filters.get("contract_type"):
        query += " AND %s = ANY(contract_types)"
        params.append(filters["contract_type"])

    if filters.get("salary_min"):
        query += " AND salary_max >= %s"
        params.append(int(filters["salary_min"]))

    if filters.get("job_type"):
        query += " AND (title ILIKE %s OR profession ILIKE %s)"
        keyword = f"%{filters['job_type']}%"
        params.extend([keyword, keyword])

    query += " ORDER BY publish_date DESC LIMIT 5"

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        print(f"[search_jobs] Erreur BDD : {e}")
        return []


def format_jobs_for_response(rows: list) -> list:
    """
    Convertit les tuples BDD en liste de dicts pour la réponse JSON.
    """
    results = []
    for row in rows:
        offer_id, title, company_name, formatted_places, contract_types = row
        results.append({
            "id": offer_id,
            "title": title,
            "company": company_name,
            "location": formatted_places,
            "contractType": contract_types[0] if contract_types else None,
        })
    return results


def build_explorer_url(filters: dict) -> str:
    """
    Construit l'URL de redirection vers la page /explorer
    avec les query params correspondant aux filtres détectés.

    Mapping :
      job_type      → q             (barre de recherche texte)
      location      → location
      contract_type → contract      (valeur exacte : CDI, Stage, etc.)
      salary_min    → salary_min
      experience    → experience
    """
    params = []

    if filters.get("job_type"):
        params.append(f"q={filters['job_type']}")

    if filters.get("location"):
        params.append(f"location={filters['location']}")

    if filters.get("contract_type"):
        params.append(f"contract={filters['contract_type']}")

    if filters.get("salary_min"):
        params.append(f"salary_min={filters['salary_min']}")

    if filters.get("experience"):
        params.append(f"experience={filters['experience']}")

    if params:
        return "/explorer?" + "&".join(params)

    return "/explorer"