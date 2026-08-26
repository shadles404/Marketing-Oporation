import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/ops/report-view";

export const Route = createFileRoute("/_authenticated/reports/monthly")({
  head: () => ({
    meta: [
      { title: "Monthly Report — Marketing Operations" },
      { name: "description", content: "Recorded spend for the current reporting cycle." },
      { property: "og:title", content: "Monthly Report — Marketing Operations" },
      { property: "og:description", content: "Recorded spend for the current reporting cycle." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ReportView
      title="Monthly Report"
      description="Recorded spend for the current reporting cycle."
      table="expenses"
      labelKey="description"
      valueKey="amount"
      valueLabel="Amount"
    />
  );
}
