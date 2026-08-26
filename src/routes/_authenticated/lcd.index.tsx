import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/lcd/")({
  head: () => ({
    meta: [
      { title: "LCD Database — Marketing Operations" },
      {
        name: "description",
        content: "Digital LCD screen inventory with vendors, slots and rates.",
      },
      { property: "og:title", content: "LCD Database — Marketing Operations" },
      {
        property: "og:description",
        content: "Digital LCD screen inventory with vendors, slots and rates.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="LCD Database"
      description="Digital screen inventory, slot lengths and monthly rates."
      table="lcd_screens"
      addLabel="Add screen"
      searchKeys={["name", "location", "city", "vendor"]}
      columns={M.screenColumns}
      fields={M.screenFields}
    />
  );
}
