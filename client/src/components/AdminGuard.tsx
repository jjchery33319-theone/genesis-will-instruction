import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, ShieldX } from "lucide-react";
import { useState } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, refresh } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setError("");
      refresh();
    },
    onError: (err) => {
      setError(err.message || "Login failed");
    },
  });

  // Still loading auth state — show a neutral spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.28 0.07 155)", borderTopColor: "transparent" }} />
          <p className="text-sm text-muted-foreground">Checking access…</p>
        </div>
      </div>
    );
  }

  // Not logged in — prompt to sign in with password
  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.97 0.01 155)" }}
      >
        <div className="bg-white rounded-2xl border border-border shadow-lg w-full max-w-sm p-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="text-center">
              <h1 className="font-serif text-xl font-semibold genesis-green-text">Admin Access</h1>
              <p className="text-sm text-muted-foreground mt-1">Genesis Wills and Estate Planning</p>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.28 0.07 155 / 0.08)" }}
            >
              <Lock className="w-6 h-6" style={{ color: "oklch(0.28 0.07 155)" }} />
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              loginMutation.mutate({ password });
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-muted-foreground block mb-1.5">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ focusRingColor: "oklch(0.28 0.07 155)" } as any}
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full font-semibold gap-2"
              style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loginMutation.isPending ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in but not admin — show access denied
  if (user.role !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.97 0.01 155)" }}
      >
        <div className="bg-white rounded-2xl border border-border shadow-lg w-full max-w-sm p-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="text-center">
              <h1 className="font-serif text-xl font-semibold text-destructive">Access Denied</h1>
              <p className="text-sm text-muted-foreground mt-1">Genesis Wills and Estate Planning</p>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-destructive/10">
              <ShieldX className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-2">
            You are signed in as <strong>{user.name || user.email || "Unknown"}</strong>.
          </p>
          <p className="text-sm text-center text-muted-foreground mb-6">
            Your account does not have admin privileges. Please contact the system administrator to request access.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { window.location.href = "/"; }}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Logged in and admin — render the protected content
  return <>{children}</>;
}
