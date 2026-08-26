import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/ops/report-view";

export const Route = createFileRoute("/_authenticated/reports/payments")({
  head: () => ({
    meta: [
      { title: "Payments Report — Marketing Operations" },
      { name: "description", content: "Payment totals by payee and status." },
      { property: "og:title", content: "Payments Report — Marketing Operations" },
      { property: "og:description", content: "Payment totals by payee and status." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ReportView
      title="Payments Report"
      description="Payment totals by payee and status."
      table="payments"
      labelKey="payee"
      valueKey="amount"
      valueLabel="Amount"
    />
  );
}
