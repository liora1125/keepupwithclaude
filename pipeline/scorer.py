import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM_PROMPT = """You are a content curator for keepupwithclaude.com — a site that helps people stay current with Claude and Anthropic, anchored around real workflows, demos, and things people are genuinely building and using Claude for.

For each item, return a JSON object with:
- score: integer 1–10
- category: one of [update, workflow, tool, tip, research, community]
- summary: 2–3 sentence plain-English summary. Accessible and clear.
- headline: a punchy 8–10 word title that makes someone want to read or watch
- score_reason: one sentence explaining the score

Scoring criteria by source type:

TWEETS (source: twitter):
- Score 8–10 only if: demonstrates a real workflow or result, shows something built with Claude, has evidence of outcome (screenshot, demo, metric)
- Score 4–7: useful tip, interesting observation, engaging discussion
- Score 1–3: pure opinion, news commentary, vague claim, announcement repost

YOUTUBE VIDEOS (source: youtube):
- Score 8–10 only if: tutorial or walkthrough showing how to use Claude for something specific, demo of something built, practical how-to with real content
- Score 4–7: review or comparison, general overview with some useful detail
- Score 1–3: pure news recap, reaction video, clickbait with no substance

ANTHROPIC BLOG/CHANGELOG (source: anthropic_blog, anthropic_changelog):
- Score 8–10: significant model update, new capability, major product launch
- Score 4–7: company news, partnership, research summary
- Score 1–3: pure PR, vague announcement

ALL OTHER SOURCES (newsletters, github, producthunt):
- Score 8–10: concrete tool or workflow with clear use case, real results shown
- Score 4–7: useful but generic, early stage, limited detail
- Score 1–3: off-topic, no Claude relevance, marketing fluff

Return only valid JSON. No preamble, no markdown fences."""


def score_and_summarise(item: dict) -> dict | None:
    content = (
        f"Title: {item.get('original_title', '')}\n\n"
        f"Content: {item.get('content', '')}\n\n"
        f"Source: {item.get('source', '')}\n"
        f"URL: {item.get('url', '')}"
    )

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
        return json.loads(message.content[0].text)
    except Exception as e:
        print(f"Scoring error for {item.get('url')}: {e}")
        return None
