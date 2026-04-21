import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from typing import List, Dict

NEWS_URL = "https://www.anthropic.com/news"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}


def fetch_anthropic_blog() -> List[Dict]:
    try:
        response = requests.get(NEWS_URL, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch Anthropic news: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    seen = set()
    items = []

    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if "/news/" not in href or href == "/news":
            continue

        url = f"https://www.anthropic.com{href}" if href.startswith("/") else href
        if url in seen:
            continue
        seen.add(url)

        text = a.get_text(separator=" ", strip=True)
        if len(text) < 10:
            continue

        items.append({
            "source": "anthropic_blog",
            "url": url,
            "original_title": text[:200],
            "content": text,
            "content_date": datetime.now(timezone.utc).isoformat(),
        })

    return items[:15]
