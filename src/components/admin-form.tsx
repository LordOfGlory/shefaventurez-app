export const af =
  "mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs leading-relaxed text-muted">{hint}</span> : null}
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const live = status === "published" || status === "paid" || status === "confirmed";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${live ? "bg-fog text-ink" : "border border-line text-muted"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
