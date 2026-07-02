import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Users, ShieldCheck, ShieldOff, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
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

type PendingChange = {
  userId: number;
  name: string | null;
  newRole: "admin" | "user";
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  const { data: userList = [], isLoading, refetch } = trpc.users.list.useQuery();

  const setRole = trpc.users.setRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success(
        pendingChange?.newRole === "admin"
          ? `${pendingChange?.name ?? "User"} promoted to Admin`
          : `${pendingChange?.name ?? "User"} demoted to User`
      );
      setPendingChange(null);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update role");
      setPendingChange(null);
    },
  });

  const handleConfirm = () => {
    if (!pendingChange) return;
    setRole.mutate({ userId: pendingChange.userId, role: pendingChange.newRole });
  };

  // Determine if the current user is the project owner (they can change roles)
  // The server enforces this — we just hide/disable buttons for non-owners for UX
  const isOwner = Boolean(currentUser?.openId && userList.some(
    (u) => u.openId === currentUser.openId && u.role === "admin"
  ));
  // We always show buttons but rely on server-side enforcement for security.
  // The owner check on the client is purely cosmetic (shows a tooltip).

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      {/* Header */}
      <header className="genesis-gradient shadow-lg">
        <div className="container max-w-4xl py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/manus-storage/genesis-logo_48897107.png"
                alt="Genesis Wills and Estate Planning"
                className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 object-contain rounded-lg"
              />
              <div className="min-w-0">
                <h1 className="font-serif text-sm sm:text-xl font-semibold text-white truncate">
                  User Management
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: "oklch(0.78 0.12 85)" }}>
                  Genesis Wills and Estate Planning
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl py-8">
        {/* Info card */}
        <div className="rounded-xl border border-border bg-white shadow-sm p-5 mb-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-base mb-1">Team Access Control</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All team members who have signed in via Manus OAuth appear below. Any admin can
                promote users to <strong>Admin</strong> (full access) or demote them back to{" "}
                <strong>User</strong> (read-only). You cannot demote yourself.
              </p>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h3 className="font-semibold text-sm">
              {isLoading ? "Loading…" : `${userList.length} registered user${userList.length !== 1 ? "s" : ""}`}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-7 px-2 gap-1 text-xs text-muted-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : userList.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No users found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-5 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Role</th>
                  <th className="text-right px-5 py-2.5 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u, idx) => {
                  const isCurrentUser = u.openId === currentUser?.openId;
                  const isLastRow = idx === userList.length - 1;
                  return (
                    <tr
                      key={u.id}
                      className={`${!isLastRow ? "border-b border-border/60" : ""} hover:bg-muted/20 transition-colors`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{u.name ?? "—"}</span>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">You</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">
                        {u.email ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={
                            u.role === "admin"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }
                          variant="outline"
                        >
                          {u.role === "admin" ? (
                            <><ShieldCheck className="w-3 h-3 mr-1" />Admin</>
                          ) : (
                            <><ShieldOff className="w-3 h-3 mr-1" />User</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role === "admin" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                            disabled={setRole.isPending}
                            onClick={() =>
                              setPendingChange({ userId: u.id, name: u.name, newRole: "user" })
                            }
                          >
                            <ShieldOff className="w-3 h-3" />
                            Demote
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                            disabled={setRole.isPending}
                            onClick={() =>
                              setPendingChange({ userId: u.id, name: u.name, newRole: "admin" })
                            }
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Promote
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Role changes take effect immediately. You cannot demote your own account.
        </p>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={Boolean(pendingChange)} onOpenChange={(open) => { if (!open) setPendingChange(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingChange?.newRole === "admin" ? "Promote to Admin?" : "Demote to User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.newRole === "admin"
                ? `${pendingChange?.name ?? "This user"} will gain full admin access to the Genesis Will Instruction system.`
                : `${pendingChange?.name ?? "This user"} will lose admin access and be restricted to read-only.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={pendingChange?.newRole === "admin" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {setRole.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving…</>
              ) : (
                pendingChange?.newRole === "admin" ? "Yes, Promote" : "Yes, Demote"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
