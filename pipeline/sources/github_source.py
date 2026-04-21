import os
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Dict

GITHUB_API = "https://api.github.com"
SEARCH_QUERIES = ["claude anthropic", "claude-ai", "anthropic sdk"]
MAX_RESULTS_PER_QUERY = 5


def fetch_github() -> List[Dict]:
    token = os.environ.get("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    items = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        try:
            response = requests.get(
                f"{GITHUB_API}/search/repositories",
                params={
                    "q": f"{query} created:>{yesterday}",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": MAX_RESULTS_PER_QUERY,
                },
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            for repo in data.get("items", []):
                repo_id = repo["id"]
                if repo_id in seen_ids:
                    continue
                seen_ids.add(repo_id)

                items.append({
                    "source": "github",
                    "url": repo.get("html_url", ""),
                    "original_title": repo.get("full_name", ""),
                    "content": repo.get("description", "") or f"A GitHub repository: {repo.get('full_name', '')}",
                    "content_date": repo.get("created_at", datetime.now(timezone.utc).isoformat()),
                })

        except Exception as e:
            print(f"GitHub fetch error for '{query}': {e}")

    return items
