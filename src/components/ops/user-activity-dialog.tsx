import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRows, formatDateTime, type Row } from "@/lib/ops";
import type { AppUser, AuditLogEntry } from "@/lib/rbac";
import {
  Activity,
  Clock,
  ShieldAlert,
  FileText,
  CheckCircle2,
  UserCheck,
  Trash2,
} from "lucide-react";

interface UserActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser | null;
}

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

export function UserActivityDialog({ open, onOpenChange, user }: UserActivityDialogProps) {
  const { data: allLogs = [], isLoading } = useRows("audit_logs", {
    order: { column: "created_at", ascending: false },
  });

  const userLogs = user
    ? allLogs.filter((log: Row) => log.user_id === user.id || log.user_email === user.email)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-primary" /> Activity Log: {user?.full_name}
          </DialogTitle>
          <DialogDescription>
            Audit history of actions executed by <strong>{user?.full_name}</strong> ({user?.email})
            across all modules.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading activity history…
            </p>
          ) : userLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No recent audit activity recorded for this user.
            </div>
          ) : (
            <div className="relative space-y-3 pl-4 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-0.5 before:bg-border">
              {userLogs.map((log: AuditLogEntry) => {
                const Icon = ACTION_ICONS[log.action] || Activity;
                const badgeColor = ACTION_COLORS[log.action] || "bg-secondary text-foreground";
                return (
                  <div
                    key={log.id}
                    className="relative rounded-lg border border-border bg-card p-3.5 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${badgeColor}`}
                        >
                          <Icon className="mr-1 size-3" />
                          {log.action}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground">{log.module}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-foreground font-medium">{log.details}</p>

                    {(log.previous_value || log.new_value) && (
                      <div className="mt-2.5 rounded bg-secondary/60 p-2 text-[11px] font-mono text-muted-foreground">
                        {log.previous_value && (
                          <div className="text-destructive">
                            - Prev: {JSON.stringify(log.previous_value)}
                          </div>
                        )}
                        {log.new_value && (
                          <div className="text-emerald-600 dark:text-emerald-400">
                            + New: {JSON.stringify(log.new_value)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {log.device && (
                        <span className="truncate max-w-[240px]">Device: {log.device}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
