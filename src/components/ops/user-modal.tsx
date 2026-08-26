import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionMatrix } from "./permission-matrix";
import { ROLE_PRESETS, type AppUser } from "@/lib/rbac";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, User as UserIcon, Lock, Sparkles } from "lucide-react";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser | null; // null = Add New User mode, object = Edit User mode
  onSave: (user: Partial<AppUser>) => Promise<void>;
  saving: boolean;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
];

export function UserModal({ open, onOpenChange, user, onSave, saving }: UserModalProps) {
  const isEditing = Boolean(user);
  const isPrimaryAdmin = Boolean(user?.is_primary_admin);

  const [activeTab, setActiveTab] = useState<"details" | "permissions">("details");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "suspended">("active");
  const [roleName, setRoleName] = useState("Custom");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPassword("");
      setAvatarUrl(user.avatar_url || AVATAR_PRESETS[0]!);
      setStatus(user.status || "active");
      setRoleName(user.role_name || "Custom");
      setPermissions(user.permissions || {});
    } else {
      // Add user defaults
      setFullName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("Password123!");
      setAvatarUrl(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]!);
      setStatus("active");
      const defaultRole = ROLE_PRESETS.find((r) => r.id === "Influencer Coordinator")!;
      setRoleName(defaultRole.id);
      setPermissions(defaultRole.getPermissions());
    }
    setActiveTab("details");
  }, [user, open]);

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<AppUser> = {
      ...(user ? { id: user.id } : {}),
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      avatar_url: avatarUrl || null,
      status,
      role_name: roleName,
      permissions,
      is_primary_admin: isPrimaryAdmin,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    await onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            {isEditing ? (
              <>
                <UserIcon className="size-4 text-primary" /> Edit User: {user?.full_name}
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 text-primary" /> Create New Team Account
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="gap-2">
                <UserIcon className="size-3.5" /> User Profile & Credentials
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-2">
                <ShieldCheck className="size-3.5" /> Granular Access Matrix
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Profile Photo Selection */}
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center">
                <Avatar className="size-16 border-2 border-primary/20">
                  <AvatarImage src={avatarUrl} alt={fullName || "User"} />
                  <AvatarFallback>{(fullName || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-semibold">Profile Photo / Avatar</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className={`size-8 overflow-hidden rounded-full border-2 transition-all ${
                          avatarUrl === preset
                            ? "border-primary ring-2 ring-primary/30 scale-110"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset}
                          alt={`Avatar ${idx + 1}`}
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  <Input
                    type="url"
                    placeholder="Or enter custom avatar image URL…"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    required
                    placeholder="e.g. Layla Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    required
                    placeholder="e.g. laylaa"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. layla@marketing-ops.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {isEditing ? "New Password (leave blank to keep current)" : "Password *"}
                    </Label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <Sparkles className="size-3" /> Auto-generate
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="text"
                      required={!isEditing}
                      placeholder={isEditing ? "••••••••••••" : "Min 8 characters"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Account Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as any)}
                    disabled={isPrimaryAdmin}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Full access permitted)</SelectItem>
                      <SelectItem value="inactive">
                        Inactive (Access temporarily disabled)
                      </SelectItem>
                      <SelectItem value="suspended">Suspended (Blocked for security)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Granular Permissions Tab */}
            <TabsContent value="permissions" className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Define the exact modules and operations this user is allowed to execute. You can
                choose a pre-configured role template or toggle individual permissions below.
              </p>

              <PermissionMatrix
                permissions={permissions}
                onChange={setPermissions}
                selectedRolePreset={roleName}
                onRolePresetChange={setRoleName}
                isPrimaryAdmin={isPrimaryAdmin}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Update User" : "Create User Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
