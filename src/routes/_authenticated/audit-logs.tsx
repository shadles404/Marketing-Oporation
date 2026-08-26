import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Trash2,
  FileText,
  UserCheck,
  ShieldAlert,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser, useRows, formatDateTime, exportDataAsCsv } from "@/lib/ops";
import { hasPermission, isUserPrimaryAdmin, type AuditLogEntry } from "@/lib/rbac";

export const Route = createFileRoute("/_authenticated/audit-logs")({
  component: AuditLogsPage,
});

const ACTION_ICONS: Record<string, any> = {
  CREATE: CheckCircle2,
  UPDATE: Activity,
  DELETE: Trash2,
  APPROVE: CheckCircle2,
  EXPORT: FileText,
  LOGIN: UserCheck,
  PERMISSION_CHANGE: ShieldAlert,
  STATUS_CHANGE: ShieldAlert,
  PASSWORD_RESET: Clock,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  APPROVE: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  EXPORT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  LOGIN: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  PERMISSION_CHANGE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  STATUS_CHANGE: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  PASSWORD_RESET: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

function AuditLogsPage() {
  const { data: currentUser } = useCurrentUser();
  const canView =
    isUserPrimaryAdmin(currentUser) ||
    hasPermission(currentUser, "audit_logs", "view") ||
    hasPermission(currentUser, "users", "view");

  const canExport =
    isUserPrimaryAdmin(currentUser) ||
    hasPermission(currentUser, "audit_logs", "export") ||
    hasPermission(currentUser, "users", "export");

  const { data: logs = [], isLoading } = useRows("audit_logs", {
    order: { column: "created_at", ascending: false },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const uniqueModules = Array.from(
    new Set(logs.map((l: AuditLogEntry) => l.module).filter(Boolean)),
  );
  const uniqueActions = Array.from(
    new Set(logs.map((l: AuditLogEntry) => l.action).filter(Boolean)),
  );

  const filteredLogs = logs.filter((log: AuditLogEntry) => {
    const matchesSearch =
      (log.user_name && log.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.record_title && log.record_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

    return matchesSearch && matchesAction && matchesModule;
  });

  if (!canView) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <Shield className="mx-auto size-12 text-destructive mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Your current account does not have permission to view the system audit trail.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    exportDataAsCsv(filteredLogs, "System_Audit_Trail", "Audit Trail", "audit_logs");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
            <Activity className="size-6 text-primary" /> System Audit Trail & Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete immutable log of user creations, edits, approvals, permission changes, exports,
            and authentications.
          </p>
        </div>

        {canExport && filteredLogs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 text-xs self-start"
          >
            <Download className="size-3.5" /> Export Audit CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user, details, record title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Actions
              </SelectItem>
              {uniqueActions.map((a) => (
                <SelectItem key={a} value={a} className="text-xs">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Modules
              </SelectItem>
              {uniqueModules.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Details & State Diff</th>
                <th className="px-4 py-3">IP / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Loading audit events…
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No audit logs matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: AuditLogEntry) => {
                  const Icon = ACTION_ICONS[log.action] || Activity;
                  const badgeColor = ACTION_COLORS[log.action] || "bg-secondary text-foreground";

                  return (
                    <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">
                            {log.user_name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {log.user_email}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${badgeColor}`}
                        >
                          <Icon className="mr-1 size-3" />
                          {log.action}
                        </Badge>
                      </td>

                      {/* Module */}
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {log.module}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 text-xs max-w-md">
                        <p className="text-foreground">{log.details}</p>
                        {(log.previous_value || log.new_value) && (
                          <div className="mt-1.5 rounded bg-secondary/50 p-1.5 text-[10px] font-mono text-muted-foreground space-y-0.5">
                            {log.previous_value && (
                              <div className="text-destructive truncate">
                                <strong>Prev:</strong> {JSON.stringify(log.previous_value)}
                              </div>
                            )}
                            {log.new_value && (
                              <div className="text-emerald-600 dark:text-emerald-400 truncate">
                                <strong>New:</strong> {JSON.stringify(log.new_value)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* IP / Device */}
                      <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                        <div>{log.ip_address || "—"}</div>
                        <div
                          className="text-[10px] text-muted-foreground/70 truncate max-w-[140px]"
                          title={log.device}
                        >
                          {log.device || "—"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
