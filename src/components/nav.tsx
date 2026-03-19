"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/graph", label: "Graph" },
  { href: "/bar-race", label: "Bar Race" },
  { href: "/sankey", label: "Transfers" },
  { href: "/head-to-head", label: "Head to Head" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-1 border-b border-card-border bg-background/80 px-6 py-3 backdrop-blur-md">
      <Link href="/" className="mr-6 flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight">
          IPL<span className="text-blue-400">ens</span>
        </span>
      </Link>
      <div className="flex items-center gap-1">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
