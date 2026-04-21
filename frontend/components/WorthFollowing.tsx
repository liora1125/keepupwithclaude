import Link from "next/link";

type Follow = {
  name: string;
  handle?: string;
  description: string;
  url: string;
  type: "x" | "newsletter" | "youtube";
};

const FOLLOWS: Follow[] = [
  // X / Twitter
  {
    name: "Anthropic",
    handle: "@AnthropicAI",
    description: "Official Anthropic account — model releases, research, and announcements.",
    url: "https://x.com/AnthropicAI",
    type: "x",
  },
  {
    name: "Dario Amodei",
    handle: "@DarioAmodei",
    description: "Anthropic CEO. Posts on AI safety, Claude capabilities, and the future of AI.",
    url: "https://x.com/DarioAmodei",
    type: "x",
  },
  {
    name: "Alex Albert",
    handle: "@alexalbert__",
    description: "Head of Developer Relations at Anthropic. Shares Claude tips and real prompts.",
    url: "https://x.com/alexalbert__",
    type: "x",
  },
  {
    name: "Simon Willison",
    handle: "@simonw",
    description: "Prolific builder. Regularly publishes deep dives on Claude and AI tools.",
    url: "https://x.com/simonw",
    type: "x",
  },
  {
    name: "swyx",
    handle: "@swyx",
    description: "AI engineer and writer. Covers the Claude ecosystem and practical AI workflows.",
    url: "https://x.com/swyx",
    type: "x",
  },
  // Newsletters
  {
    name: "Ben's Bites",
    description: "Daily AI news digest — consistently the fastest signal on Claude updates.",
    url: "https://www.bensbites.com",
    type: "newsletter",
  },
  {
    name: "TLDR AI",
    description: "5-minute daily roundup of AI news including Anthropic announcements.",
    url: "https://tldr.tech/ai",
    type: "newsletter",
  },
  {
    name: "The Rundown AI",
    description: "Practical AI newsletter with step-by-step Claude tutorials and use cases.",
    url: "https://www.therundown.ai",
    type: "newsletter",
  },
  // YouTube
  {
    name: "Matt Wolfe",
    description: "Covers every major Claude release and compares models in plain English.",
    url: "https://www.youtube.com/@mreflow",
    type: "youtube",
  },
];

const TYPE_LABELS = {
  x: "X",
  newsletter: "Newsletter",
  youtube: "YouTube",
};

const TYPE_COLORS: Record<Follow["type"], string> = {
  x: "bg-gray-900 text-white",
  newsletter: "bg-blue-100 text-blue-700",
  youtube: "bg-red-100 text-red-700",
};

export default function WorthFollowing() {
  const byType = {
    x: FOLLOWS.filter((f) => f.type === "x"),
    newsletter: FOLLOWS.filter((f) => f.type === "newsletter"),
    youtube: FOLLOWS.filter((f) => f.type === "youtube"),
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Worth following</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["x", "newsletter", "youtube"] as Follow["type"][]).map((type) => (
          <div key={type}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {TYPE_LABELS[type]}
            </h3>
            <div className="flex flex-col gap-3">
              {byType[type].map((follow) => (
                <Link
                  key={follow.url}
                  href={follow.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{follow.name}</span>
                    {follow.handle && (
                      <span className="text-xs text-gray-400 shrink-0">{follow.handle}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{follow.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
