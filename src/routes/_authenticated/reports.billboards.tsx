import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/ops/report-view";

export const Route = createFileRoute("/_authenticated/reports/billboards")({
  head: () => ({
    meta: [
      { title: "Billboard Report — Marketing Operations" },
      { name: "description", content: "Spend and coverage across billboard sites." },
      { property: "og:title", content: "Billboard Report — Marketing Operations" },
      { property: "og:description", content: "Spend and coverage across billboard sites." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ReportView
      title="Billboard Report"
      description="Spend and coverage across billboard sites."
      table="billboards"
      labelKey="name"
      valueKey="monthly_rate"
      valueLabel="Monthly rate"
    />
  );
}
