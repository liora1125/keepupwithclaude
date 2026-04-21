import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a content curator for keepupwithclaude.com — a site that helps people stay current with Claude and Anthropic, with a focus on real workflows, demos, and things people are actually building and doing with Claude.

For each item, return a JSON object with:
- score: integer 1–10
- category: one of [update, workflow, tool, tip, research, community]
- summary: 2–3 sentence plain-English summary. Accessible and clear.
- headline: a punchy 8–10 word title that makes someone want to read more
- score_reason: one sentence explaining the score

Score highly (8–10): real workflows with demonstrated outcomes, "I built X with Claude" demos, tutorials showing step-by-step Claude use, surprising or novel use cases with evidence
Score medium (4–7): useful tips, product announcements with clear impact, interesting community discussion
Score low (1–3): vague claims, pure opinion, news recaps with no practical angle, off-topic

Return only valid JSON. No preamble, no markdown fences.`;

type ScoredItem = {
  score: number;
  category: string;
  summary: string;
  headline: string;
  score_reason: string;
};

type RawItem = {
  url: string;
  source: string;
  original_title: string;
  content: string;
};

export async function scoreItem(item: RawItem): Promise<ScoredItem | null> {
  const prompt = `Title: ${item.original_title}\n\nContent: ${item.content}\n\nSource: ${item.source}\nURL: ${item.url}`;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (message.content[0] as { text: string }).text;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function fetchAndScore(url: string): Promise<(RawItem & ScoredItem) | null> {
  const raw = await fetchContent(url);
  if (!raw) return null;
  const scored = await scoreItem(raw);
  if (!scored) return null;
  return { ...raw, ...scored };
}

async function fetchContent(url: string): Promise<RawItem | null> {
  try {
    const youtubeId = extractYoutubeId(url);
    if (youtubeId) return fetchYoutube(youtubeId, url);

    if (url.includes("x.com") || url.includes("twitter.com")) {
      return fetchTweet(url);
    }

    return fetchGeneric(url);
  } catch {
    return null;
  }
}

async function fetchYoutube(videoId: string, url: string): Promise<RawItem | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${key}`
  );
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  return {
    url,
    source: "youtube",
    original_title: item.snippet.title,
    content: item.snippet.description?.slice(0, 1000) || "",
  };
}

async function fetchTweet(url: string): Promise<RawItem | null> {
  const og = await fetchOG(url);
  return {
    url,
    source: "twitter",
    original_title: og.title,
    content: og.description,
  };
}

async function fetchGeneric(url: string): Promise<RawItem | null> {
  const og = await fetchOG(url);
  const domain = new URL(url).hostname.replace("www.", "");
  return {
    url,
    source: domain,
    original_title: og.title,
    content: og.description,
  };
}

async function fetchOG(url: string): Promise<{ title: string; description: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; keepupwithclaude-bot/1.0)" },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();
  const title =
    html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i)?.[1] ||
    html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"/i)?.[1] ||
    html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
  const description =
    html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i)?.[1] ||
    html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"/i)?.[1] ||
    html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] || "";
  return { title, description };
}

function extractYoutubeId(url: string): string | null {
  const match =
    url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?]+)/);
  return match?.[1] || null;
}
