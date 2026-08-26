import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/billboards/payments")({
  head: () => ({
    meta: [
      { title: "Billboard Payments — Marketing Operations" },
      { name: "description", content: "Vendor payments for billboard placements." },
      { property: "og:title", content: "Billboard Payments — Marketing Operations" },
      { property: "og:description", content: "Vendor payments for billboard placements." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Billboard Payments"
      description="Vendor payments for billboard placements."
      table="payments"
      addLabel="Add payment"
      filters={[{ column: "category", op: "eq", value: "billboard" }]}
      order={{ column: "due_date", ascending: true }}
      searchKeys={["payee", "invoice_number"]}
      headerExtra={(rows) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Records" value={String(rows.length)} />
          <StatCard
            label="Total value"
            value={currency(rows.reduce((s, r) => s + Number(r["amount"] ?? 0), 0))}
          />
        </div>
      )}
      columns={M.paymentColumns}
      fields={M.paymentFields("billboard")}
    />
  );
}
