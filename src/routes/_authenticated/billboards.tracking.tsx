import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { StatCard } from "@/components/ops/primitives";
import { currency } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/billboards/tracking")({
  head: () => ({
    meta: [
      { title: "Billboard Tracking — Marketing Operations" },
      { name: "description", content: "Live and expiring billboard contracts at a glance." },
      { property: "og:title", content: "Billboard Tracking — Marketing Operations" },
      { property: "og:description", content: "Live and expiring billboard contracts at a glance." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Billboard Tracking"
      description="Contract status and spend across every billboard site."
      table="billboards"
      addLabel="Add billboard"
      order={{ column: "end_date", ascending: true }}
      searchKeys={["name", "location", "city", "vendor"]}
      headerExtra={(rows) => (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Sites tracked" value={String(rows.length)} />
          <StatCard
            label="Active"
            value={String(rows.filter((r) => r["status"] === "active").length)}
          />
          <StatCard
            label="Monthly spend"
            value={currency(rows.reduce((s, r) => s + Number(r["monthly_rate"] ?? 0), 0))}
          />
        </div>
      )}
      columns={M.billboardColumns}
      fields={M.billboardFields}
    />
  );
}
