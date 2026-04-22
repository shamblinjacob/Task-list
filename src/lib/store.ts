"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { GoalRow, ReflectionRow, TaskRow } from "@/lib/database.types";
import { todayIso } from "@/lib/date";

const LS_KEY = "task-list:v1";

type LocalState = {
  goals: GoalRow[];
  tasks: TaskRow[];
  reflections: ReflectionRow[];
};

function emptyState(): LocalState {
  return { goals: [], tasks: [], reflections: [] };
}

function loadLocal(): LocalState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

function saveLocal(state: LocalState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowIso(): string {
  return new Date().toISOString();
}

export type StoreStatus = "loading" | "ready" | "error";

export function useStore() {
  const [state, setState] = useState<LocalState>(emptyState());
  const [status, setStatus] = useState<StoreStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setState(loadLocal());
      setStatus("ready");
      return;
    }
    try {
      const [goalsRes, tasksRes, reflectionsRes] = await Promise.all([
        sb.from("goals").select("*").order("created_at", { ascending: false }),
        sb.from("tasks").select("*").order("position", { ascending: true }),
        sb.from("reflections").select("*").order("entry_date", { ascending: false }),
      ]);
      if (goalsRes.error) throw goalsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (reflectionsRes.error) throw reflectionsRes.error;
      setState({
        goals: goalsRes.data ?? [],
        tasks: tasksRes.data ?? [],
        reflections: reflectionsRes.data ?? [],
      });
      setStatus("ready");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Local persistence when Supabase not configured
  useEffect(() => {
    if (!configured && status === "ready") {
      saveLocal(state);
    }
  }, [state, status, configured]);

  // --- Goals ---
  const addGoal = useCallback(
    async (input: { title: string; description?: string; target_date?: string | null }) => {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from("goals")
          .insert({
            title: input.title,
            description: input.description ?? null,
            target_date: input.target_date ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        setState((s) => ({ ...s, goals: [data as GoalRow, ...s.goals] }));
        return;
      }
      const row: GoalRow = {
        id: uuid(),
        title: input.title,
        description: input.description ?? null,
        status: "active",
        target_date: input.target_date ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setState((s) => ({ ...s, goals: [row, ...s.goals] }));
    },
    []
  );

  const updateGoal = useCallback(async (id: string, patch: Partial<GoalRow>) => {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("goals")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => (g.id === id ? (data as GoalRow) : g)),
      }));
      return;
    }
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, ...patch, updated_at: nowIso() } : g
      ),
    }));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from("goals").delete().eq("id", id);
      if (error) throw error;
    }
    setState((s) => ({
      ...s,
      goals: s.goals.filter((g) => g.id !== id),
      tasks: s.tasks.map((t) => (t.goal_id === id ? { ...t, goal_id: null } : t)),
    }));
  }, []);

  // --- Tasks ---
  const addTask = useCallback(
    async (input: {
      title: string;
      due_date?: string;
      goal_id?: string | null;
      notes?: string | null;
    }) => {
      const due = input.due_date ?? todayIso();
      const sb = getSupabase();
      if (sb) {
        const { data: maxData } = await sb
          .from("tasks")
          .select("position")
          .eq("due_date", due)
          .order("position", { ascending: false })
          .limit(1);
        const nextPos = (maxData?.[0]?.position ?? -1) + 1;
        const { data, error } = await sb
          .from("tasks")
          .insert({
            title: input.title,
            due_date: due,
            goal_id: input.goal_id ?? null,
            notes: input.notes ?? null,
            position: nextPos,
          })
          .select()
          .single();
        if (error) throw error;
        setState((s) => ({ ...s, tasks: [...s.tasks, data as TaskRow] }));
        return;
      }
      const nextPos =
        Math.max(
          -1,
          ...state.tasks.filter((t) => t.due_date === due).map((t) => t.position)
        ) + 1;
      const row: TaskRow = {
        id: uuid(),
        title: input.title,
        notes: input.notes ?? null,
        due_date: due,
        completed: false,
        completed_at: null,
        goal_id: input.goal_id ?? null,
        position: nextPos,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setState((s) => ({ ...s, tasks: [...s.tasks, row] }));
    },
    [state.tasks]
  );

  const updateTask = useCallback(async (id: string, patch: Partial<TaskRow>) => {
    const sb = getSupabase();
    const finalPatch: Partial<TaskRow> = { ...patch };
    if (patch.completed !== undefined) {
      finalPatch.completed_at = patch.completed ? nowIso() : null;
    }
    if (sb) {
      const { data, error } = await sb
        .from("tasks")
        .update(finalPatch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? (data as TaskRow) : t)),
      }));
      return;
    }
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, ...finalPatch, updated_at: nowIso() } : t
      ),
    }));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from("tasks").delete().eq("id", id);
      if (error) throw error;
    }
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const rolloverIncomplete = useCallback(async () => {
    const today = todayIso();
    const stale = state.tasks.filter((t) => !t.completed && t.due_date < today);
    for (const t of stale) {
      await updateTask(t.id, { due_date: today });
    }
  }, [state.tasks, updateTask]);

  // --- Reflections ---
  const getReflection = useCallback(
    (date: string) => state.reflections.find((r) => r.entry_date === date),
    [state.reflections]
  );

  const upsertReflection = useCallback(
    async (input: { entry_date: string; intention?: string | null; reflection?: string | null }) => {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from("reflections")
          .upsert(
            {
              entry_date: input.entry_date,
              intention: input.intention ?? null,
              reflection: input.reflection ?? null,
            },
            { onConflict: "entry_date" }
          )
          .select()
          .single();
        if (error) throw error;
        setState((s) => {
          const others = s.reflections.filter((r) => r.entry_date !== input.entry_date);
          return { ...s, reflections: [data as ReflectionRow, ...others] };
        });
        return;
      }
      setState((s) => {
        const existing = s.reflections.find((r) => r.entry_date === input.entry_date);
        if (existing) {
          return {
            ...s,
            reflections: s.reflections.map((r) =>
              r.entry_date === input.entry_date
                ? {
                    ...r,
                    intention: input.intention ?? r.intention,
                    reflection: input.reflection ?? r.reflection,
                    updated_at: nowIso(),
                  }
                : r
            ),
          };
        }
        const row: ReflectionRow = {
          id: uuid(),
          entry_date: input.entry_date,
          intention: input.intention ?? null,
          reflection: input.reflection ?? null,
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        return { ...s, reflections: [row, ...s.reflections] };
      });
    },
    []
  );

  return {
    status,
    error,
    configured,
    goals: state.goals,
    tasks: state.tasks,
    reflections: state.reflections,
    refresh,
    addGoal,
    updateGoal,
    deleteGoal,
    addTask,
    updateTask,
    deleteTask,
    rolloverIncomplete,
    getReflection,
    upsertReflection,
  };
}
