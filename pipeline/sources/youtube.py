import os
import requests
from datetime import datetime, timezone
from typing import List, Dict

YOUTUBE_API = "https://www.googleapis.com/youtube/v3"
SEARCH_QUERIES = ["Claude Anthropic", "Claude AI tutorial", "Anthropic AI"]
MAX_RESULTS_PER_QUERY = 5


def fetch_youtube() -> List[Dict]:
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        print("No YouTube API key — skipping YouTube source")
        return []

    items = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        try:
            response = requests.get(
                f"{YOUTUBE_API}/search",
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "order": "date",
                    "maxResults": MAX_RESULTS_PER_QUERY,
                    "publishedAfter": _yesterday_iso(),
                    "relevanceLanguage": "en",
                    "key": api_key,
                },
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            for result in data.get("items", []):
                video_id = result["id"]["videoId"]
                if video_id in seen_ids:
                    continue
                seen_ids.add(video_id)

                snippet = result["snippet"]
                items.append({
                    "source": "youtube",
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "original_title": snippet.get("title", ""),
                    "content": snippet.get("description", ""),
                    "content_date": snippet.get("publishedAt", datetime.now(timezone.utc).isoformat()),
                    "image_url": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
                })

        except Exception as e:
            print(f"YouTube fetch error for '{query}': {e}")

    return items


def _yesterday_iso() -> str:
    from datetime import timedelta
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    return yesterday.strftime("%Y-%m-%dT%H:%M:%SZ")
