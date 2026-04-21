import os
import requests
from datetime import datetime, timezone
from typing import List, Dict

PRODUCTHUNT_API = "https://api.producthunt.com/v2/api/graphql"

QUERY = """
query {
  posts(order: NEWEST, first: 20, topic: "artificial-intelligence") {
    edges {
      node {
        id
        name
        tagline
        description
        url
        website
        votesCount
        createdAt
        thumbnail { url }
        topics { edges { node { name } } }
      }
    }
  }
}
"""

CLAUDE_KEYWORDS = ["claude", "anthropic", "llm", "ai assistant", "ai writing", "prompt"]


def fetch_producthunt() -> List[Dict]:
    token = os.environ.get("PRODUCT_HUNT_TOKEN")
    if not token:
        print("No Product Hunt token — skipping Product Hunt source")
        return []

    try:
        response = requests.post(
            PRODUCTHUNT_API,
            json={"query": QUERY},
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Product Hunt fetch error: {e}")
        return []

    items = []
    posts = data.get("data", {}).get("posts", {}).get("edges", [])

    for edge in posts:
        post = edge.get("node", {})
        name = post.get("name", "").lower()
        tagline = post.get("tagline", "").lower()
        description = post.get("description", "").lower()
        combined = f"{name} {tagline} {description}"

        if not any(kw in combined for kw in CLAUDE_KEYWORDS):
            continue

        items.append({
            "source": "producthunt",
            "url": post.get("url", ""),
            "original_title": post.get("name", ""),
            "content": f"{post.get('tagline', '')}. {post.get('description', '')}",
            "content_date": post.get("createdAt", datetime.now(timezone.utc).isoformat()),
            "image_url": post.get("thumbnail", {}).get("url") if post.get("thumbnail") else None,
        })

    return items
