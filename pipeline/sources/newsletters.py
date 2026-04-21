import feedparser
from datetime import datetime, timezone, timedelta
from typing import List, Dict

FEEDS = [
    {"name": "bensbites", "url": "https://www.bensbites.com/feed"},
    {"name": "tldr_ai", "url": "https://tldr.tech/ai/rss"},
    {"name": "therundown", "url": "https://www.therundown.ai/feed"},
]

CLAUDE_KEYWORDS = ["claude", "anthropic"]


def fetch_newsletters() -> List[Dict]:
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    items = []

    for feed_config in FEEDS:
        try:
            feed = feedparser.parse(feed_config["url"])
            for entry in feed.entries:
                title = entry.get("title", "").lower()
                summary = entry.get("summary", "").lower()

                if not any(kw in title or kw in summary for kw in CLAUDE_KEYWORDS):
                    continue

                parsed_date = entry.get("published_parsed") or entry.get("updated_parsed")
                if parsed_date:
                    entry_date = datetime(*parsed_date[:6], tzinfo=timezone.utc)
                    if entry_date < yesterday:
                        continue

                content = ""
                if entry.get("content"):
                    content = entry.content[0].get("value", "")
                elif entry.get("summary"):
                    content = entry.summary

                items.append({
                    "source": f"newsletter_{feed_config['name']}",
                    "url": entry.get("link", ""),
                    "original_title": entry.get("title", ""),
                    "content": content,
                    "content_date": entry_date.isoformat() if parsed_date else datetime.now(timezone.utc).isoformat(),
                })

        except Exception as e:
            print(f"Newsletter fetch error for {feed_config['name']}: {e}")

    return items
