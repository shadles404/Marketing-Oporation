import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { useRows } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/influencers/deliveries")({
  head: () => ({
    meta: [
      { title: "Delivery Records — Marketing Operations" },
      { name: "description", content: "Delivered influencer content with views and engagement." },
      { property: "og:title", content: "Delivery Records — Marketing Operations" },
      {
        property: "og:description",
        content: "Delivered influencer content with views and engagement.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: influencers = [] } = useRows("influencers", {
    order: { column: "name", ascending: true },
  });
  const options = influencers.map((i) => ({ value: String(i["id"]), label: String(i["name"]) }));
  return (
    <ResourcePage
      title="Delivery Records"
      description="Content delivered by influencers with performance figures."
      table="influencer_deliveries"
      addLabel="Add delivery"
      order={{ column: "delivery_date", ascending: false }}
      searchKeys={["title", "content_type"]}
      columns={M.deliveryColumns(M.nameMap(influencers))}
      fields={M.deliveryFields(options)}
    />
  );
}
