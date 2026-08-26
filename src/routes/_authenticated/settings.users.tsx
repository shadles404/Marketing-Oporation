import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  KeyRound,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Download,
  SlidersHorizontal,
  X,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCurrentUser,
  useDeleteRow,
  useBulkDeleteRows,
  useBulkUpdateRows,
  useRows,
  useSaveRow,
  formatDateTime,
  exportDataAsCsv,
} from "@/lib/ops";
import { hasPermission, isUserPrimaryAdmin, ROLE_PRESETS, type AppUser } from "@/lib/rbac";
import { UserModal } from "@/components/ops/user-modal";
import { ResetPasswordDialog } from "@/components/ops/reset-password-dialog";
import { UserActivityDialog } from "@/components/ops/user-activity-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings/users")({
  component: UsersManagementPage,
});

function UsersManagementPage() {
  const qc = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const canView = isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "view");
  const canAdd = isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "add");
  const canUpdate =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "update");
  const canDelete =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "delete");
  const canExport =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "export");

  const { data: users = [], isLoading } = useRows("users", {
    order: { column: "created_at", ascending: false },
  });

  const saveUser = useSaveRow("users");
  const deleteUser = useDeleteRow("users");
  const bulkDeleteUsers = useBulkDeleteRows("users");
  const bulkUpdateUsers = useBulkUpdateRows("users");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [targetResetUser, setTargetResetUser] = useState<AppUser | null>(null);

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [targetActivityUser, setTargetActivityUser] = useState<AppUser | null>(null);

  const [pendingDeleteUser, setPendingDeleteUser] = useState<AppUser | null>(null);

  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);
  const [selectedBulkRole, setSelectedBulkRole] = useState<string>("Marketing Manager");
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Toggle user active status
  const handleToggleStatus = (user: AppUser) => {
    if (user.is_primary_admin) {
      toast.error("The Primary Admin account cannot be deactivated.");
      return;
    }
    const newStatus = user.status === "active" ? "inactive" : "active";
    saveUser.mutate(
      { id: user.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`User '${user.full_name}' is now ${newStatus}.`);
        },
      },
    );
  };

  // Reset password
  const handleResetPassword = async (userId: string, newPass: string) => {
    await saveUser.mutateAsync({ id: userId, password: newPass });
    toast.success("Password reset successfully.");
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u: AppUser) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm));

      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesRole = roleFilter === "all" || u.role_name === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const selectedUsers = useMemo(() => {
    return users.filter((u: AppUser) => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  const nonPrimarySelectedUsers = useMemo(() => {
    return selectedUsers.filter((u: AppUser) => !u.is_primary_admin);
  }, [selectedUsers]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u: AppUser) => u.status === "active").length;
  const inactiveUsers = users.filter((u: AppUser) => u.status !== "active").length;
  const uniqueRoles = Array.from(new Set(users.map((u: AppUser) => u.role_name)));

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u: AppUser) => selectedUserIds.includes(u.id));
  const isIndeterminate = selectedUserIds.length > 0 && !allFilteredSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredUsers.map((u: AppUser) => u.id);
      setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...allIds])));
    } else {
      const filteredIdSet = new Set(filteredUsers.map((u: AppUser) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((prev) =>
      checked ? Array.from(new Set([...prev, userId])) : prev.filter((id) => id !== userId),
    );
  };

  const handleBulkActivate = () => {
    const targetIds = nonPrimarySelectedUsers.map((u) => u.id);
    if (!targetIds.length) {
      toast.error("No eligible accounts to activate.");
      return;
    }
    bulkUpdateUsers.mutate(
      { ids: targetIds, updates: { status: "active" } },
      {
        onSuccess: () => {
          setSelectedUserIds([]);
        },
      },
    );
  };

  const handleBulkDeactivate = () => {
    const targetIds = nonPrimarySelectedUsers.map((u) => u.id);
    if (!targetIds.length) {
      toast.error("No eligible accounts to deactivate.");
      return;
    }
    bulkUpdateUsers.mutate(
      { ids: targetIds, updates: { status: "inactive" } },
      {
        onSuccess: () => {
          setSelectedUserIds([]);
        },
      },
    );
  };

  const handleBulkChangeRole = () => {
    const targetIds = nonPrimarySelectedUsers.map((u) => u.id);
    if (!targetIds.length) {
      toast.error("Primary Admin role cannot be modified.");
      return;
    }
    const preset = ROLE_PRESETS.find(
      (p) => p.name === selectedBulkRole || p.id === selectedBulkRole,
    );
    const updates: any = {
      role_name: selectedBulkRole,
    };
    if (preset) {
      updates.permissions = preset.getPermissions();
    }

    bulkUpdateUsers.mutate(
      { ids: targetIds, updates },
      {
        onSuccess: () => {
          setIsBulkRoleModalOpen(false);
          setSelectedUserIds([]);
        },
      },
    );
  };

  const handleExportSelectedUsers = () => {
    if (!selectedUsers.length) return;
    exportDataAsCsv(
      selectedUsers,
      `Team_Users_Selected_${selectedUsers.length}`,
      "Users & Roles (Selected)",
      "users",
    );
  };

  if (!canView) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <Shield className="mx-auto size-12 text-destructive mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Your current account does not have permission to view or manage system users.
        </p>
      </div>
    );
  }

  const handleExportUsers = () => {
    exportDataAsCsv(filteredUsers, "Team_Users_Roster", "Users & Roles", "users");
  };

  return (
    <div className="relative space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
            <Users className="size-6 text-primary" /> Users & Team Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create sub-user accounts, configure granular module permissions, reset credentials, and
            monitor audit activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportUsers}
              className="gap-1.5 text-xs"
            >
              <Download className="size-3.5" /> Export Roster
            </Button>
          )}
          {canAdd && (
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              size="sm"
              className="gap-1.5 text-xs"
            >
              <UserPlus className="size-3.5" /> Add Sub-User
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Total Team Accounts</span>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalUsers}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Active Users
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{activeUsers}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Inactive / Suspended
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{inactiveUsers}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
            Configured Roles
          </span>
          <p className="mt-1 text-2xl font-bold text-foreground">{uniqueRoles.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, email, phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pr-2 border-r border-border">
              <span className="font-medium text-foreground">{selectedUserIds.length}</span> selected
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-primary"
                onClick={() => setSelectedUserIds([])}
              >
                Clear
              </Button>
            </div>
          )}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Active Only
              </SelectItem>
              <SelectItem value="inactive" className="text-xs">
                Inactive Only
              </SelectItem>
              <SelectItem value="suspended" className="text-xs">
                Suspended Only
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-44 text-xs">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Roles
              </SelectItem>
              {uniqueRoles.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="w-10 px-4 py-3 text-left">
                  <Checkbox
                    checked={allFilteredSelected ? true : isIndeterminate ? "indeterminate" : false}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    aria-label="Select all users"
                  />
                </th>
                <th className="px-4 py-3">User & Identity</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Role & Permissions</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Loading team accounts…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: AppUser) => {
                  const isCurrent = currentUser?.id === user.id;
                  const isSelected = selectedUserIds.includes(user.id);
                  const permCount = Object.values(user.permissions || {}).filter(Boolean).length;

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-primary/8 hover:bg-primary/12 dark:bg-primary/15"
                          : isCurrent
                            ? "bg-primary/[0.04] hover:bg-secondary/40"
                            : "hover:bg-secondary/30"
                      }`}
                    >
                      <td className="w-10 px-4 py-3.5 align-middle">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectUser(user.id, Boolean(checked))}
                          aria-label={`Select user ${user.full_name}`}
                        />
                      </td>

                      {/* User & Identity */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 border border-border">
                            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                            <AvatarFallback>
                              {user.full_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground">
                                {user.full_name}
                              </span>
                              {user.is_primary_admin && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                                >
                                  Primary Admin
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-primary/10 text-primary border-primary/30"
                                >
                                  Current User
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col text-xs">
                          <span className="text-foreground font-medium">{user.email}</span>
                          <span className="text-muted-foreground">{user.phone || "—"}</span>
                        </div>
                      </td>

                      {/* Role & Permissions */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="secondary" className="font-medium text-xs">
                            {user.role_name}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {user.is_primary_admin
                              ? "All 39 Permissions Granted"
                              : `${permCount} Granular Actions Active`}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        {user.status === "active" ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100">
                            Active
                          </Badge>
                        ) : user.status === "inactive" ? (
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            Inactive
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            Suspended
                          </Badge>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {formatDateTime(user.last_login_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                Actions ▾
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel className="text-xs">
                                User Operations
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {canUpdate && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingUser(user);
                                    setIsUserModalOpen(true);
                                  }}
                                  className="text-xs gap-2"
                                >
                                  <Edit className="size-4 text-blue-600" /> Edit & Permissions
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => {
                                  setTargetActivityUser(user);
                                  setIsActivityOpen(true);
                                }}
                                className="text-xs gap-2"
                              >
                                <Activity className="size-4 text-amber-600" /> View User Activity
                              </DropdownMenuItem>

                              {canUpdate && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTargetResetUser(user);
                                    setIsResetPassOpen(true);
                                  }}
                                  className="text-xs gap-2"
                                >
                                  <KeyRound className="size-4 text-indigo-600" /> Reset Password
                                </DropdownMenuItem>
                              )}

                              {canUpdate && !user.is_primary_admin && (
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(user)}
                                  className="text-xs gap-2"
                                >
                                  {user.status === "active" ? (
                                    <>
                                      <UserX className="size-4 text-orange-600" /> Deactivate
                                      Account
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="size-4 text-emerald-600" /> Activate
                                      Account
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}

                              {canDelete && !user.is_primary_admin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setPendingDeleteUser(user)}
                                    className="text-xs gap-2 text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="size-4" /> Delete Account
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Floating Bulk Actions Bar */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex max-w-[92vw] flex-wrap items-center gap-2 rounded-2xl bg-foreground/95 px-4 py-2.5 text-background shadow-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-white/20">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {selectedUserIds.length}
            </span>
            <span className="text-xs font-medium text-background whitespace-nowrap">
              {selectedUserIds.length} {selectedUserIds.length === 1 ? "user" : "users"} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {canUpdate && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs gap-1.5 bg-emerald-700/80 hover:bg-emerald-700 text-white border-0"
                  onClick={handleBulkActivate}
                  disabled={bulkUpdateUsers.isPending}
                >
                  <UserCheck className="size-3.5" /> Activate
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs gap-1.5 bg-amber-700/80 hover:bg-amber-700 text-white border-0"
                  onClick={handleBulkDeactivate}
                  disabled={bulkUpdateUsers.isPending}
                >
                  <UserX className="size-3.5" /> Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => setIsBulkRoleModalOpen(true)}
                >
                  <SlidersHorizontal className="size-3.5" /> Change Role
                </Button>
              </>
            )}

            {canExport && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5 text-background/90 hover:text-background hover:bg-white/15"
                onClick={handleExportSelectedUsers}
              >
                <Download className="size-3.5" /> Export Selected
              </Button>
            )}

            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs gap-1.5"
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                <Trash2 className="size-3.5" /> Bulk Delete
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-7 size-7 p-0 text-background/70 hover:text-background hover:bg-white/15 ml-1"
              onClick={() => setSelectedUserIds([])}
              aria-label="Clear Selection"
              title="Clear Selection"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Change Role Modal */}
      <Dialog open={isBulkRoleModalOpen} onOpenChange={setIsBulkRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-primary" />
              Change Role for {nonPrimarySelectedUsers.length} Users
            </DialogTitle>
            <DialogDescription>
              Assign a new system role and permission preset across all selected user accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Select New Role Preset</Label>
              <Select value={selectedBulkRole} onValueChange={setSelectedBulkRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_PRESETS.filter((p) => p.name !== "Super Admin").map((preset) => (
                    <SelectItem key={preset.id} value={preset.name}>
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium">{preset.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {preset.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={bulkUpdateUsers.isPending} onClick={handleBulkChangeRole}>
              {bulkUpdateUsers.isPending
                ? "Updating…"
                : `Apply to ${nonPrimarySelectedUsers.length} Users`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Users Modal */}
      <AlertDialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete {nonPrimarySelectedUsers.length} Users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete these {nonPrimarySelectedUsers.length}{" "}
              sub-user accounts? This action cannot be undone. Primary Administrator accounts cannot
              be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteUsers.isPending}
              onClick={() => {
                const targetIds = nonPrimarySelectedUsers.map((u) => u.id);
                bulkDeleteUsers.mutate(
                  { ids: targetIds },
                  {
                    onSuccess: () => {
                      setIsBulkDeleteModalOpen(false);
                      setSelectedUserIds([]);
                    },
                  },
                );
              }}
            >
              {bulkDeleteUsers.isPending
                ? "Deleting…"
                : `Delete ${nonPrimarySelectedUsers.length} Accounts`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Create / Edit Modal */}
      <UserModal
        open={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        user={editingUser}
        saving={saveUser.isPending}
        onSave={async (userPayload) => {
          await saveUser.mutateAsync(userPayload);
        }}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={isResetPassOpen}
        onOpenChange={setIsResetPassOpen}
        user={targetResetUser}
        loading={saveUser.isPending}
        onReset={handleResetPassword}
      />

      {/* View User Activity Dialog */}
      <UserActivityDialog
        open={isActivityOpen}
        onOpenChange={setIsActivityOpen}
        user={targetActivityUser}
      />

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingDeleteUser)}
        onOpenChange={(v) => !v && setPendingDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user '{pendingDeleteUser?.full_name}'?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this sub-user account and remove all their configured
              permissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDeleteUser) {
                  deleteUser.mutate({
                    id: pendingDeleteUser.id,
                    title: pendingDeleteUser.full_name,
                  });
                }
                setPendingDeleteUser(null);
              }}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
