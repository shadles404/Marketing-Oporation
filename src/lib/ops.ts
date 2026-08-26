import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser, recordAuditLog } from "@/integrations/supabase/mock-client";
import {
  getModuleForTable,
  hasPermission,
  isUserPrimaryAdmin,
  getAllPossiblePermissions,
  ROLE_PRESETS,
  type AppUser,
  type PermissionAction,
  type PermissionModuleId,
} from "./rbac";

export type Row = Record<string, any>;

export type ListOptions = {
  select?: string | undefined;
  order?: { column: string; ascending?: boolean } | undefined;
  filters?:
    Array<{ column: string; op: "eq" | "in" | "gte" | "lte" | "neq"; value: any }> | undefined;
  categoryFilter?: string | undefined;
};

export function useCurrentUser() {
  return useQuery<AppUser>({
    queryKey: ["current_user"],
    queryFn: async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) {
          return getCurrentUser();
        }

        // Try reading user profile from supabase profiles or users table
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const { data: userRow } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email || "")
          .maybeSingle();

        const email = user.email || "user@marketing-ops.com";
        const fullName =
          profile?.full_name ||
          userRow?.full_name ||
          user.user_metadata?.full_name ||
          email.split("@")[0] ||
          "Workspace Admin";

        const roleName =
          userRow?.role_name ||
          profile?.role ||
          (user.user_metadata?.role_name as string) ||
          (user.user_metadata?.role as string) ||
          "Super Admin";

        const isPrimary = Boolean(
          userRow?.is_primary_admin ??
          profile?.is_primary_admin ??
          user.user_metadata?.is_primary_admin ??
          (roleName === "Super Admin" && !userRow && email === "admin@marketing-ops.com"),
        );

        // Resolve permissions
        let perms = userRow?.permissions || profile?.permissions || user.user_metadata?.permissions;

        if (!perms || Object.keys(perms).length === 0) {
          if (isPrimary || roleName === "Super Admin") {
            perms = getAllPossiblePermissions();
          } else {
            const preset = ROLE_PRESETS.find((r) => r.name === roleName || r.id === roleName);
            perms = preset ? preset.getPermissions() : { "dashboard:view": true };
          }
        }

        return {
          id: user.id,
          username:
            userRow?.username || user.user_metadata?.username || email.split("@")[0] || "admin",
          email,
          full_name: fullName,
          role_name: roleName,
          status: userRow?.status || user.user_metadata?.status || "active",
          is_primary_admin: isPrimary,
          avatar_url: (user.user_metadata?.avatar_url as any) || userRow?.avatar_url || null,
          phone: userRow?.phone || user.user_metadata?.phone || null,
          permissions: perms,
          created_at: user.created_at || new Date().toISOString(),
        } as AppUser;
      } catch {
        return getCurrentUser();
      }
    },
    staleTime: 5000,
  });
}

function sanitizeRowPayload(table: string, values: Row, categoryFilter?: string): Row {
  const clean: Row = { ...values };

  // Remove empty string IDs or undefined keys
  Object.keys(clean).forEach((k) => {
    if (clean[k] === undefined) delete clean[k];
  });

  if (table === "influencers") {
    if (!clean["platform"]) clean["platform"] = "tiktok";
    if (clean["followers"] === undefined || clean["followers"] === null) clean["followers"] = 0;
    if (clean["rate"] === undefined || clean["rate"] === null) clean["rate"] = 0;
    if (clean["target_videos_month"] === undefined || clean["target_videos_month"] === null)
      clean["target_videos_month"] = 0;
    if (!clean["status"]) clean["status"] = "active";
  } else if (table === "billboards") {
    if (!clean["status"]) clean["status"] = "active";
    if (clean["monthly_rate"] === undefined || clean["monthly_rate"] === null)
      clean["monthly_rate"] = 0;
  } else if (table === "lcd_screens") {
    if (!clean["status"]) clean["status"] = "active";
    if (clean["monthly_rate"] === undefined || clean["monthly_rate"] === null)
      clean["monthly_rate"] = 0;
    if (clean["slot_seconds"] === undefined || clean["slot_seconds"] === null)
      clean["slot_seconds"] = 15;
  } else if (table === "lcd_videos") {
    if (!clean["status"]) clean["status"] = "running";
    if (clean["duration_seconds"] === undefined || clean["duration_seconds"] === null)
      clean["duration_seconds"] = 15;
    if (clean["daily_plays"] === undefined || clean["daily_plays"] === null)
      clean["daily_plays"] = 0;
  } else if (table === "budgets") {
    if (!clean["scope"]) clean["scope"] = "local";
    if (!clean["currency"]) clean["currency"] = "USD";
    if (clean["allocated"] === undefined || clean["allocated"] === null) clean["allocated"] = 0;
  } else if (table === "expenses") {
    if (clean["amount"] === undefined || clean["amount"] === null) clean["amount"] = 0;
  } else if (table === "payments") {
    if (!clean["category"]) clean["category"] = categoryFilter || "influencer";
    if (!clean["currency"]) clean["currency"] = "USD";
    if (!clean["status"]) clean["status"] = "pending";
    if (clean["amount"] === undefined || clean["amount"] === null) clean["amount"] = 0;
  }

  return clean;
}

export function useRows(table: string, options: ListOptions = {}) {
  return useQuery({
    queryKey: [table, options],
    queryFn: async () => {
      const currentUser = getCurrentUser();
      const moduleId = getModuleForTable(table, options.categoryFilter);

      // Enforce backend/data-level view permission check
      if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "view")) {
        throw new Error(`Permission Denied: You do not have view access to ${moduleId}.`);
      }

      let query = supabase.from(table as any).select(options.select ?? "*");
      for (const f of options.filters ?? []) {
        query = (query as any)[f.op](f.column, f.value);
      }
      const order = options.order ?? { column: "created_at", ascending: false };
      query = query.order(order.column, { ascending: order.ascending ?? false });
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useSaveRow(table: string, categoryFilter?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row) => {
      const currentUser = getCurrentUser();
      const moduleId = getModuleForTable(table, categoryFilter);
      const isUpdate = Boolean(values.id);
      const requiredAction: PermissionAction = isUpdate ? "update" : "add";

      // Enforce backend/data-level permission check
      if (
        !isUserPrimaryAdmin(currentUser) &&
        !hasPermission(currentUser, moduleId, requiredAction)
      ) {
        throw new Error(
          `Permission Denied: You lack '${requiredAction}' permission on '${moduleId}'.`,
        );
      }

      const sanitized = sanitizeRowPayload(table, values, categoryFilter);
      const { id, ...rest } = sanitized;

      const recordTitle =
        sanitized.name ||
        sanitized.title ||
        sanitized.full_name ||
        sanitized.payee ||
        sanitized.invoice_number ||
        sanitized.description ||
        `Record ${id || "new"}`;

      if (id) {
        // Fetch previous record for audit log diff
        const { data: previousRows } = await supabase
          .from(table as any)
          .select("*")
          .eq("id", id);
        const previousRow = previousRows?.[0] || null;

        const { error } = await supabase
          .from(table as any)
          .update(rest)
          .eq("id", id);
        if (error) throw error;

        // Record update audit log
        recordAuditLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_email: currentUser.email,
          action: "UPDATE",
          module: formatModuleName(moduleId),
          record_id: id,
          record_title: String(recordTitle),
          details: `Updated ${formatModuleName(moduleId)} record '${recordTitle}'`,
          previous_value: previousRow,
          new_value: rest,
          ip_address: "192.168.1.10",
          device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });
      } else {
        const { data: inserted, error } = await supabase.from(table as any).insert(rest);
        if (error) throw error;

        const newId = inserted?.[0]?.id || `rec-${Date.now()}`;
        recordAuditLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_email: currentUser.email,
          action: "CREATE",
          module: formatModuleName(moduleId),
          record_id: newId,
          record_title: String(recordTitle),
          details: `Created new ${formatModuleName(moduleId)} record '${recordTitle}'`,
          new_value: rest,
          ip_address: "192.168.1.10",
          device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Saved successfully");
    },
    onError: (e: any) => {
      console.error("[useSaveRow Error]", e);
      toast.error(e.message ?? "Could not save");
    },
  });
}

export function useDeleteRow(table: string, categoryFilter?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title?: string }) => {
      const currentUser = getCurrentUser();
      const moduleId = getModuleForTable(table, categoryFilter);

      // Enforce backend/data-level permission check
      if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "delete")) {
        throw new Error(`Permission Denied: You lack 'delete' permission on '${moduleId}'.`);
      }

      const { data: previousRows } = await supabase
        .from(table as any)
        .select("*")
        .eq("id", id);
      const previousRow = previousRows?.[0] || null;

      const recordTitle =
        title ||
        previousRow?.name ||
        previousRow?.title ||
        previousRow?.full_name ||
        previousRow?.payee ||
        id;

      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq("id", id);
      if (error) throw error;

      recordAuditLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        action: "DELETE",
        module: formatModuleName(moduleId),
        record_id: id,
        record_title: String(recordTitle),
        details: `Deleted ${formatModuleName(moduleId)} record '${recordTitle}'`,
        previous_value: previousRow,
        ip_address: "192.168.1.10",
        device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Deleted successfully");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not delete"),
  });
}

export function useBulkDeleteRows(table: string, categoryFilter?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      titles = {},
    }: {
      ids: string[];
      titles?: Record<string, string>;
    }) => {
      if (!ids.length) return;
      const currentUser = getCurrentUser();
      const moduleId = getModuleForTable(table, categoryFilter);

      if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "delete")) {
        throw new Error(`Permission Denied: You lack 'delete' permission on '${moduleId}'.`);
      }

      // Fetch all targets for audit log
      const { data: previousRows } = await supabase
        .from(table as any)
        .select("*")
        .in("id", ids);

      const { error } = await supabase
        .from(table as any)
        .delete()
        .in("id", ids);
      if (error) throw error;

      // Record audit logs
      ids.forEach((id) => {
        const prev = previousRows?.find((r) => String(r.id) === String(id));
        const recordTitle =
          titles[id] || prev?.name || prev?.title || prev?.full_name || prev?.payee || id;
        recordAuditLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_email: currentUser.email,
          action: "DELETE",
          module: formatModuleName(moduleId),
          record_id: id,
          record_title: String(recordTitle),
          details: `Bulk deleted ${formatModuleName(moduleId)} record '${recordTitle}'`,
          previous_value: prev,
          ip_address: "192.168.1.10",
          device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });
      });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries();
      toast.success(`Successfully deleted ${variables.ids.length} records`);
    },
    onError: (e: any) => toast.error(e.message ?? "Could not delete selected records"),
  });
}

export function useBulkUpdateRows(table: string, categoryFilter?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Row }) => {
      if (!ids.length) return;
      const currentUser = getCurrentUser();
      const moduleId = getModuleForTable(table, categoryFilter);

      if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "update")) {
        throw new Error(`Permission Denied: You lack 'update' permission on '${moduleId}'.`);
      }

      const sanitizedUpdates = sanitizeRowPayload(table, updates, categoryFilter);
      // Remove id from updates
      delete sanitizedUpdates.id;

      // Fetch all targets for audit log
      const { data: previousRows } = await supabase
        .from(table as any)
        .select("*")
        .in("id", ids);

      const { error } = await supabase
        .from(table as any)
        .update(sanitizedUpdates)
        .in("id", ids);
      if (error) throw error;

      ids.forEach((id) => {
        const prev = previousRows?.find((r) => String(r.id) === String(id));
        const recordTitle = prev?.name || prev?.title || prev?.full_name || prev?.payee || id;
        recordAuditLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_email: currentUser.email,
          action: "UPDATE",
          module: formatModuleName(moduleId),
          record_id: id,
          record_title: String(recordTitle),
          details: `Bulk updated ${formatModuleName(moduleId)} record '${recordTitle}'`,
          previous_value: prev,
          new_value: sanitizedUpdates,
          ip_address: "192.168.1.10",
          device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });
      });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries();
      toast.success(`Successfully updated ${variables.ids.length} records`);
    },
    onError: (e: any) => toast.error(e.message ?? "Could not update selected records"),
  });
}

export function useBulkApprovePayments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payments: Row[]) => {
      if (!payments.length) return;
      const currentUser = getCurrentUser();
      const moduleId = "payments";

      if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "approve")) {
        throw new Error("Permission Denied: You lack 'approve' permission for payments.");
      }

      for (const payment of payments) {
        const paymentId = String(payment.id);
        const { error: updateErr } = await supabase
          .from("payments")
          .update({
            status: "approved",
            approved_by: currentUser.full_name || currentUser.email,
            approved_at: new Date().toISOString(),
          })
          .eq("id", paymentId);
        if (updateErr) throw updateErr;

        // Create linked expense
        const cat = payment["category"] ?? "general";
        const desc = payment["description"] ?? `Payment to ${payment["payee"] ?? "vendor"}`;
        const amt = Number(payment["amount"] ?? 0);
        const dateStr = payment["invoice_date"] ?? new Date().toISOString().slice(0, 10);

        const { error: expErr } = await supabase.from("expenses").insert({
          category: cat,
          description: desc,
          amount: amt,
          expense_date: dateStr,
          payment_id: paymentId,
        });
        if (expErr) throw expErr;

        recordAuditLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_email: currentUser.email,
          action: "UPDATE",
          module: "Payments",
          record_id: paymentId,
          record_title: String(payment.invoice_number || payment.payee || paymentId),
          details: `Approved payment of $${amt.toLocaleString()} to ${payment.payee || "payee"}`,
          ip_address: "192.168.1.10",
          device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
        });
      }
    },
    onSuccess: (_, payments) => {
      qc.invalidateQueries();
      toast.success(`Successfully approved ${payments.length} payments`);
    },
    onError: (e: any) => toast.error(e.message ?? "Could not approve payments"),
  });
}

export function useApprovePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Row) => {
      const currentUser = getCurrentUser();
      const moduleId: PermissionModuleId =
        payment.category === "influencer"
          ? "influencer_payments"
          : payment.category === "billboard"
            ? "billboard_payments"
            : payment.category === "lcd"
              ? "lcd_payments"
              : "payments";

      if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "approve")) {
        throw new Error(`Permission Denied: You lack 'approve' permission on '${moduleId}'.`);
      }

      const { error } = await supabase
        .from("payments")
        .update({ status: "approved" })
        .eq("id", payment.id);

      if (error) throw error;

      recordAuditLog({
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        action: "APPROVE",
        module: "Payments",
        record_id: payment.id,
        record_title: payment.invoice_number || payment.payee || payment.id,
        details: `Approved payment ${payment.invoice_number || payment.id} for ${payment.payee} (${currency(payment.amount)})`,
        previous_value: { status: payment.status },
        new_value: { status: "approved" },
        ip_address: "192.168.1.10",
        device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Payment approved successfully");
    },
    onError: (e: any) => toast.error(e.message ?? "Approval failed"),
  });
}

export function exportDataAsCsv(
  rows: Row[],
  filename: string,
  moduleName: string,
  moduleId: PermissionModuleId,
) {
  const currentUser = getCurrentUser();
  if (!isUserPrimaryAdmin(currentUser) && !hasPermission(currentUser, moduleId, "export")) {
    toast.error(`Permission Denied: You lack export permission for ${moduleName}.`);
    return;
  }

  if (!rows || rows.length === 0) {
    toast.error("No records available to export.");
    return;
  }

  try {
    // Generate CSV content
    const keys = Object.keys(rows[0]!).filter(
      (k) => !["permissions", "password"].includes(k) && typeof rows[0]![k] !== "object",
    );
    const headerRow = keys.join(",");
    const csvRows = rows.map((r) =>
      keys
        .map((k) => {
          const val = r[k] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(","),
    );

    const csvContent = [headerRow, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record audit log
    recordAuditLog({
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_email: currentUser.email,
      action: "EXPORT",
      module: moduleName,
      record_id: null,
      record_title: filename,
      details: `Exported ${rows.length} records as CSV (${filename})`,
      ip_address: "192.168.1.10",
      device: typeof navigator !== "undefined" ? navigator.userAgent : "Browser",
    });

    toast.success(`Exported ${rows.length} records successfully.`);
  } catch (err: any) {
    toast.error(err.message || "Failed to export data");
  }
}

function formatModuleName(modId: string): string {
  return modId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const currency = (value: number | null | undefined, code = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const compact = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(value ?? 0),
  );

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const monthLabel = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—";
