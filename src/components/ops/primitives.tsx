import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string | undefined;
  tone?: "default" | "success" | "warning" | "info" | "destructive";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    destructive: "text-destructive",
  }[tone];

  return (
    <div className="surface-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const statusTones: Record<string, string> = {
  active: "bg-success/12 text-success",
  running: "bg-success/12 text-success",
  delivered: "bg-success/12 text-success",
  paid: "bg-success/12 text-success",
  approved: "bg-info/12 text-info",
  scheduled: "bg-info/12 text-info",
  pending: "bg-warning/16 text-warning-foreground",
  pending_review: "bg-warning/16 text-warning-foreground",
  paused: "bg-warning/16 text-warning-foreground",
  expired: "bg-destructive/10 text-destructive",
  ended: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
};

export function StatusBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusTones[value] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
