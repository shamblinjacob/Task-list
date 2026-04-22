"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import ConfigBanner from "@/components/ConfigBanner";
import type { GoalRow, GoalStatus } from "@/lib/database.types";
import { formatLongDate } from "@/lib/date";

const STATUS_ORDER: GoalStatus[] = ["active", "paused", "completed", "archived"];

export default function GoalsPage() {
  const store = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [filter, setFilter] = useState<GoalStatus | "all">("active");

  const progressByGoal = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const t of store.tasks) {
      if (!t.goal_id) continue;
      const entry = map.get(t.goal_id) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (t.completed) entry.done += 1;
      map.set(t.goal_id, entry);
    }
    return map;
  }, [store.tasks]);

  const filtered = useMemo(() => {
    const list = filter === "all" ? store.goals : store.goals.filter((g) => g.status === filter);
    return [...list].sort((a, b) => {
      const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (byStatus !== 0) return byStatus;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [store.goals, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await store.addGoal({
      title: t,
      description: description.trim() || undefined,
      target_date: targetDate || null,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
  }

  return (
    <div className="space-y-8">
      {!store.configured && <ConfigBanner />}

      <section>
        <p className="text-xs uppercase tracking-widest text-muted">Goals</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Big picture</h1>
        <p className="mt-2 text-sm text-muted">
          Long-term things you're working toward. Link daily tasks to them.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          New goal
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            className="input"
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input"
            placeholder="Why does this matter? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-muted">
              <span>Target date</span>
              <input
                type="date"
                className="input sm:w-auto"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </label>
            <div className="flex-1" />
            <button className="btn btn-primary" type="submit" disabled={!title.trim()}>
              Create goal
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["active", "paused", "completed", "archived", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={
                "chip cursor-pointer " +
                (filter === f ? "border-accent text-fg" : "")
              }
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {store.status === "loading" ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">
            No goals here. Create one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((goal) => {
              const p = progressByGoal.get(goal.id) ?? { total: 0, done: 0 };
              const percent = p.total === 0 ? 0 : Math.round((p.done / p.total) * 100);
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  percent={percent}
                  totals={p}
                  onChangeStatus={(status) => store.updateGoal(goal.id, { status })}
                  onDelete={() => store.deleteGoal(goal.id)}
                  onRename={(title) => store.updateGoal(goal.id, { title })}
                  onDescription={(description) =>
                    store.updateGoal(goal.id, { description: description || null })
                  }
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function GoalCard({
  goal,
  percent,
  totals,
  onChangeStatus,
  onDelete,
  onRename,
  onDescription,
}: {
  goal: GoalRow;
  percent: number;
  totals: { total: number; done: number };
  onChangeStatus: (status: GoalStatus) => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onDescription: (description: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");

  return (
    <li className="card p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip chip-${goal.status}`}>{goal.status}</span>
            {goal.target_date && (
              <span className="text-xs text-muted">
                by {formatLongDate(goal.target_date)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="mt-2 block truncate text-left text-lg font-semibold tracking-tight"
            onClick={() => setExpanded((v) => !v)}
          >
            {goal.title}
          </button>
          {goal.description && !expanded && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{goal.description}</p>
          )}
          {totals.total > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs text-muted">
                {totals.done}/{totals.total}
              </span>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              const t = title.trim();
              if (t && t !== goal.title) onRename(t);
            }}
          />
          <textarea
            className="input"
            placeholder="Why does this matter?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => onDescription(description.trim())}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input sm:w-auto"
              value={goal.status}
              onChange={(e) => onChangeStatus(e.target.value as GoalStatus)}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="flex-1" />
            <button
              type="button"
              className="btn btn-ghost text-danger"
              onClick={() => {
                if (confirm(`Delete "${goal.title}"? Tasks will be unlinked.`)) onDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
