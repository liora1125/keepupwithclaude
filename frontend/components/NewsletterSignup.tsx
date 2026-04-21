"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    const { error } = await supabase
      .from("subscribers")
      .insert({ email });

    if (error && error.code !== "23505") {
      setStatus("error");
    } else {
      setStatus("success");
      setEmail("");
    }
  }

  return (
    <section id="newsletter" className="bg-gray-900 rounded-2xl p-8 text-center">
      <h2 className="text-2xl font-semibold text-white mb-2">
        Get the weekly digest
      </h2>
      <p className="text-gray-400 mb-6 text-sm">
        The best Claude updates, workflows, and tools — every Monday morning.
      </p>

      {status === "success" ? (
        <p className="text-green-400 font-medium">You're in. See you Monday.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-brand text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
      )}
    </section>
  );
}
