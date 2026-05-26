from fastapi import APIRouter
from feature.ingest.api import run_ingest

router = APIRouter()

@router.post("/ingest")
def ingest():
    try:
        count = run_ingest()
        return {"message": f"Ingestion terminée : {count} offres importées"}
    except Exception as e:
        return {"message": f"Erreur : {str(e)}"}