import os
from datetime import datetime, timezone, timedelta
from supabase import create_client, Client

def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)


def get_existing_urls() -> set[str]:
    db = get_client()
    response = db.table("items").select("source_url").execute()
    return {row["source_url"] for row in response.data}


def save_items(items: list[dict]) -> None:
    db = get_client()
    rows = [
        {
            "source": item["source"],
            "source_url": item["url"],
            "original_title": item.get("original_title", ""),
            "headline": item.get("headline", ""),
            "summary": item.get("summary", ""),
            "category": item.get("category", ""),
            "score": item.get("score", 0),
            "score_reason": item.get("score_reason", ""),
            "content_date": item.get("content_date"),
            "image_url": item.get("image_url"),
            "published_at": None,
            "manually_hidden": False,
        }
        for item in items
    ]

    if rows:
        db.table("items").upsert(rows, on_conflict="source_url").execute()
        print(f"Saved {len(rows)} items to database")


def auto_publish_ready_items() -> None:
    """Publish items that have been in the queue for at least 20 hours."""
    db = get_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=20)).isoformat()

    response = (
        db.table("items")
        .update({"published_at": datetime.now(timezone.utc).isoformat()})
        .is_("published_at", "null")
        .eq("manually_hidden", False)
        .lt("created_at", cutoff)
        .execute()
    )
    print(f"Auto-published {len(response.data)} items")
