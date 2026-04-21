import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Items" },
  { href: "/admin/quick", label: "Quick add" },
  { href: "/admin/community", label: "Community" },
  { href: "/admin/submit", label: "Submit URL" },
  { href: "/admin/follows", label: "Worth Following" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-900">Admin</span>
            <nav className="flex gap-4">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to site
          </Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
