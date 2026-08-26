import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/billboards/")({
  head: () => ({
    meta: [
      { title: "Billboard Database — Marketing Operations" },
      {
        name: "description",
        content: "Outdoor billboard sites, vendors, rates and contract dates.",
      },
      { property: "og:title", content: "Billboard Database — Marketing Operations" },
      {
        property: "og:description",
        content: "Outdoor billboard sites, vendors, rates and contract dates.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Billboard Database"
      description="Every billboard site with vendor, rate and contract window."
      table="billboards"
      addLabel="Add billboard"
      searchKeys={["name", "location", "city", "vendor"]}
      columns={M.billboardColumns}
      fields={M.billboardFields}
    />
  );
}
