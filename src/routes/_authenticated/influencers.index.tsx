import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";

export const Route = createFileRoute("/_authenticated/influencers/")({
  head: () => ({
    meta: [
      { title: "Influencers — Marketing Operations" },
      {
        name: "description",
        content: "Central database of influencer partners, reach, rates and status.",
      },
      { property: "og:title", content: "Influencers — Marketing Operations" },
      {
        property: "og:description",
        content: "Central database of influencer partners, reach, rates and status.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ResourcePage
      title="Influencers"
      description="Every creator partner, their reach, agreed rate and status."
      table="influencers"
      addLabel="Add influencer"
      searchKeys={["name", "handle", "category", "country"]}
      columns={M.influencerColumns}
      fields={M.influencerFields}
    />
  );
}
