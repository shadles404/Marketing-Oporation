import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency, monthLabel } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/budget/international")({
  head: () => ({
    meta: [
      { title: "International Budget — Marketing Operations" },
      { name: "description", content: "International Budget allocations by category and month." },
      { property: "og:title", content: "International Budget — Marketing Operations" },
      {
        property: "og:description",
        content: "International Budget allocations by category and month.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="International Budget"
      description="Budget allocated to international market activity."
      table="budgets"
      addLabel="Add budget line"
      filters={[{ column: "scope", op: "eq", value: "international" }]}
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
      fields={M.budgetFields("international")}
    />
  );
}
