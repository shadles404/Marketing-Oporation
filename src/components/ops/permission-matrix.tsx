import { Fragment } from "react";
import {
  PERMISSION_MODULES,
  ROLE_PRESETS,
  makePermissionKey,
  type PermissionAction,
  type PermissionModuleId,
} from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCheck, XSquare } from "lucide-react";

interface PermissionMatrixProps {
  permissions: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  selectedRolePreset?: string;
  onRolePresetChange?: (roleName: string) => void;
  disabled?: boolean;
  isPrimaryAdmin?: boolean;
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  add: "Add",
  update: "Update",
  delete: "Delete",
  approve: "Approve",
  export: "Export",
};

const ALL_COLS: PermissionAction[] = ["view", "add", "update", "delete", "approve", "export"];

export function PermissionMatrix({
  permissions,
  onChange,
  selectedRolePreset = "Custom",
  onRolePresetChange,
  disabled = false,
  isPrimaryAdmin = false,
}: PermissionMatrixProps) {
  const handleToggle = (
    moduleId: PermissionModuleId,
    action: PermissionAction,
    checked: boolean,
  ) => {
    if (disabled || isPrimaryAdmin) return;
    const key = makePermissionKey(moduleId, action);
    const updated = { ...permissions, [key]: checked };
    onChange(updated);
    if (onRolePresetChange) onRolePresetChange("Custom");
  };

  const handleSelectModuleAll = (moduleId: PermissionModuleId) => {
    if (disabled || isPrimaryAdmin) return;
    const mod = PERMISSION_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;
    const updated = { ...permissions };
    for (const action of mod.actions) {
      updated[makePermissionKey(moduleId, action)] = true;
    }
    onChange(updated);
    if (onRolePresetChange) onRolePresetChange("Custom");
  };

  const handleClearModuleAll = (moduleId: PermissionModuleId) => {
    if (disabled || isPrimaryAdmin) return;
    const mod = PERMISSION_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;
    const updated = { ...permissions };
    for (const action of mod.actions) {
      updated[makePermissionKey(moduleId, action)] = false;
    }
    onChange(updated);
    if (onRolePresetChange) onRolePresetChange("Custom");
  };

  const handleSelectGlobalAll = () => {
    if (disabled || isPrimaryAdmin) return;
    const updated: Record<string, boolean> = {};
    for (const mod of PERMISSION_MODULES) {
      for (const action of mod.actions) {
        updated[makePermissionKey(mod.id, action)] = true;
      }
    }
    onChange(updated);
    if (onRolePresetChange) onRolePresetChange("Super Admin");
  };

  const handleClearGlobalAll = () => {
    if (disabled || isPrimaryAdmin) return;
    const updated: Record<string, boolean> = {};
    for (const mod of PERMISSION_MODULES) {
      for (const action of mod.actions) {
        updated[makePermissionKey(mod.id, action)] = false;
      }
    }
    onChange(updated);
    if (onRolePresetChange) onRolePresetChange("Custom");
  };

  const handlePresetSelect = (presetName: string) => {
    if (disabled || isPrimaryAdmin) return;
    if (onRolePresetChange) onRolePresetChange(presetName);
    const preset = ROLE_PRESETS.find((p) => p.id === presetName);
    if (preset) {
      onChange(preset.getPermissions());
    }
  };

  // Group modules by category
  const categories = Array.from(new Set(PERMISSION_MODULES.map((m) => m.category)));

  // Total active count
  const totalEnabled = Object.values(permissions).filter(Boolean).length;
  const totalPossible = PERMISSION_MODULES.reduce((acc, m) => acc + m.actions.length, 0);

  return (
    <div className="space-y-4">
      {/* Role Preset Selector & Quick Controls */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">Role Template:</span>
          <Select
            value={selectedRolePreset}
            onValueChange={handlePresetSelect}
            disabled={disabled || isPrimaryAdmin}
          >
            <SelectTrigger className="h-8 w-52 text-xs bg-background">
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            ({totalEnabled} of {totalPossible} actions granted)
          </span>
        </div>

        {!disabled && !isPrimaryAdmin && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleSelectGlobalAll}
            >
              <CheckCheck className="mr-1 size-3.5" /> Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleClearGlobalAll}
            >
              <XSquare className="mr-1 size-3.5" /> Clear All
            </Button>
          </div>
        )}
      </div>

      {isPrimaryAdmin && (
        <div className="rounded-md border border-purple-200 bg-purple-50 p-2.5 text-xs text-purple-900 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-200">
          <strong>Primary Admin Protection:</strong> This root administrative account maintains
          permanent full access to all system modules and actions.
        </div>
      )}

      {/* Permission Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-muted-foreground font-semibold">
              <th className="px-3.5 py-2.5">Module</th>
              {ALL_COLS.map((col) => (
                <th key={col} className="px-3 py-2.5 text-center uppercase tracking-wider">
                  {ACTION_LABELS[col]}
                </th>
              ))}
              {!disabled && !isPrimaryAdmin && (
                <th className="px-3 py-2.5 text-right">Quick Set</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {categories.map((category) => {
              const modulesInCategory = PERMISSION_MODULES.filter((m) => m.category === category);
              return (
                <Fragment key={category}>
                  <tr className="bg-secondary/40 font-semibold text-muted-foreground">
                    <td
                      colSpan={ALL_COLS.length + (disabled || isPrimaryAdmin ? 1 : 2)}
                      className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider text-primary"
                    >
                      {category}
                    </td>
                  </tr>
                  {modulesInCategory.map((mod) => {
                    const rowAllChecked = mod.actions.every((a) =>
                      Boolean(permissions[makePermissionKey(mod.id, a)]),
                    );
                    const rowAnyChecked = mod.actions.some((a) =>
                      Boolean(permissions[makePermissionKey(mod.id, a)]),
                    );

                    return (
                      <tr
                        key={mod.id}
                        className={`hover:bg-secondary/20 transition-colors ${
                          rowAnyChecked ? "bg-primary/[0.02]" : ""
                        }`}
                      >
                        <td className="px-3.5 py-2.5 font-medium text-foreground">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">
                              {mod.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {mod.description}
                            </span>
                          </div>
                        </td>

                        {ALL_COLS.map((col) => {
                          const isSupported = mod.actions.includes(col);
                          if (!isSupported) {
                            return (
                              <td
                                key={col}
                                className="px-3 py-2.5 text-center text-muted-foreground/40 font-mono"
                              >
                                —
                              </td>
                            );
                          }

                          const key = makePermissionKey(mod.id, col);
                          const isChecked = isPrimaryAdmin || Boolean(permissions[key]);

                          return (
                            <td key={col} className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  id={`perm-${key}`}
                                  checked={isChecked}
                                  disabled={disabled || isPrimaryAdmin}
                                  onCheckedChange={(val) => handleToggle(mod.id, col, Boolean(val))}
                                  aria-label={`${mod.label} ${ACTION_LABELS[col]}`}
                                />
                              </div>
                            </td>
                          );
                        })}

                        {!disabled && !isPrimaryAdmin && (
                          <td className="px-3 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleSelectModuleAll(mod.id)}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                                  rowAllChecked
                                    ? "text-muted-foreground bg-muted/40 cursor-default"
                                    : "text-primary hover:bg-primary/10"
                                }`}
                              >
                                All
                              </button>
                              <span className="text-border">|</span>
                              <button
                                type="button"
                                onClick={() => handleClearModuleAll(mod.id)}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                                  !rowAnyChecked
                                    ? "text-muted-foreground bg-muted/40 cursor-default"
                                    : "text-destructive hover:bg-destructive/10"
                                }`}
                              >
                                Clear
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
