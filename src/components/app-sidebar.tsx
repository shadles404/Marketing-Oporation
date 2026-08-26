import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Target,
  PackageCheck,
  Wallet,
  Signpost,
  CalendarClock,
  MonitorPlay,
  Film,
  PiggyBank,
  Globe2,
  Receipt,
  Clock3,
  BadgeCheck,
  CircleDollarSign,
  History,
  FileBarChart,
  Shield,
  Activity,
  LogOut,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/lib/ops";
import { hasModuleViewPermission, isUserPrimaryAdmin } from "@/lib/rbac";
import { supabase } from "@/integrations/supabase/client";

const navigationGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Influencers",
    items: [
      { title: "Influencers", url: "/influencers", icon: Users },
      { title: "Target Tracking", url: "/influencers/targets", icon: Target },
      { title: "Delivery Records", url: "/influencers/deliveries", icon: PackageCheck },
      { title: "Influencer Payments", url: "/influencers/payments", icon: Wallet },
    ],
  },
  {
    label: "Billboards",
    items: [
      { title: "Billboard Database", url: "/billboards", icon: Signpost },
      { title: "Active / Expired", url: "/billboards/tracking", icon: CalendarClock },
      { title: "Billboard Payments", url: "/billboards/payments", icon: Wallet },
    ],
  },
  {
    label: "LCD Screens",
    items: [
      { title: "LCD Database", url: "/lcd", icon: MonitorPlay },
      { title: "Video Tracking", url: "/lcd/videos", icon: Film },
      { title: "LCD Payments", url: "/lcd/payments", icon: Wallet },
    ],
  },
  {
    label: "Budget",
    items: [
      { title: "Local Budget", url: "/budget/local", icon: PiggyBank },
      { title: "International Budget", url: "/budget/international", icon: Globe2 },
      { title: "Expenses", url: "/budget/expenses", icon: Receipt },
    ],
  },
  {
    label: "Payments",
    items: [
      { title: "Pending", url: "/payments/pending", icon: Clock3 },
      { title: "Approved", url: "/payments/approved", icon: BadgeCheck },
      { title: "Paid", url: "/payments/paid", icon: CircleDollarSign },
      { title: "Payment History", url: "/payments/history", icon: History },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Influencer Report", url: "/reports/influencers", icon: FileBarChart },
      { title: "Billboard Report", url: "/reports/billboards", icon: FileBarChart },
      { title: "LCD Report", url: "/reports/lcd", icon: FileBarChart },
      { title: "Budget Report", url: "/reports/budget", icon: FileBarChart },
      { title: "Payment Report", url: "/reports/payments", icon: FileBarChart },
      { title: "Monthly Operations", url: "/reports/monthly", icon: FileBarChart },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Team & Permissions", url: "/settings/users", icon: Shield },
      { title: "System Audit Logs", url: "/audit-logs", icon: Activity },
    ],
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: currentUser } = useCurrentUser();

  // Filter groups and items based on user permissions
  const visibleGroups = navigationGroups
    .map((group) => {
      const visibleItems = group.items.filter((item) => {
        if (!currentUser) return true;
        if (isUserPrimaryAdmin(currentUser)) return true;
        return hasModuleViewPermission(currentUser, item.url);
      });
      return { ...group, items: visibleItems };
    })
    .filter((group) => group.items.length > 0);

  const canManageUsers =
    isUserPrimaryAdmin(currentUser) || hasModuleViewPermission(currentUser, "/settings/users");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-xs font-bold text-primary-foreground shadow-xs">
            MO
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-display text-sm font-semibold leading-tight">
              Marketing Ops
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Operations & Media Management
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="h-8.5 text-xs font-medium"
                    >
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="size-4 shrink-0 text-muted-foreground group-data-[active=true]:text-primary" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Profile & Account in Sidebar Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="size-8 border border-border shrink-0">
                  <AvatarImage
                    src={currentUser?.avatar_url ?? undefined}
                    alt={currentUser?.full_name}
                  />
                  <AvatarFallback className="text-xs">
                    {(currentUser?.full_name || currentUser?.email || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden flex flex-col">
                  <span className="truncate text-xs font-semibold text-foreground leading-tight">
                    {currentUser?.full_name || currentUser?.email || "User"}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="truncate text-[10px] text-muted-foreground">
                      {currentUser?.role_name || "Member"}
                    </span>
                    {currentUser?.is_primary_admin && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-3.5 bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300"
                      >
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-56 p-1.5">
            <DropdownMenuLabel className="text-xs">
              <div className="flex flex-col">
                <span className="font-semibold truncate">{currentUser?.full_name || "User"}</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {currentUser?.email}
                </span>
                <span className="text-[10px] text-primary font-medium mt-0.5">
                  {currentUser?.role_name}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {canManageUsers && (
              <>
                <DropdownMenuItem asChild className="text-xs">
                  <Link
                    to="/settings/users"
                    className="flex items-center gap-2 text-foreground font-medium"
                  >
                    <Shield className="size-3.5 text-primary" /> Manage Team & Roles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-xs text-destructive focus:text-destructive gap-2"
            >
              <LogOut className="size-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
