"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Today" },
  { href: "/goals", label: "Goals" },
  { href: "/reflections", label: "Reflections" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="inline-block h-6 w-6 rounded-md bg-accent" aria-hidden />
        <span>Task List</span>
      </Link>
      <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        {links.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                (active ? "bg-accent text-white" : "text-muted hover:text-fg")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
