import os
import requests
from datetime import datetime, timezone
from typing import List, Dict

APIFY_BASE = "https://api.apify.com/v2"
ACTOR_ID = "apidojo/tweet-scraper"

SEARCH_QUERIES = [
    "Claude Anthropic workflow",
    "Claude AI use case",
    "Anthropic Claude update",
]


def fetch_twitter() -> List[Dict]:
    api_key = os.environ.get("APIFY_API_KEY")
    if not api_key:
        print("No Apify API key — skipping Twitter source")
        return []

    items = []

    for query in SEARCH_QUERIES:
        try:
            run_response = requests.post(
                f"{APIFY_BASE}/acts/{ACTOR_ID}/run-sync-get-dataset-items",
                params={"token": api_key},
                json={
                    "searchTerms": [query],
                    "maxItems": 10,
                    "tweetLanguage": "en",
                },
                timeout=120,
            )
            run_response.raise_for_status()
            tweets = run_response.json()

            for tweet in tweets:
                url = tweet.get("url") or tweet.get("tweetUrl", "")
                text = tweet.get("text") or tweet.get("full_text", "")
                created_at = tweet.get("createdAt") or tweet.get("created_at", "")

                if not url or not text:
                    continue

                items.append({
                    "source": "twitter",
                    "url": url,
                    "original_title": text[:120] + ("..." if len(text) > 120 else ""),
                    "content": text,
                    "content_date": created_at or datetime.now(timezone.utc).isoformat(),
                })

        except Exception as e:
            print(f"Twitter fetch error for '{query}': {e}")

    return items
