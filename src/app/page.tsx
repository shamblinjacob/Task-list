"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import Checkbox from "@/components/Checkbox";
import ConfigBanner from "@/components/ConfigBanner";
import { formatLongDate, todayIso } from "@/lib/date";
import type { TaskRow } from "@/lib/database.types";

export default function TodayPage() {
  const store = useStore();
  const today = todayIso();
  const [newTask, setNewTask] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [intention, setIntention] = useState("");
  const [reflection, setReflection] = useState("");
  const [savedTick, setSavedTick] = useState(false);

  // Roll over unfinished prior-day tasks once per session
  useEffect(() => {
    if (store.status !== "ready") return;
    void store.rolloverIncomplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status]);

  const todays: TaskRow[] = useMemo(
    () =>
      store.tasks
        .filter((t) => t.due_date === today)
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return a.position - b.position;
        }),
    [store.tasks, today]
  );

  const todaysReflection = store.getReflection(today);

  useEffect(() => {
    setIntention(todaysReflection?.intention ?? "");
    setReflection(todaysReflection?.reflection ?? "");
  }, [todaysReflection?.id, todaysReflection?.intention, todaysReflection?.reflection]);

  const completed = todays.filter((t) => t.completed).length;
  const total = todays.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const activeGoals = store.goals.filter((g) => g.status === "active");

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    await store.addTask({
      title,
      due_date: today,
      goal_id: selectedGoalId || null,
    });
    setNewTask("");
  }

  async function saveReflection() {
    await store.upsertReflection({
      entry_date: today,
      intention: intention.trim() || null,
      reflection: reflection.trim() || null,
    });
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1500);
  }

  return (
    <div className="space-y-8">
      {!store.configured && <ConfigBanner />}

      <section>
        <p className="text-xs uppercase tracking-widest text-muted">Today</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {formatLongDate(today)}
        </h1>
        {total > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted">
              {completed} / {total}
            </span>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Daily intention
        </h2>
        <input
          className="input"
          placeholder="What's the one thing that would make today a win?"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          onBlur={saveReflection}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Tasks
          </h2>
        </div>
        <form onSubmit={handleAddTask} className="card mb-4 flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <input
            className="input flex-1"
            placeholder="Add a task…"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          {activeGoals.length > 0 && (
            <select
              className="input sm:w-48"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
            >
              <option value="">No goal</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}
          <button className="btn btn-primary" type="submit" disabled={!newTask.trim()}>
            Add
          </button>
        </form>

        {store.status === "loading" ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : todays.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">
            Nothing yet for today. Add your first task above.
          </div>
        ) : (
          <ul className="card divide-y divide-border overflow-hidden">
            {todays.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                goalTitle={
                  task.goal_id
                    ? store.goals.find((g) => g.id === task.goal_id)?.title ?? null
                    : null
                }
                onToggle={(next) => store.updateTask(task.id, { completed: next })}
                onDelete={() => store.deleteTask(task.id)}
                onRename={(title) => store.updateTask(task.id, { title })}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            End of day reflection
          </h2>
          {savedTick && <span className="text-xs text-success">Saved</span>}
        </div>
        <textarea
          className="input min-h-[120px]"
          placeholder="What went well? What carried over? What's on your mind?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          onBlur={saveReflection}
        />
      </section>

      {store.error && (
        <p className="text-sm text-danger">Sync error: {store.error}</p>
      )}
    </div>
  );
}

function TaskItem({
  task,
  goalTitle,
  onToggle,
  onDelete,
  onRename,
}: {
  task: TaskRow;
  goalTitle: string | null;
  onToggle: (next: boolean) => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  useEffect(() => {
    setDraft(task.title);
  }, [task.title]);

  function commit() {
    const t = draft.trim();
    if (t && t !== task.title) onRename(t);
    setEditing(false);
  }

  return (
    <li className="group flex items-center gap-3 p-3 sm:p-4">
      <Checkbox checked={task.completed} onChange={onToggle} label={task.title} />
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(task.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={
              "block w-full truncate text-left text-sm " +
              (task.completed ? "text-muted line-through" : "text-fg")
            }
          >
            {task.title}
          </button>
        )}
        {goalTitle && (
          <p className="mt-0.5 text-xs text-muted">{goalTitle}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="btn btn-ghost opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Delete task"
        title="Delete"
      >
        ×
      </button>
    </li>
  );
}
