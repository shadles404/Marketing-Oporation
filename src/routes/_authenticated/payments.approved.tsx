import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/payments/approved")({
  head: () => ({
    meta: [
      { title: "Approved Payments — Marketing Operations" },
      { name: "description", content: "Approved payments waiting to be settled." },
      { property: "og:title", content: "Approved Payments — Marketing Operations" },
      { property: "og:description", content: "Approved payments waiting to be settled." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Approved Payments"
      description="Approved payments waiting to be settled."
      table="payments"
      addLabel="Add payment"
      filters={[{ column: "status", op: "eq", value: "approved" }]}
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
