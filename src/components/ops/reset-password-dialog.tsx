import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Sparkles } from "lucide-react";
import type { AppUser } from "@/lib/rbac";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AppUser | null;
  onReset: (userId: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onReset,
  loading,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("Password123!");

  const handleGenerate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onReset(user.id, newPassword);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4 text-primary" /> Reset Password
          </DialogTitle>
          <DialogDescription>
            Provide a new temporary or permanent password for <strong>{user?.full_name}</strong> (
            {user?.email}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-pass">New Password</Label>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Sparkles className="size-3" /> Auto-generate
              </button>
            </div>
            <Input
              id="new-pass"
              type="text"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Resetting…" : "Confirm Password Reset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
