import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, RotateCcw, Search, Video, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ops/primitives";
import { useRows, monthLabel, type Row } from "@/lib/ops";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/influencers/targets")({
  head: () => ({
    meta: [
      { title: "Target Video Tracking — Marketing Operations" },
      {
        name: "description",
        content: "Monthly video targets per influencer with live progress tracking.",
      },
      { property: "og:title", content: "Target Video Tracking — Marketing Operations" },
      {
        property: "og:description",
        content: "Monthly video targets per influencer with live progress tracking.",
      },
    ],
  }),
  component: Page,
});

const periodKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
const shortPeriod = (p: string) => String(p).slice(0, 7);

function Page() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const currentPeriod = periodKey(new Date());

  const { data: influencers = [] } = useRows("influencers", {
    order: { column: "name", ascending: true },
  });
  const { data: targets = [] } = useRows("influencer_targets", {
    order: { column: "period", ascending: false },
  });

  const activeInfluencers = influencers.filter((i) => i["status"] === "active");

  const currentByInfluencer = useMemo(() => {
    const map: Record<string, Row> = {};
    for (const t of targets) {
      if (String(t["period"]).slice(0, 10) === currentPeriod) map[String(t["influencer_id"])] = t;
    }
    return map;
  }, [targets, currentPeriod]);

  const history = useMemo(() => {
    const groups: Record<string, { reached: number; total: number }> = {};
    for (const t of targets) {
      const p = String(t["period"]).slice(0, 10);
      if (p === currentPeriod) continue;
      const g = groups[p] ?? (groups[p] = { reached: 0, total: 0 });
      g.total += 1;
      if (Number(t["achieved_posts"]) >= Number(t["target_posts"]) && Number(t["target_posts"]) > 0)
        g.reached += 1;
    }
    return Object.entries(groups)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 6);
  }, [targets, currentPeriod]);

  const rows = activeInfluencers
    .map((inf) => {
      const t = currentByInfluencer[String(inf["id"])];
      const target = Number(t?.["target_posts"] ?? 0);
      const achieved = Number(t?.["achieved_posts"] ?? 0);
      return { inf, target, achieved, reached: target > 0 && achieved >= target, row: t };
    })
    .filter((r) => {
      const q = search.trim().toLowerCase();
      const matches =
        !q ||
        [r.inf["name"], r.inf["handle"], r.inf["category"]]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      const statusOk = status === "all" || (status === "reached" ? r.reached : !r.reached);
      return matches && statusOk;
    });

  const save = useMutation({
    mutationFn: async ({
      influencerId,
      existing,
      values,
    }: {
      influencerId: string;
      existing?: Row | undefined;
      values: { achieved_posts?: number; target_posts?: number };
    }) => {
      if (existing) {
        const { error } = await supabase
          .from("influencer_targets")
          .update(values)
          .eq("id", existing["id"]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("influencer_targets").insert({
          influencer_id: influencerId,
          period: currentPeriod,
          target_posts: values.target_posts ?? 0,
          achieved_posts: values.achieved_posts ?? 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries(),
    onError: (e: any) => toast.error(e.message ?? "Could not save"),
  });

  const reset = useMutation({
    mutationFn: async () => {
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      const nextPeriod = periodKey(next);
      const payload = activeInfluencers.map((inf) => ({
        influencer_id: String(inf["id"]),
        period: nextPeriod,
        target_posts: Number(currentByInfluencer[String(inf["id"])]?.["target_posts"] ?? 0),
        achieved_posts: 0,
      }));
      if (!payload.length) return;
      const { error } = await supabase.from("influencer_targets").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("New month created with targets carried over");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not reset"),
  });

  const exportCsv = () => {
    const lines = [
      ["Influencer", "Handle", "Category", "Achieved", "Target", "Status"].join(","),
      ...rows.map((r) =>
        [
          r.inf["name"],
          r.inf["handle"] ?? "",
          r.inf["category"] ?? "",
          r.achieved,
          r.target,
          r.reached ? "Reached" : "Unreached",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([lines], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `target-tracking-${shortPeriod(currentPeriod)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Target Video Tracking"
        description={`Tracking period: ${monthLabel(currentPeriod)} · Active influencers only`}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-2 size-4" /> CSV
            </Button>
            <Button variant="destructive" onClick={() => reset.mutate()} disabled={reset.isPending}>
              <RotateCcw className="mr-2 size-4" /> Monthly Reset
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reached">Reached</SelectItem>
            <SelectItem value="unreached">Unreached</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {history.length > 0 ? (
        <div className="surface-card p-5">
          <p className="text-sm font-semibold">Recent History</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {history.map(([period, g]) => (
              <div key={period} className="rounded-lg bg-secondary px-4 py-2">
                <p className="text-sm font-medium">{shortPeriod(period)}</p>
                <p className="text-xs text-muted-foreground">
                  {g.reached}/{g.total} reached
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            No active influencers match this filter.
          </div>
        ) : null}
        {rows.map((r) => {
          const pct = r.target > 0 ? Math.min(100, Math.round((r.achieved / r.target) * 100)) : 0;
          const remaining = Math.max(0, r.target - r.achieved);
          return (
            <div key={String(r.inf["id"])} className="surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{r.inf["name"]}</h2>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        r.reached
                          ? "bg-success/12 text-success"
                          : "bg-destructive text-destructive-foreground",
                      )}
                    >
                      {r.reached ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      {r.reached ? "Reached" : "Unreached"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.inf["handle"] ?? "—"} · {r.inf["category"] ?? "Uncategorised"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Video className="size-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    className="w-20 text-center font-semibold tabular-nums"
                    defaultValue={r.achieved}
                    key={`${r.inf["id"]}-${r.achieved}`}
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isNaN(value) || value === r.achieved) return;
                      save.mutate({
                        influencerId: String(r.inf["id"]),
                        existing: r.row,
                        values: { achieved_posts: value, target_posts: r.target },
                      });
                    }}
                  />
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-16 text-center tabular-nums"
                    defaultValue={r.target}
                    key={`${r.inf["id"]}-t-${r.target}`}
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isNaN(value) || value === r.target) return;
                      save.mutate({
                        influencerId: String(r.inf["id"]),
                        existing: r.row,
                        values: { target_posts: value, achieved_posts: r.achieved },
                      });
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      r.reached ? "bg-success" : "bg-primary",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {r.achieved} / {r.target}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {remaining > 0 ? `${remaining} remaining` : "Target complete"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
