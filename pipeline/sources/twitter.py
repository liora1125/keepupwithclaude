import os
import requests
from datetime import datetime, timezone
from typing import List, Dict

BASE_URL = "https://scrapebadger.com/v1/twitter/tweets/advanced_search"

SEARCH_QUERIES = [
    "Claude Anthropic workflow",
    "Claude AI use case",
    "Anthropic Claude update",
]


def fetch_twitter() -> List[Dict]:
    api_key = os.environ.get("SCRAPEBADGER_API_KEY")
    if not api_key:
        print("No ScrapeBadger API key — skipping Twitter source")
        return []

    items = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        try:
            response = requests.get(
                BASE_URL,
                params={"query": query, "query_type": "Latest", "count": 10},
                headers={"x-api-key": api_key},
                timeout=30,
            )
            response.raise_for_status()
            tweets = response.json().get("data", [])

            for tweet in tweets:
                tweet_id = tweet.get("id")
                if not tweet_id or tweet_id in seen_ids:
                    continue
                seen_ids.add(tweet_id)

                # Skip retweets — originals only
                if tweet.get("is_retweet"):
                    continue

                username = tweet.get("username", "")
                text = tweet.get("full_text") or tweet.get("text", "")
                url = f"https://x.com/{username}/status/{tweet_id}"

                items.append({
                    "source": "twitter",
                    "url": url,
                    "original_title": text[:120] + ("..." if len(text) > 120 else ""),
                    "content": text,
                    "content_date": _parse_date(tweet.get("created_at", "")),
                })

        except Exception as e:
            print(f"Twitter fetch error for '{query}': {e}")

    return items


def _parse_date(date_str: str) -> str:
    try:
        dt = datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
        return dt.isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()
