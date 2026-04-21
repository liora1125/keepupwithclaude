import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keep Up With Claude",
  description: "The best Claude and Anthropic content, curated daily. Updates, workflows, tools, and real-world use cases — all in one place.",
  openGraph: {
    title: "Keep Up With Claude",
    description: "The best Claude and Anthropic content, curated daily.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-gray-900 text-lg tracking-tight">
              Keep Up With Claude
            </Link>
            <nav className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/feed" className="hover:text-gray-900 transition-colors">
                Feed
              </Link>
              <Link href="/submit" className="hover:text-gray-900 transition-colors">
                Submit
              </Link>
              <Link
                href="#newsletter"
                className="bg-brand text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                Subscribe
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-500">
          <p>Updated daily. Content curated and summarised by Claude.</p>
        </footer>
      </body>
    </html>
  );
}
