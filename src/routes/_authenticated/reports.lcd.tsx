import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/ops/report-view";

export const Route = createFileRoute("/_authenticated/reports/lcd")({
  head: () => ({
    meta: [
      { title: "LCD Report — Marketing Operations" },
      { name: "description", content: "Spend and coverage across LCD screens." },
      { property: "og:title", content: "LCD Report — Marketing Operations" },
      { property: "og:description", content: "Spend and coverage across LCD screens." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ReportView
      title="LCD Report"
      description="Spend and coverage across LCD screens."
      table="lcd_screens"
      labelKey="name"
      valueKey="monthly_rate"
      valueLabel="Monthly rate"
    />
  );
}
