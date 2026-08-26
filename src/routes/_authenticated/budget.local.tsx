import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency, monthLabel } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/budget/local")({
  head: () => ({
    meta: [
      { title: "Local Budget — Marketing Operations" },
      { name: "description", content: "Local Budget allocations by category and month." },
      { property: "og:title", content: "Local Budget — Marketing Operations" },
      { property: "og:description", content: "Local Budget allocations by category and month." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Local Budget"
      description="Budget allocated to local market activity."
      table="budgets"
      addLabel="Add budget line"
      filters={[{ column: "scope", op: "eq", value: "local" }]}
      order={{ column: "period", ascending: false }}
      searchKeys={["name", "category"]}
      headerExtra={(rows) => (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Budget lines" value={String(rows.length)} />
          <StatCard
            label="Total allocated"
            value={currency(rows.reduce((s, r) => s + Number(r["allocated"] ?? 0), 0))}
          />
          <StatCard label="Current period" value={monthLabel(new Date().toISOString())} />
        </div>
      )}
      columns={M.budgetColumns}
      fields={M.budgetFields("local")}
    />
  );
}
