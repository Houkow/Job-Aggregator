import requests
import time
from clean import clean_job
from save import save_jobs

API_KEY = "0f2e5f34-0650-4d0c-a684-b9d9e9a4c956"
BASE_URL = "https://epi-api.welovedevs.com/v1"
PAGE_SIZE = 100

def get_all_jobs():
    headers = {"X-API-Key": API_KEY}
    all_jobs = []
    page = 0
    while True:
        params = {"page": page, "size": PAGE_SIZE}
        response = requests.get(BASE_URL, headers=headers, params=params, timeout=10)
        if response.status_code == 429:
            print("Rate limit atteint, on attend 2s...")
            time.sleep(2)
            continue
        if response.status_code != 200:
            print(f"Erreur {response.status_code} : {response.text}")
            break
        data = response.json()
        total_count = data.get("totalCount", 0)
        jobs = data.get("values", [])
        if not jobs:
            break
        all_jobs.extend(jobs)
        print(f"Page {page} → {len(all_jobs)}/{total_count} offres récupérées")
        if len(all_jobs) >= total_count:
            break
        page += 1
        time.sleep(1)
    return all_jobs

if __name__ == "__main__":
    jobs = get_all_jobs()
    print(f"\nTotal offres récupérées : {len(jobs)}")
    cleaned_jobs = [clean_job(job) for job in jobs]
    save_jobs(cleaned_jobs)