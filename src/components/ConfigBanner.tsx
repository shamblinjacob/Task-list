"use client";

export default function ConfigBanner() {
  return (
    <div className="card mb-6 border-accent/30 bg-accent/5 p-4 text-sm">
      <p className="font-medium text-fg">Running in local mode</p>
      <p className="mt-1 text-muted">
        Data is saved to this browser only. To sync across devices, add your Supabase
        credentials to{" "}
        <code className="rounded bg-surfaceAlt px-1.5 py-0.5 text-xs">.env.local</code>{" "}
        and restart the dev server. See <code className="rounded bg-surfaceAlt px-1.5 py-0.5 text-xs">README.md</code>.
      </p>
    </div>
  );
}
