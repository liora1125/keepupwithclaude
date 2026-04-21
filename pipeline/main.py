import os
import sys
from dotenv import load_dotenv

load_dotenv()

from sources.anthropic_blog import fetch_anthropic_blog
from sources.anthropic_changelog import fetch_anthropic_changelog
from sources.twitter import fetch_twitter
from sources.youtube import fetch_youtube
from sources.producthunt import fetch_producthunt
from sources.github_source import fetch_github
from sources.newsletters import fetch_newsletters
from scorer import score_and_summarise
from database import get_existing_urls, save_items, auto_publish_ready_items

SCORE_THRESHOLD = 5
PER_SOURCE_CAP = 10  # max items scored per source per run

SOURCES = [
    fetch_anthropic_blog,
    fetch_anthropic_changelog,
    fetch_twitter,
    fetch_youtube,
    fetch_producthunt,
    fetch_github,
    fetch_newsletters,
]


def run():
    print("=== keepupwithclaude pipeline starting ===")

    # Step 1: publish items that have been queued for 20+ hours
    auto_publish_ready_items()

    # Step 2: fetch from all sources (capped per source)
    all_items = []
    for fetcher in SOURCES:
        try:
            items = fetcher()
            items = items[:PER_SOURCE_CAP]
            print(f"  {fetcher.__name__}: {len(items)} items fetched")
            all_items.extend(items)
        except Exception as e:
            print(f"  {fetcher.__name__}: ERROR — {e}")

    print(f"Total fetched: {len(all_items)}")

    # Step 3: deduplicate against existing database records
    existing_urls = get_existing_urls()
    new_items = [item for item in all_items if item.get("url") and item["url"] not in existing_urls]
    print(f"New items after deduplication: {len(new_items)}")

    if not new_items:
        print("Nothing new to process.")
        return

    # Step 4: score and summarise via Claude
    scored_items = []
    for item in new_items:
        result = score_and_summarise(item)
        if result and result.get("score", 0) >= SCORE_THRESHOLD:
            scored_items.append({**item, **result})
        else:
            score = result.get("score", "error") if result else "error"
            print(f"  Discarded (score={score}): {item.get('original_title', '')[:60]}")

    print(f"Items above threshold ({SCORE_THRESHOLD}): {len(scored_items)}")

    # Step 5: save to Supabase (published_at=NULL — auto-publishes after 20h)
    if scored_items:
        save_items(scored_items)

    print("=== Pipeline complete ===")


if __name__ == "__main__":
    run()
