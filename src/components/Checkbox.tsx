"use client";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

export default function Checkbox({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      className="checkbox"
      data-checked={checked}
      aria-label={label ?? "Toggle"}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
}
