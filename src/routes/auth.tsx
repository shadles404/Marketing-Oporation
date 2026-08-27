import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Marketing Operations Management System" },
      {
        name: "description",
        content:
          "Sign in to manage influencers, billboards, LCD screens, budgets, and team permissions.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const signInWithCredentials = async (userOrEmail: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userOrEmail,
      password: pass,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to sign in. Please verify your credentials.");
      return;
    }
    const name = data?.user?.user_metadata?.full_name || userOrEmail;
    toast.success(`Welcome back, ${name}!`);
    navigate({ to: "/dashboard" });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please provide both email/username and password.");
      return;
    }
    await signInWithCredentials(identifier.trim(), password);
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground shadow-sm">
            MO
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Marketing Operations
          </h1>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Influencers, Outdoor Media, Budgets & Real-Time Permission Ledger.
          </p>
        </div>

        <div className="surface-card p-6 shadow-sm border border-border">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your workspace credentials to access your assigned modules.
            </p>
          </div>

          <form className="space-y-4" onSubmit={signIn}>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Work Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                required
                placeholder="e.g. admin or sarah.finance@marketing-ops.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter your password (e.g. Password123!)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full gap-2 text-xs h-9" disabled={loading}>
              <LogIn className="size-4" />
              {loading ? "Authenticating…" : "Sign In to Workspace"}
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 space-y-2 pt-4 border-t border-border">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Quick Role Sign-In
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-[11px] justify-start px-2 font-normal"
                onClick={() => signInWithCredentials("admin", "Password123!")}
              >
                👑 System Admin
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-[11px] justify-start px-2 font-normal"
                onClick={() => signInWithCredentials("sjenkins", "Password123!")}
              >
                💳 Finance Officer
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-[11px] justify-start px-2 font-normal"
                onClick={() => signInWithCredentials("karimt", "Password123!")}
              >
                📱 Influencers
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-[11px] justify-start px-2 font-normal"
                onClick={() => signInWithCredentials("erostova", "Password123!")}
              >
                🏙️ Outdoor Media
              </Button>
            </div>
          </div>

          <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full text-xs h-9" onClick={google}>
            Continue with Google OAuth
          </Button>

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
            <span>
              Sub-user accounts and section access permissions are configured and provisioned by the
              primary administrator.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
