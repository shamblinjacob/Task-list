"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import ConfigBanner from "@/components/ConfigBanner";
import { formatLongDate } from "@/lib/date";

export default function ReflectionsPage() {
  const store = useStore();

  const entries = useMemo(
    () =>
      [...store.reflections]
        .filter((r) => (r.intention && r.intention.trim()) || (r.reflection && r.reflection.trim()))
        .sort((a, b) => b.entry_date.localeCompare(a.entry_date)),
    [store.reflections]
  );

  return (
    <div className="space-y-8">
      {!store.configured && <ConfigBanner />}

      <section>
        <p className="text-xs uppercase tracking-widest text-muted">Reflections</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your journal</h1>
        <p className="mt-2 text-sm text-muted">
          Daily intentions and end-of-day notes, most recent first.
        </p>
      </section>

      {store.status === "loading" ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="card p-6 text-center text-sm text-muted">
          No entries yet. Add one on the Today page.
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((r) => (
            <li key={r.id} className="card p-5">
              <p className="text-xs uppercase tracking-widest text-muted">
                {formatLongDate(r.entry_date)}
              </p>
              {r.intention && (
                <p className="mt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Intention
                  </span>
                  <br />
                  <span className="text-sm">{r.intention}</span>
                </p>
              )}
              {r.reflection && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-fg">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Reflection
                  </span>
                  {r.reflection}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
