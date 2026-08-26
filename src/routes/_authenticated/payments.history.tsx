import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/payments/history")({
  head: () => ({
    meta: [
      { title: "Payment History — Marketing Operations" },
      { name: "description", content: "Full payment ledger across every marketing channel." },
      { property: "og:title", content: "Payment History — Marketing Operations" },
      {
        property: "og:description",
        content: "Full payment ledger across every marketing channel.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Payment History"
      description="Full payment ledger across every marketing channel."
      table="payments"
      addLabel="Add payment"
      filters={undefined}
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
      fields={M.paymentFields(undefined)}
    />
  );
}
