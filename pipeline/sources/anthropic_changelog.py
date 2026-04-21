import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from typing import List, Dict

CHANGELOG_URL = "https://www.anthropic.com/changelog"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; keepupwithclaude-bot/1.0)"}


def fetch_anthropic_changelog() -> List[Dict]:
    try:
        response = requests.get(CHANGELOG_URL, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch Anthropic changelog: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    items = []

    # Anthropic changelog entries are typically in article or section tags
    entries = soup.find_all("article") or soup.find_all(attrs={"data-testid": lambda v: v and "changelog" in v.lower()})

    # Fallback: find any <a> tags that look like changelog links
    if not entries:
        entries = soup.select("a[href*='/changelog/']")
        for link in entries:
            url = link.get("href", "")
            if not url.startswith("http"):
                url = f"https://www.anthropic.com{url}"
            title = link.get_text(strip=True)
            if title:
                items.append({
                    "source": "anthropic_changelog",
                    "url": url,
                    "original_title": title,
                    "content": title,
                    "content_date": datetime.now(timezone.utc).isoformat(),
                })
        return items

    for entry in entries:
        title_el = entry.find(["h1", "h2", "h3"])
        link_el = entry.find("a")
        content_el = entry.find("p")

        if not title_el or not link_el:
            continue

        url = link_el.get("href", "")
        if not url.startswith("http"):
            url = f"https://www.anthropic.com{url}"

        items.append({
            "source": "anthropic_changelog",
            "url": url,
            "original_title": title_el.get_text(strip=True),
            "content": content_el.get_text(strip=True) if content_el else "",
            "content_date": datetime.now(timezone.utc).isoformat(),
        })

    return items
