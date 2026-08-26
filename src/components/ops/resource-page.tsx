import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  ShieldAlert,
  CheckCircle2,
  X,
  CheckSquare,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  exportDataAsCsv,
  useApprovePayment,
  useBulkApprovePayments,
  useBulkDeleteRows,
  useBulkUpdateRows,
  useCurrentUser,
  useDeleteRow,
  useRows,
  useSaveRow,
  type Row,
} from "@/lib/ops";
import {
  getModuleForTable,
  hasPermission,
  isUserPrimaryAdmin,
  type PermissionModuleId,
} from "@/lib/rbac";
import { PageHeader } from "./primitives";

export type Column = {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
  align?: "left" | "right";
};

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "month" | "textarea" | "select";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  colSpan?: 1 | 2;
};

export function DataTable({
  columns,
  rows,
  loading,
  onEdit,
  onDelete,
  onApprove,
  canApprove = false,
  empty = "No records yet.",
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  selectable = true,
}: {
  columns: Column[];
  rows: Row[];
  loading?: boolean | undefined;
  onEdit?: ((row: Row) => void) | undefined;
  onDelete?: ((row: Row) => void) | undefined;
  onApprove?: ((row: Row) => void) | undefined;
  canApprove?: boolean;
  empty?: string | undefined;
  selectedIds?: string[];
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selectable?: boolean;
}) {
  const hasActions = Boolean(onEdit || onDelete || onApprove);
  const validRows = useMemo(
    () => rows.filter((r) => r["id"] !== undefined && r["id"] !== null),
    [rows],
  );
  const allSelected =
    validRows.length > 0 && validRows.every((r) => selectedIds.includes(String(r["id"])));
  const isIndeterminate = selectedIds.length > 0 && !allSelected;

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60">
              {selectable && (
                <th className="w-10 px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected ? true : isIndeterminate ? "indeterminate" : false}
                    onCheckedChange={(checked) => {
                      if (onSelectAll) {
                        onSelectAll(Boolean(checked));
                      }
                    }}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {c.label}
                </th>
              ))}
              {hasActions ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowId =
                  row["id"] !== undefined && row["id"] !== null ? String(row["id"]) : null;
                const isSelected = rowId ? selectedIds.includes(rowId) : false;
                const isPendingPayment = row["status"] === "pending" && canApprove && onApprove;

                return (
                  <tr
                    key={rowId ?? JSON.stringify(row)}
                    className={`border-b border-border/70 last:border-0 transition-colors ${
                      isSelected
                        ? "bg-primary/8 hover:bg-primary/12 dark:bg-primary/15"
                        : "hover:bg-secondary/40"
                    }`}
                  >
                    {selectable && (
                      <td className="w-10 px-4 py-3 align-middle">
                        {rowId ? (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (onSelectRow) {
                                onSelectRow(rowId, Boolean(checked));
                              }
                            }}
                            aria-label={`Select row ${rowId}`}
                          />
                        ) : null}
                      </td>
                    )}
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-3 align-middle ${c.align === "right" ? "text-right tabular-nums" : ""}`}
                      >
                        {c.render ? c.render(row) : (row[c.key] ?? "—")}
                      </td>
                    ))}
                    {hasActions ? (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                          {isPendingPayment && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              onClick={() => onApprove(row)}
                            >
                              <CheckCircle2 className="mr-1 size-3.5" /> Approve
                            </Button>
                          )}
                          {onEdit ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => onEdit(row)}
                              aria-label="Edit"
                              title="Edit Record"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {onDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => onDelete(row)}
                              aria-label="Delete"
                              title="Delete Record"
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BulkUpdateDialog({
  open,
  onOpenChange,
  fields,
  count,
  onSubmit,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fields: Field[];
  count: number;
  onSubmit: (updates: Row) => void;
  saving?: boolean;
}) {
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>("");
  const [updateValue, setUpdateValue] = useState<any>("");

  const activeField = useMemo(
    () => fields.find((f) => f.key === selectedFieldKey),
    [fields, selectedFieldKey],
  );

  useEffect(() => {
    if (fields.length > 0 && !selectedFieldKey) {
      // Pick a meaningful default field (prefer status, category, platform, or first select/text field)
      const preferred =
        fields.find((f) => f.key === "status" || f.key === "category" || f.key === "platform") ||
        fields[0];
      if (preferred) {
        setSelectedFieldKey(preferred.key);
        setUpdateValue(preferred.defaultValue ?? "");
      }
    }
  }, [fields, selectedFieldKey, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-primary" />
            Bulk Update ({count} {count === 1 ? "record" : "records"})
          </DialogTitle>
          <DialogDescription>
            Choose a field to update across all {count} selected records simultaneously.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedFieldKey) return;
            const payload: Row = {};
            if (activeField?.type === "number") {
              payload[selectedFieldKey] =
                updateValue === "" || updateValue === undefined || updateValue === null
                  ? 0
                  : Number(updateValue);
            } else {
              payload[selectedFieldKey] = updateValue === "" ? null : updateValue;
            }
            onSubmit(payload);
          }}
        >
          <div className="space-y-2">
            <Label>Select Field to Update</Label>
            <Select
              value={selectedFieldKey}
              onValueChange={(key) => {
                setSelectedFieldKey(key);
                const f = fields.find((item) => item.key === key);
                setUpdateValue(f?.defaultValue ?? "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f.key} value={f.key}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeField && (
            <div className="space-y-2">
              <Label>New Value for {activeField.label}</Label>
              {activeField.type === "select" ? (
                <Select value={String(updateValue ?? "")} onValueChange={(v) => setUpdateValue(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new value" />
                  </SelectTrigger>
                  <SelectContent>
                    {(activeField.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : activeField.type === "textarea" ? (
                <Textarea
                  placeholder={activeField.placeholder ?? `Enter new ${activeField.label}`}
                  value={String(updateValue ?? "")}
                  onChange={(e) => setUpdateValue(e.target.value)}
                />
              ) : (
                <Input
                  type={
                    activeField.type === "number"
                      ? "number"
                      : activeField.type === "date" || activeField.type === "month"
                        ? "date"
                        : "text"
                  }
                  placeholder={activeField.placeholder ?? `Enter new ${activeField.label}`}
                  value={String(updateValue ?? "")}
                  onChange={(e) => setUpdateValue(e.target.value)}
                />
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !selectedFieldKey}>
              {saving ? "Updating..." : `Update ${count} Records`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordDialog({
  open,
  onOpenChange,
  fields,
  initial,
  title,
  onSubmit,
  saving,
  submitLabel = "Save record",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fields: Field[];
  initial: Row | null;
  title: string;
  onSubmit: (values: Row) => void;
  saving?: boolean | undefined;
  submitLabel?: string | undefined;
}) {
  const [values, setValues] = useState<Row>({});

  useEffect(() => {
    setValues({});
  }, [initial, open]);

  const current = useMemo(() => {
    const base: Row = {};
    for (const f of fields) {
      const raw = initial?.[f.key] ?? f.defaultValue ?? "";
      base[f.key] = raw === null ? "" : raw;
    }
    return { ...base, ...values };
  }, [fields, initial, values]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setValues({});
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const payload: Row = initial?.["id"] ? { id: initial["id"] } : {};
            for (const f of fields) {
              const v = current[f.key];
              if (f.type === "number") {
                payload[f.key] = v === "" || v === undefined || v === null ? 0 : Number(v);
              } else {
                payload[f.key] = v === "" ? null : v;
              }
            }
            onSubmit(payload);
          }}
        >
          {fields.map((f) => (
            <div
              key={f.key}
              className={
                f.type === "textarea" || f.colSpan === 2 ? "sm:col-span-2 space-y-2" : "space-y-2"
              }
            >
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === "select" ? (
                <Select
                  value={String(current[f.key] ?? "")}
                  onValueChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
                >
                  <SelectTrigger id={f.key}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea
                  id={f.key}
                  placeholder={f.placeholder ?? ""}
                  value={String(current[f.key] ?? "")}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={f.key}
                  type={
                    f.type === "number"
                      ? "number"
                      : f.type === "date" || f.type === "month"
                        ? "date"
                        : "text"
                  }
                  required={f.required}
                  placeholder={f.placeholder ?? ""}
                  value={String(current[f.key] ?? "")}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ResourcePage({
  title,
  description,
  table,
  columns,
  fields,
  select,
  order,
  filters,
  searchKeys = [],
  addLabel = "Add record",
  transform,
  headerExtra,
  readOnly,
  dialogTitle,
  submitLabel,
  moduleId: explicitModuleId,
  categoryFilter,
}: {
  title: string;
  description?: string | undefined;
  table: string;
  columns: Column[];
  fields: Field[];
  select?: string | undefined;
  order?: { column: string; ascending?: boolean } | undefined;
  filters?:
    Array<{ column: string; op: "eq" | "in" | "gte" | "lte" | "neq"; value: any }> | undefined;
  searchKeys?: string[] | undefined;
  addLabel?: string | undefined;
  transform?: ((rows: Row[]) => Row[]) | undefined;
  headerExtra?: ((rows: Row[]) => ReactNode) | undefined;
  readOnly?: boolean | undefined;
  dialogTitle?: string | undefined;
  submitLabel?: string | undefined;
  moduleId?: PermissionModuleId;
  categoryFilter?: string;
}) {
  const { data: currentUser } = useCurrentUser();
  const moduleId = explicitModuleId || getModuleForTable(table, categoryFilter);

  const canView = isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, moduleId, "view");
  const canAdd =
    !readOnly && (isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, moduleId, "add"));
  const canUpdate =
    !readOnly &&
    (isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, moduleId, "update"));
  const canDelete =
    !readOnly &&
    (isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, moduleId, "delete"));
  const canExport =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, moduleId, "export");
  const canApprove =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, moduleId, "approve");

  const {
    data = [],
    isLoading,
    error,
  } = useRows(table, {
    select,
    order,
    filters,
    categoryFilter,
  });

  const save = useSaveRow(table, categoryFilter);
  const remove = useDeleteRow(table, categoryFilter);
  const bulkRemove = useBulkDeleteRows(table, categoryFilter);
  const bulkUpdate = useBulkUpdateRows(table, categoryFilter);
  const approve = useApprovePayment();
  const bulkApprove = useBulkApprovePayments();

  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const rows = useMemo(() => {
    const list = transform ? transform(data) : data;
    if (!term.trim() || searchKeys.length === 0) return list;
    const q = term.toLowerCase();
    return list.filter((r) =>
      searchKeys.some((k) =>
        String(r[k] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, term, transform, searchKeys]);

  const selectedRows = useMemo(
    () => rows.filter((r) => r["id"] && selectedIds.includes(String(r["id"]))),
    [rows, selectedIds],
  );

  const pendingSelectedPayments = useMemo(
    () => selectedRows.filter((r) => r["status"] === "pending"),
    [selectedRows],
  );

  const handleSelectRow = (id: string, isSelected: boolean) => {
    setSelectedIds((prev) =>
      isSelected ? Array.from(new Set([...prev, id])) : prev.filter((i) => i !== id),
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const validVisibleIds = rows
        .map((r) => (r["id"] !== undefined && r["id"] !== null ? String(r["id"]) : ""))
        .filter(Boolean);
      setSelectedIds(Array.from(new Set([...selectedIds, ...validVisibleIds])));
    } else {
      const visibleIdSet = new Set(
        rows.map((r) => (r["id"] !== undefined && r["id"] !== null ? String(r["id"]) : "")),
      );
      setSelectedIds((prev) => prev.filter((id) => !visibleIdSet.has(id)));
    }
  };

  const handleExportSelected = () => {
    if (selectedRows.length === 0) return;
    exportDataAsCsv(
      selectedRows,
      `${title}-selected-${selectedRows.length}`,
      `${title} (Selected)`,
      moduleId,
    );
  };

  const handleBulkApprove = () => {
    if (pendingSelectedPayments.length === 0) return;
    bulkApprove.mutate(pendingSelectedPayments, {
      onSuccess: () => {
        setSelectedIds([]);
      },
    });
  };

  if (!canView || error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <ShieldAlert className="mx-auto size-12 text-destructive mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Your user account ({currentUser?.role_name || "Sub-user"}) does not have permission to
          view the <strong>{title}</strong> module.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Contact the primary system administrator to request access.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    exportDataAsCsv(rows, title, title, moduleId);
  };

  return (
    <div className="relative space-y-6 pb-20">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            {canExport && rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-1.5 text-xs"
              >
                <Download className="size-3.5" /> Export CSV
              </Button>
            )}
            {canAdd && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                size="sm"
                className="gap-1.5 text-xs"
              >
                <Plus className="size-3.5" /> {addLabel}
              </Button>
            )}
          </div>
        }
      />

      {headerExtra ? headerExtra(rows) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {searchKeys.length > 0 ? (
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search…"
              className="pl-9"
            />
          </div>
        ) : (
          <div />
        )}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{selectedIds.length}</span> of{" "}
            <span>{rows.length}</span> selected
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-primary"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        canApprove={canApprove}
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onApprove={canApprove ? (row) => approve.mutate(row) : undefined}
        onEdit={
          canUpdate
            ? (row) => {
                setEditing(row);
                setOpen(true);
              }
            : undefined
        }
        onDelete={canDelete ? (row) => setPendingDelete(row) : undefined}
      />

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex max-w-[92vw] flex-wrap items-center gap-2 rounded-2xl bg-foreground/95 px-4 py-2.5 text-background shadow-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-white/20">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {selectedIds.length}
            </span>
            <span className="text-xs font-medium text-background whitespace-nowrap">
              {selectedIds.length} {selectedIds.length === 1 ? "selected" : "selected"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {canUpdate && fields.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1.5"
                onClick={() => setBulkEditOpen(true)}
              >
                <SlidersHorizontal className="size-3.5" /> Bulk Update
              </Button>
            )}

            {canApprove && pendingSelectedPayments.length > 0 && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                onClick={handleBulkApprove}
                disabled={bulkApprove.isPending}
              >
                <CheckCircle2 className="size-3.5" /> Approve ({pendingSelectedPayments.length})
              </Button>
            )}

            {canExport && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5 text-background/90 hover:text-background hover:bg-white/15"
                onClick={handleExportSelected}
              >
                <Download className="size-3.5" /> Export Selected
              </Button>
            )}

            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs gap-1.5"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" /> Bulk Delete
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-7 size-7 p-0 text-background/70 hover:text-background hover:bg-white/15 ml-1"
              onClick={() => setSelectedIds([])}
              aria-label="Clear Selection"
              title="Clear Selection"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {canUpdate && (
        <BulkUpdateDialog
          open={bulkEditOpen}
          onOpenChange={setBulkEditOpen}
          fields={fields}
          count={selectedIds.length}
          saving={bulkUpdate.isPending}
          onSubmit={(updates) => {
            bulkUpdate.mutate(
              { ids: selectedIds, updates },
              {
                onSuccess: () => {
                  setBulkEditOpen(false);
                  setSelectedIds([]);
                },
              },
            );
          }}
        />
      )}

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete {selectedIds.length} records?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete these {selectedIds.length} selected
              records? This action cannot be undone and will remove all linked data from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={bulkRemove.isPending}
              onClick={() => {
                bulkRemove.mutate(
                  { ids: selectedIds },
                  {
                    onSuccess: () => {
                      setBulkDeleteOpen(false);
                      setSelectedIds([]);
                    },
                  },
                );
              }}
            >
              {bulkRemove.isPending ? "Deleting..." : `Delete ${selectedIds.length} Records`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Record Dialog */}
      {canAdd || canUpdate ? (
        <RecordDialog
          open={open}
          onOpenChange={setOpen}
          fields={fields}
          initial={editing}
          saving={save.isPending}
          title={editing ? `Edit ${title.replace(/s$/, "")}` : (dialogTitle ?? addLabel)}
          submitLabel={submitLabel ?? "Save record"}
          onSubmit={(values) =>
            save.mutate(values, {
              onSuccess: () => {
                setOpen(false);
                setEditing(null);
              },
            })
          }
        />
      ) : null}

      {/* Single Delete Dialog */}
      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record and any linked history from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete?.["id"]) {
                  remove.mutate({
                    id: pendingDelete["id"],
                    title: pendingDelete["name"] || pendingDelete["title"],
                  });
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
