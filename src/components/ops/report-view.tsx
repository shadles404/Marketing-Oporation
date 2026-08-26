import { PageHeader, StatCard } from "@/components/ops/primitives";
import { currency, useRows, type Row } from "@/lib/ops";

type Props = {
  title: string;
  description: string;
  table: string;
  labelKey: string;
  valueKey: string;
  valueLabel: string;
};

const isMoney = (key: string) => key !== "followers";

export function ReportView({ title, description, table, labelKey, valueKey, valueLabel }: Props) {
  const { data: rows = [], isLoading } = useRows(table);

  const total = rows.reduce((s: number, r: Row) => s + Number(r[valueKey] ?? 0), 0);
  const top = [...rows]
    .sort((a, b) => Number(b[valueKey] ?? 0) - Number(a[valueKey] ?? 0))
    .slice(0, 10);
  const max = Number(top[0]?.[valueKey] ?? 0);
  const fmt = (n: number) => (isMoney(valueKey) ? currency(n) : n.toLocaleString());

  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Records" value={String(rows.length)} />
        <StatCard label={`Total ${valueLabel.toLowerCase()}`} value={fmt(total)} />
        <StatCard label="Average" value={fmt(rows.length ? Math.round(total / rows.length) : 0)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Top by {valueLabel.toLowerCase()}
          </h2>
        </div>
        {isLoading ? (
          <p className="px-6 py-6 text-sm text-muted-foreground">Loading…</p>
        ) : top.length === 0 ? (
          <p className="px-6 py-6 text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {top.map((r) => {
              const value = Number(r[valueKey] ?? 0);
              const pct = max ? Math.round((value / max) * 100) : 0;
              return (
                <li key={String(r["id"])} className="px-6 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {String(r[labelKey] ?? "—")}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{fmt(value)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
