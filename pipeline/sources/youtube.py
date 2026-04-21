import os
import requests
from datetime import datetime, timezone
from typing import List, Dict

YOUTUBE_SEARCH_API = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos"

# Queries targeting tutorials, demos, and real use cases — not news recaps
SEARCH_QUERIES = [
    "Claude AI tutorial workflow",
    "built with Claude Anthropic",
    "using Claude to automate",
    "Claude AI how I use",
]

MIN_VIEW_COUNT = 500


def fetch_youtube() -> List[Dict]:
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        print("No YouTube API key — skipping YouTube source")
        return []

    items = []
    seen_ids = set()

    for query in SEARCH_QUERIES:
        try:
            search_resp = requests.get(
                YOUTUBE_SEARCH_API,
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "order": "relevance",
                    "maxResults": 8,
                    "relevanceLanguage": "en",
                    "videoDuration": "medium",  # 4–20 min — filters out Shorts and podcasts
                    "key": api_key,
                },
                timeout=15,
            )
            search_resp.raise_for_status()
            results = search_resp.json().get("items", [])

            video_ids = [r["id"]["videoId"] for r in results if r["id"]["videoId"] not in seen_ids]
            if not video_ids:
                continue

            # Fetch view counts in one call
            stats_resp = requests.get(
                YOUTUBE_VIDEOS_API,
                params={"part": "statistics,snippet", "id": ",".join(video_ids), "key": api_key},
                timeout=15,
            )
            stats_resp.raise_for_status()
            video_data = {v["id"]: v for v in stats_resp.json().get("items", [])}

            for video_id in video_ids:
                if video_id in seen_ids:
                    continue

                video = video_data.get(video_id)
                if not video:
                    continue

                view_count = int(video.get("statistics", {}).get("viewCount", 0))
                if view_count < MIN_VIEW_COUNT:
                    continue

                seen_ids.add(video_id)
                snippet = video["snippet"]

                items.append({
                    "source": "youtube",
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "original_title": snippet.get("title", ""),
                    "content": snippet.get("description", "")[:800],
                    "content_date": snippet.get("publishedAt", datetime.now(timezone.utc).isoformat()),
                    "image_url": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
                })

        except Exception as e:
            print(f"YouTube fetch error for '{query}': {e}")

    return items
