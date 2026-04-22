"use client";

import { useState } from "react";
import { saveSupabaseConfig } from "@/lib/supabase";

export default function ConfigBanner() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();
    if (!trimmedUrl || !trimmedKey) return;
    saveSupabaseConfig(trimmedUrl, trimmedKey);
    window.location.reload();
  }

  return (
    <div className="card mb-6 border-accent/30 bg-accent/5 p-4 text-sm">
      <p className="font-medium text-fg">Running in local mode</p>
      <p className="mt-1 text-muted">
        Data is saved to this browser only. To sync across devices, enter your Supabase
        credentials below or add them to{" "}
        <code className="rounded bg-surfaceAlt px-1.5 py-0.5 text-xs">.env.local</code>.
      </p>
      {!expanded ? (
        <button
          type="button"
          className="btn btn-ghost mt-3 text-xs"
          onClick={() => setExpanded(true)}
        >
          Connect Supabase
        </button>
      ) : (
        <form onSubmit={handleSave} className="mt-3 flex flex-col gap-2">
          <input
            className="input text-xs"
            placeholder="Supabase URL (https://xxxx.supabase.co)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoComplete="off"
          />
          <input
            className="input text-xs"
            placeholder="Anon key"
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary text-xs"
              type="submit"
              disabled={!url.trim() || !anonKey.trim()}
            >
              Save &amp; reload
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => setExpanded(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
