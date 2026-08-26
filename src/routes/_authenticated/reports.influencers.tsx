import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/ops/report-view";

export const Route = createFileRoute("/_authenticated/reports/influencers")({
  head: () => ({
    meta: [
      { title: "Influencer Report — Marketing Operations" },
      { name: "description", content: "Reach and rates across creator partners." },
      { property: "og:title", content: "Influencer Report — Marketing Operations" },
      { property: "og:description", content: "Reach and rates across creator partners." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ReportView
      title="Influencer Report"
      description="Reach and rates across creator partners."
      table="influencers"
      labelKey="name"
      valueKey="followers"
      valueLabel="Followers"
    />
  );
}
