import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/ops/resource-page";
import * as M from "@/lib/modules";
import { useRows } from "@/lib/ops";

export const Route = createFileRoute("/_authenticated/lcd/videos")({
  head: () => ({
    meta: [
      { title: "Video Tracking — Marketing Operations" },
      { name: "description", content: "Creative rotation and play counts per LCD screen." },
      { property: "og:title", content: "Video Tracking — Marketing Operations" },
      { property: "og:description", content: "Creative rotation and play counts per LCD screen." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: screens = [] } = useRows("lcd_screens", {
    order: { column: "name", ascending: true },
  });
  const options = screens.map((s) => ({ value: String(s["id"]), label: String(s["name"]) }));
  return (
    <ResourcePage
      title="Video Tracking"
      description="Creative rotation, run dates and daily play counts per screen."
      table="lcd_videos"
      addLabel="Add video"
      order={{ column: "start_date", ascending: false }}
      searchKeys={["title"]}
      columns={M.videoColumns(M.nameMap(screens))}
      fields={M.videoFields(options)}
    />
  );
}
