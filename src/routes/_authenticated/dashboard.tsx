import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/ops/primitives";
import { currency, compact, useRows, useCurrentUser } from "@/lib/ops";
import { hasPermission, isUserPrimaryAdmin } from "@/lib/rbac";
import { ShieldCheck, Activity, Users, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Marketing Operations" },
      {
        name: "description",
        content: "Live overview of influencer, billboard, LCD and payment activity.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: currentUser } = useCurrentUser();

  const canViewInfluencers =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "influencers", "view");
  const canViewBillboards =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "billboards", "view");
  const canViewScreens =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "lcd_screens", "view");
  const canViewPayments =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "payments", "view");
  const canViewBudgets =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "budgets", "view");
  const canViewExpenses =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "expenses", "view");
  const canManageUsers =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "view");

  const { data: influencers = [] } = useRows("influencers");
  const { data: billboards = [] } = useRows("billboards");
  const { data: screens = [] } = useRows("lcd_screens");
  const { data: payments = [] } = useRows("payments");
  const { data: budgets = [] } = useRows("budgets");
  const { data: expenses = [] } = useRows("expenses");

  const sum = (rows: Array<Record<string, unknown>>, key: string) =>
    rows.reduce((s, r) => s + Number(r[key] ?? 0), 0);

  const pending = payments.filter((p) => p["status"] === "pending");
  const allocated = sum(budgets, "allocated");
  const spent = sum(expenses, "amount");
  const usage = allocated ? Math.round((spent / allocated) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={`Welcome, ${currentUser?.full_name || "Admin"}`}
          description={`Active role: ${currentUser?.role_name || "Super Admin"} • Marketing operations and access overview.`}
        />

        {canManageUsers && (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
              <Link to="/audit-logs">
                <Activity className="size-3.5" /> Audit Logs
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs">
              <Link to="/settings/users">
                <Users className="size-3.5" /> Team & Permissions
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Role Banner */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3.5 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span className="text-foreground">
            Signed in as <strong>{currentUser?.full_name}</strong> (@{currentUser?.username}) with{" "}
            <strong>{currentUser?.role_name}</strong> permissions.
          </span>
        </div>
        {canManageUsers && (
          <Link
            to="/settings/users"
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Manage User Matrix <ArrowRight className="size-3" />
          </Link>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active influencers"
          value={
            canViewInfluencers
              ? String(influencers.filter((i) => i["status"] === "active").length)
              : "Restricted"
          }
          hint={canViewInfluencers ? `${influencers.length} total partners` : "No view access"}
        />
        <StatCard
          label="Billboards live"
          value={
            canViewBillboards
              ? String(billboards.filter((b) => b["status"] === "active").length)
              : "Restricted"
          }
          hint={canViewBillboards ? `${billboards.length} sites tracked` : "No view access"}
        />
        <StatCard
          label="LCD screens live"
          value={
            canViewScreens
              ? String(screens.filter((s) => s["status"] === "active").length)
              : "Restricted"
          }
          hint={canViewScreens ? `${screens.length} screens tracked` : "No view access"}
        />
        <StatCard
          label="Pending payments"
          value={canViewPayments ? currency(sum(pending, "amount")) : "Restricted"}
          hint={canViewPayments ? `${pending.length} awaiting approval` : "No view access"}
        />
      </div>

      {/* Budget & Reach Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Budget usage</h2>
          {canViewBudgets && canViewExpenses ? (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                {currency(spent)} spent of {currency(allocated)} allocated
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, usage)}%` }}
                />
              </div>
              <p className="mt-2 text-xs tabular-nums text-muted-foreground">{usage}% utilised</p>
            </>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Budget details are restricted for your role.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Combined reach</h2>
          {canViewInfluencers ? (
            <>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {compact(sum(influencers, "followers"))}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Followers across all active creator partners
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Creator audience statistics are restricted for your role.
            </p>
          )}
        </div>
      </div>

      {/* Upcoming Payments */}
      {canViewPayments && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Upcoming & Pending Payments</h2>
            <Link to="/payments/pending" className="text-xs text-primary hover:underline">
              View all pending ({pending.length})
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {payments
              .filter((p) => p["status"] !== "paid")
              .slice(0, 6)
              .map((p) => (
                <li
                  key={String(p["id"])}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{String(p["payee"])}</span>
                    <span className="text-xs text-muted-foreground">
                      {String(p["invoice_number"] || p["category"])}
                    </span>
                  </div>
                  <span className="tabular-nums font-semibold text-foreground">
                    {currency(p["amount"], p["currency"])}
                  </span>
                </li>
              ))}
            {payments.filter((p) => p["status"] !== "paid").length === 0 && (
              <li className="px-6 py-6 text-sm text-muted-foreground">Nothing outstanding.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
