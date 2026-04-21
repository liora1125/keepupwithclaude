import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM_PROMPT = """You are a content curator for keepupwithclaude.com — a site that helps people stay current with Claude and Anthropic. The audience is anyone interested in Claude: casual users, professionals, enthusiasts. They want to know what's new, what people are building, and how to get more out of Claude.

For each item, return a JSON object with:
- score: integer 1–10
- category: one of [update, workflow, tool, tip, research, community]
- summary: 2–3 sentence plain-English summary. Accessible and clear. No unnecessary jargon.
- headline: a punchy 8–10 word title that makes someone want to read more
- score_reason: one sentence explaining the score

Score highly (8–10): real-world workflows with clear outcomes, significant Claude/Anthropic news, novel or surprising use cases, new model capabilities
Score medium (4–7): useful tips, general product news, interesting but not groundbreaking content
Score low (1–3): vague claims, marketing fluff, off-topic, no concrete detail

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
