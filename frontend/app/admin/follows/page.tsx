"use client";

import { useEffect, useState } from "react";

type Follow = {
  id: string;
  name: string;
  handle: string | null;
  description: string;
  url: string;
  type: "x" | "newsletter" | "youtube";
};

const TYPE_LABELS = { x: "X", newsletter: "Newsletter", youtube: "YouTube" };

export default function FollowsPage() {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [form, setForm] = useState({ name: "", handle: "", description: "", url: "", type: "x" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/admin/follows").then((r) => r.json());
    setFollows(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", handle: "", description: "", url: "", type: "x" });
    await load();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return;
    await fetch("/api/admin/follows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setFollows((f) => f.filter((x) => x.id !== id));
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-900">Worth Following</h1>

      {/* Add form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Add entry</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input placeholder="Handle (e.g. @username)" value={form.handle} onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input required placeholder="URL" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 col-span-2" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 col-span-2 resize-none" />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500">
            <option value="x">X / Twitter</option>
            <option value="newsletter">Newsletter</option>
            <option value="youtube">YouTube</option>
          </select>
          <button type="submit" disabled={saving}
            className="bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60">
            {saving ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 text-sm p-6">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {follows.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{f.name}</p>
                    {f.handle && <p className="text-gray-400 text-xs">{f.handle}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{TYPE_LABELS[f.type]}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs">
                    <p className="line-clamp-2">{f.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(f.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
