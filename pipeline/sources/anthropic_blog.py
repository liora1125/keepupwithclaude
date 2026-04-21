import feedparser
from datetime import datetime, timezone
from typing import List, Dict


FEED_URL = "https://www.anthropic.com/rss.xml"


def fetch_anthropic_blog() -> List[Dict]:
    feed = feedparser.parse(FEED_URL)
    items = []

    for entry in feed.entries:
        parsed_date = entry.get("published_parsed") or entry.get("updated_parsed")
        content = ""
        if entry.get("content"):
            content = entry.content[0].get("value", "")
        elif entry.get("summary"):
            content = entry.summary

        items.append({
            "source": "anthropic_blog",
            "url": entry.get("link", ""),
            "original_title": entry.get("title", ""),
            "content": content,
            "content_date": datetime(*parsed_date[:6], tzinfo=timezone.utc).isoformat() if parsed_date else datetime.now(timezone.utc).isoformat(),
        })

    return items
