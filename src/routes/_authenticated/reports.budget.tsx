import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/ops/report-view";

export const Route = createFileRoute("/_authenticated/reports/budget")({
  head: () => ({
    meta: [
      { title: "Budget Report — Marketing Operations" },
      { name: "description", content: "Allocation by budget line and period." },
      { property: "og:title", content: "Budget Report — Marketing Operations" },
      { property: "og:description", content: "Allocation by budget line and period." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ReportView
      title="Budget Report"
      description="Allocation by budget line and period."
      table="budgets"
      labelKey="name"
      valueKey="allocated"
      valueLabel="Allocated"
    />
  );
}
