import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from typing import List, Dict

CHANGELOG_URL = "https://docs.anthropic.com/changelog"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}


def fetch_anthropic_changelog() -> List[Dict]:
    try:
        response = requests.get(CHANGELOG_URL, headers=HEADERS, timeout=15, allow_redirects=True)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch Anthropic changelog: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    items = []
    seen = set()

    # Changelog entries are typically grouped by date with headings
    for heading in soup.find_all(["h1", "h2", "h3"]):
        title = heading.get_text(strip=True)
        if not title or len(title) < 5:
            continue

        # Get surrounding content
        content_parts = []
        for sibling in heading.find_next_siblings():
            if sibling.name in ["h1", "h2", "h3"]:
                break
            text = sibling.get_text(strip=True)
            if text:
                content_parts.append(text)

        content = " ".join(content_parts[:3])
        url = f"{response.url}#{title.lower().replace(' ', '-')}"

        if url in seen or not content:
            continue
        seen.add(url)

        items.append({
            "source": "anthropic_changelog",
            "url": url,
            "original_title": title,
            "content": content[:500],
            "content_date": datetime.now(timezone.utc).isoformat(),
        })

    return items[:10]
