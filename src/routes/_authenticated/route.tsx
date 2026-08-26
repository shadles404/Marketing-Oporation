import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
  Link,
} from "@tanstack/react-router";
import { LogOut, Shield, ChevronDown, ShieldAlert, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/lib/ops";
import {
  isUserPrimaryAdmin,
  hasPermission,
  getModuleForRoute,
  getFirstAllowedRoute,
  PERMISSION_MODULES,
} from "@/lib/rbac";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: currentUser } = useCurrentUser();

  const canManageUsers =
    isUserPrimaryAdmin(currentUser) || hasPermission(currentUser, "users", "view");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  // Enforce section viewing permissions for sub-users
  const currentModule = getModuleForRoute(pathname);
  const isSectionAllowed =
    !currentModule ||
    isUserPrimaryAdmin(currentUser) ||
    hasPermission(currentUser, currentModule, "view");

  const moduleMeta = PERMISSION_MODULES.find((m) => m.id === currentModule);
  const fallbackRoute = getFirstAllowedRoute(currentUser);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="hidden text-sm font-medium text-foreground sm:inline">
                Marketing Operations
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* User Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-xs border-border bg-background"
                  >
                    <Avatar className="size-5">
                      <AvatarImage
                        src={currentUser?.avatar_url ?? undefined}
                        alt={currentUser?.full_name}
                      />
                      <AvatarFallback className="text-[9px]">
                        {(currentUser?.full_name || currentUser?.email || "U")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground max-w-[140px] truncate hidden sm:inline">
                      {currentUser?.full_name || currentUser?.email || "User"}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {currentUser?.role_name || "Admin"}
                    </Badge>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <DropdownMenuLabel className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {currentUser?.full_name || "User"}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {currentUser?.email}
                      </span>
                      <span className="text-[10px] text-primary font-medium mt-0.5">
                        Role: {currentUser?.role_name}
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
                          <Shield className="size-3.5 text-primary" /> Users & Permissions
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
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {isSectionAllowed ? (
              <Outlet />
            ) : (
              <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-6">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
                  <ShieldAlert className="size-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground font-display">
                  Access Restricted
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Your account role (
                  <span className="font-semibold text-foreground">{currentUser?.role_name}</span>)
                  does not have permission to view the{" "}
                  <span className="font-semibold text-foreground">
                    {moduleMeta?.label || currentModule}
                  </span>{" "}
                  section.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Module access permissions are configured and managed by the workspace
                  administrator.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => navigate({ to: fallbackRoute as any })}
                    className="gap-2 text-xs"
                  >
                    Go to Allowed Workspace <ArrowRight className="size-3.5" />
                  </Button>
                  <Button variant="outline" onClick={handleSignOut} className="text-xs">
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
