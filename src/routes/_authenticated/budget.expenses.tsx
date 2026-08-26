import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency, useRows } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/budget/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Marketing Operations" },
      { name: "description", content: "Actual spend recorded against each budget line." },
      { property: "og:title", content: "Expenses — Marketing Operations" },
      { property: "og:description", content: "Actual spend recorded against each budget line." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: budgets = [] } = useRows("budgets", { order: { column: "name", ascending: true } });
  const options = budgets.map((b) => ({ value: String(b["id"]), label: String(b["name"]) }));
  return (
    <ResourcePage
      title="Expenses"
      description="Actual spend recorded against budget lines."
      table="expenses"
      addLabel="Add expense"
      order={{ column: "expense_date", ascending: false }}
      searchKeys={["description", "vendor", "category"]}
      headerExtra={(rows) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Recorded expenses" value={String(rows.length)} />
          <StatCard
            label="Total spend"
            value={currency(rows.reduce((s, r) => s + Number(r["amount"] ?? 0), 0))}
          />
        </div>
      )}
      columns={M.expenseColumns(M.nameMap(budgets))}
      fields={M.expenseFields(options)}
    />
  );
}
