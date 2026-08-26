export type PermissionAction = "view" | "add" | "update" | "delete" | "approve" | "export";

export type PermissionModuleId =
  | "dashboard"
  | "influencers"
  | "influencer_targets"
  | "influencer_deliveries"
  | "influencer_payments"
  | "billboards"
  | "billboard_payments"
  | "lcd_screens"
  | "lcd_videos"
  | "lcd_payments"
  | "budget"
  | "expenses"
  | "payments"
  | "reports"
  | "users"
  | "audit_logs";

export interface PermissionModuleMeta {
  id: PermissionModuleId;
  label: string;
  category: string;
  description: string;
  actions: PermissionAction[];
  tableName?: string;
  routes: string[];
}

export interface AppUser {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string | null;
  password?: string;
  avatar_url?: string | null;
  role_name: string;
  is_primary_admin: boolean;
  status: "active" | "inactive" | "suspended";
  permissions: Record<string, boolean>; // key format: `${module}:${action}`
  last_login_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "APPROVE"
    | "EXPORT"
    | "LOGIN"
    | "PERMISSION_CHANGE"
    | "STATUS_CHANGE"
    | "PASSWORD_RESET";
  module: string;
  record_id?: string | null;
  record_title?: string | null;
  details: string;
  previous_value?: any;
  new_value?: any;
  ip_address?: string;
  device?: string;
  created_at: string;
}

export const PERMISSION_MODULES: PermissionModuleMeta[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    category: "Overview",
    description: "Main operations overview, KPIs, and aggregated metrics.",
    actions: ["view"],
    routes: ["/dashboard"],
  },
  {
    id: "influencers",
    label: "Influencers",
    category: "Influencer Hub",
    description: "Influencer roster, profiles, categories, followers, and rates.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "influencers",
    routes: ["/influencers", "/influencers/"],
  },
  {
    id: "influencer_targets",
    label: "Target Tracking",
    category: "Influencer Hub",
    description: "Monthly video and reach quota tracking per creator.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "influencer_targets",
    routes: ["/influencers/targets"],
  },
  {
    id: "influencer_deliveries",
    label: "Delivery Records",
    category: "Influencer Hub",
    description: "Logged posts, reels, videos, views, and engagement metrics.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "influencer_deliveries",
    routes: ["/influencers/deliveries"],
  },
  {
    id: "influencer_payments",
    label: "Influencer Payments",
    category: "Influencer Hub",
    description: "Fee schedules, invoices, and payouts for influencers.",
    actions: ["view", "add", "update", "delete", "approve", "export"],
    tableName: "payments",
    routes: ["/influencers/payments"],
  },
  {
    id: "billboards",
    label: "Billboards",
    category: "Outdoor Media",
    description: "Static and digital billboard inventory, rates, contracts, and tracking.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "billboards",
    routes: ["/billboards", "/billboards/", "/billboards/tracking"],
  },
  {
    id: "billboard_payments",
    label: "Billboard Payments",
    category: "Outdoor Media",
    description: "Vendor invoices and rental payouts for billboard locations.",
    actions: ["view", "add", "update", "delete", "approve", "export"],
    tableName: "payments",
    routes: ["/billboards/payments"],
  },
  {
    id: "lcd_screens",
    label: "LCD Screens",
    category: "LCD Screens",
    description: "In-mall, transit, and indoor digital screen assets.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "lcd_screens",
    routes: ["/lcd", "/lcd/"],
  },
  {
    id: "lcd_videos",
    label: "LCD Videos",
    category: "LCD Screens",
    description: "Ad creative tracking, play counts, and durations on screens.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "lcd_videos",
    routes: ["/lcd/videos"],
  },
  {
    id: "lcd_payments",
    label: "LCD Payments",
    category: "LCD Screens",
    description: "Screen vendor payments and maintenance disbursements.",
    actions: ["view", "add", "update", "delete", "approve", "export"],
    tableName: "payments",
    routes: ["/lcd/payments"],
  },
  {
    id: "budget",
    label: "Budget",
    category: "Budget & Expenses",
    description: "Local and international marketing budget allocations.",
    actions: ["view", "add", "update", "delete", "export"],
    tableName: "budgets",
    routes: ["/budget/local", "/budget/international"],
  },
  {
    id: "expenses",
    label: "Expenses",
    category: "Budget & Expenses",
    description: "Marketing expense entries, vendor charges, and receipts.",
    actions: ["view", "add", "update", "delete", "approve", "export"],
    tableName: "expenses",
    routes: ["/budget/expenses"],
  },
  {
    id: "payments",
    label: "Payments Central",
    category: "Financial Operations",
    description: "Central payment workflow: pending, approved, paid, and history.",
    actions: ["view", "add", "update", "delete", "approve", "export"],
    tableName: "payments",
    routes: ["/payments/pending", "/payments/approved", "/payments/paid", "/payments/history"],
  },
  {
    id: "reports",
    label: "Reports",
    category: "Reports & Analytics",
    description: "Cross-channel performance, monthly operations, and budget reports.",
    actions: ["view", "export"],
    routes: [
      "/reports/influencers",
      "/reports/billboards",
      "/reports/lcd",
      "/reports/budget",
      "/reports/payments",
      "/reports/monthly",
    ],
  },
  {
    id: "users",
    label: "Users & Roles",
    category: "Administration",
    description: "Sub-user provisioning, password resets, and granular permission editing.",
    actions: ["view", "add", "update", "delete"],
    tableName: "users",
    routes: ["/settings/users", "/settings/permissions"],
  },
  {
    id: "audit_logs",
    label: "Audit Logs",
    category: "Administration",
    description: "System-wide activity tracker and compliance audit history.",
    actions: ["view", "export"],
    tableName: "audit_logs",
    routes: ["/settings/audit-logs"],
  },
];

export const ALL_ACTIONS: PermissionAction[] = [
  "view",
  "add",
  "update",
  "delete",
  "approve",
  "export",
];

export function makePermissionKey(moduleId: PermissionModuleId, action: PermissionAction): string {
  return `${moduleId}:${action}`;
}

export function getAllPossiblePermissions(): Record<string, boolean> {
  const perms: Record<string, boolean> = {};
  for (const mod of PERMISSION_MODULES) {
    for (const action of mod.actions) {
      perms[makePermissionKey(mod.id, action)] = true;
    }
  }
  return perms;
}

export const ROLE_PRESETS = [
  {
    id: "Super Admin",
    name: "Super Admin",
    description: "Full control over all modules, sub-users, roles, and system settings.",
    badgeClass:
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
    getPermissions: () => getAllPossiblePermissions(),
  },
  {
    id: "Marketing Manager",
    name: "Marketing Manager",
    description:
      "Full management of influencers, media assets, and reporting. No financial approval or user management.",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
    getPermissions: () => {
      const p: Record<string, boolean> = {
        "dashboard:view": true,
        "influencers:view": true,
        "influencers:add": true,
        "influencers:update": true,
        "influencers:delete": true,
        "influencers:export": true,
        "influencer_targets:view": true,
        "influencer_targets:add": true,
        "influencer_targets:update": true,
        "influencer_targets:delete": true,
        "influencer_targets:export": true,
        "influencer_deliveries:view": true,
        "influencer_deliveries:add": true,
        "influencer_deliveries:update": true,
        "influencer_deliveries:delete": true,
        "influencer_deliveries:export": true,
        "billboards:view": true,
        "billboards:add": true,
        "billboards:update": true,
        "billboards:delete": true,
        "billboards:export": true,
        "lcd_screens:view": true,
        "lcd_screens:add": true,
        "lcd_screens:update": true,
        "lcd_screens:delete": true,
        "lcd_screens:export": true,
        "lcd_videos:view": true,
        "lcd_videos:add": true,
        "lcd_videos:update": true,
        "lcd_videos:delete": true,
        "lcd_videos:export": true,
        "reports:view": true,
        "reports:export": true,
      };
      return p;
    },
  },
  {
    id: "Influencer Coordinator",
    name: "Influencer Coordinator",
    description:
      "Manage creator profiles, monthly targets, and delivered content. Cannot delete or handle payments.",
    badgeClass: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300",
    getPermissions: () => ({
      "dashboard:view": true,
      "influencers:view": true,
      "influencers:add": true,
      "influencers:update": true,
      "influencers:export": true,
      "influencer_targets:view": true,
      "influencer_targets:add": true,
      "influencer_targets:update": true,
      "influencer_targets:export": true,
      "influencer_deliveries:view": true,
      "influencer_deliveries:add": true,
      "influencer_deliveries:update": true,
      "influencer_deliveries:export": true,
      "influencer_payments:view": true,
      "reports:view": true,
    }),
  },
  {
    id: "Outdoor Media Buyer",
    name: "Outdoor Media Buyer",
    description: "Manage billboard locations, LCD screens, and video creatives.",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
    getPermissions: () => ({
      "dashboard:view": true,
      "billboards:view": true,
      "billboards:add": true,
      "billboards:update": true,
      "billboards:export": true,
      "billboard_payments:view": true,
      "lcd_screens:view": true,
      "lcd_screens:add": true,
      "lcd_screens:update": true,
      "lcd_screens:export": true,
      "lcd_videos:view": true,
      "lcd_videos:add": true,
      "lcd_videos:update": true,
      "lcd_videos:export": true,
      "lcd_payments:view": true,
      "reports:view": true,
    }),
  },
  {
    id: "Finance Officer",
    name: "Finance Officer",
    description:
      "Manage and approve payments, track budgets, log expenses, and export financial reports.",
    badgeClass:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    getPermissions: () => ({
      "dashboard:view": true,
      "influencers:view": true,
      "influencer_payments:view": true,
      "influencer_payments:add": true,
      "influencer_payments:update": true,
      "influencer_payments:approve": true,
      "influencer_payments:export": true,
      "billboards:view": true,
      "billboard_payments:view": true,
      "billboard_payments:add": true,
      "billboard_payments:update": true,
      "billboard_payments:approve": true,
      "billboard_payments:export": true,
      "lcd_screens:view": true,
      "lcd_payments:view": true,
      "lcd_payments:add": true,
      "lcd_payments:update": true,
      "lcd_payments:approve": true,
      "lcd_payments:export": true,
      "budget:view": true,
      "budget:add": true,
      "budget:update": true,
      "budget:export": true,
      "expenses:view": true,
      "expenses:add": true,
      "expenses:update": true,
      "expenses:delete": true,
      "expenses:approve": true,
      "expenses:export": true,
      "payments:view": true,
      "payments:add": true,
      "payments:update": true,
      "payments:delete": true,
      "payments:approve": true,
      "payments:export": true,
      "reports:view": true,
      "reports:export": true,
    }),
  },
  {
    id: "Auditor (Read-Only)",
    name: "Auditor (Read-Only)",
    description:
      "View-only access to all operational data and reports with export capability. Cannot modify or delete.",
    badgeClass:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
    getPermissions: () => ({
      "dashboard:view": true,
      "influencers:view": true,
      "influencers:export": true,
      "influencer_targets:view": true,
      "influencer_targets:export": true,
      "influencer_deliveries:view": true,
      "influencer_deliveries:export": true,
      "influencer_payments:view": true,
      "influencer_payments:export": true,
      "billboards:view": true,
      "billboards:export": true,
      "billboard_payments:view": true,
      "billboard_payments:export": true,
      "lcd_screens:view": true,
      "lcd_screens:export": true,
      "lcd_videos:view": true,
      "lcd_videos:export": true,
      "lcd_payments:view": true,
      "lcd_payments:export": true,
      "budget:view": true,
      "budget:export": true,
      "expenses:view": true,
      "expenses:export": true,
      "payments:view": true,
      "payments:export": true,
      "reports:view": true,
      "reports:export": true,
      "audit_logs:view": true,
      "audit_logs:export": true,
    }),
  },
  {
    id: "Custom",
    name: "Custom",
    description: "Tailored granular permission set assigned specifically by the administrator.",
    badgeClass:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
    getPermissions: () => ({ "dashboard:view": true }),
  },
];

export function isUserPrimaryAdmin(user?: AppUser | null): boolean {
  if (!user) return false;
  return Boolean(
    user.is_primary_admin ||
    user.role_name === "Super Admin" ||
    user.email === "admin@marketing-ops.com",
  );
}

export function hasPermission(
  user: AppUser | null | undefined,
  moduleId: PermissionModuleId,
  action: PermissionAction,
): boolean {
  if (!user) return false;
  if (isUserPrimaryAdmin(user)) return true;
  if (user.status !== "active") return false;

  const key = makePermissionKey(moduleId, action);
  return Boolean(user.permissions?.[key]);
}

export function hasModuleViewPermission(
  user: AppUser | null | undefined,
  moduleIdOrRoute: PermissionModuleId | string,
): boolean {
  if (!user) return false;
  if (isUserPrimaryAdmin(user)) return true;
  if (user.status !== "active") return false;

  let modId: PermissionModuleId | null = null;
  if (typeof moduleIdOrRoute === "string" && moduleIdOrRoute.startsWith("/")) {
    modId = getModuleForRoute(moduleIdOrRoute);
  } else {
    modId = moduleIdOrRoute as PermissionModuleId;
  }
  if (!modId) return true;
  return hasPermission(user, modId, "view");
}

export function getFirstAllowedRoute(user: AppUser | null | undefined): string {
  if (!user || isUserPrimaryAdmin(user)) return "/dashboard";
  const priorityRoutes = [
    "/dashboard",
    "/influencers",
    "/influencers/targets",
    "/influencers/deliveries",
    "/influencers/payments",
    "/billboards",
    "/billboards/tracking",
    "/billboards/payments",
    "/lcd",
    "/lcd/videos",
    "/lcd/payments",
    "/budget/local",
    "/budget/international",
    "/budget/expenses",
    "/payments/pending",
    "/payments/approved",
    "/payments/paid",
    "/payments/history",
    "/reports/influencers",
    "/reports/billboards",
    "/reports/lcd",
    "/reports/budget",
    "/reports/payments",
    "/reports/monthly",
    "/settings/users",
    "/audit-logs",
  ];
  for (const r of priorityRoutes) {
    if (hasModuleViewPermission(user, r)) {
      return r;
    }
  }
  return "/dashboard";
}

export function getModuleForRoute(pathname: string): PermissionModuleId | null {
  const clean = pathname.replace(/\/$/, "") || "/";
  for (const mod of PERMISSION_MODULES) {
    for (const r of mod.routes) {
      const cleanR = r.replace(/\/$/, "") || "/";
      if (clean === cleanR) return mod.id;
    }
  }
  // check prefix matches
  if (clean.startsWith("/influencers/targets")) return "influencer_targets";
  if (clean.startsWith("/influencers/deliveries")) return "influencer_deliveries";
  if (clean.startsWith("/influencers/payments")) return "influencer_payments";
  if (clean.startsWith("/influencers")) return "influencers";
  if (clean.startsWith("/billboards/payments")) return "billboard_payments";
  if (clean.startsWith("/billboards")) return "billboards";
  if (clean.startsWith("/lcd/videos")) return "lcd_videos";
  if (clean.startsWith("/lcd/payments")) return "lcd_payments";
  if (clean.startsWith("/lcd")) return "lcd_screens";
  if (clean.startsWith("/budget/expenses")) return "expenses";
  if (clean.startsWith("/budget")) return "budget";
  if (clean.startsWith("/payments")) return "payments";
  if (clean.startsWith("/reports")) return "reports";
  if (clean.startsWith("/audit-logs")) return "audit_logs";
  if (clean.startsWith("/settings/audit-logs")) return "audit_logs";
  if (clean.startsWith("/settings")) return "users";
  if (clean.startsWith("/dashboard")) return "dashboard";

  return null;
}

export function getModuleForTable(tableName: string, categoryFilter?: string): PermissionModuleId {
  if (tableName === "influencers") return "influencers";
  if (tableName === "influencer_targets") return "influencer_targets";
  if (tableName === "influencer_deliveries") return "influencer_deliveries";
  if (tableName === "billboards") return "billboards";
  if (tableName === "lcd_screens") return "lcd_screens";
  if (tableName === "lcd_videos") return "lcd_videos";
  if (tableName === "budgets") return "budget";
  if (tableName === "expenses") return "expenses";
  if (tableName === "users") return "users";
  if (tableName === "audit_logs") return "audit_logs";
  if (tableName === "payments") {
    if (categoryFilter === "influencer") return "influencer_payments";
    if (categoryFilter === "billboard") return "billboard_payments";
    if (categoryFilter === "lcd") return "lcd_payments";
    return "payments";
  }
  return "dashboard";
}
