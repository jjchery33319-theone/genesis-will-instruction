import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_SESSION_KEY = "genesis_admin_auth";
const CORRECT_PASSWORD = "Genesis101";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Persist auth across page refreshes for the session
  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (stored === "true") setAuthenticated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 600);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.97 0.01 155)" }}
    >
      <div
        className={`bg-white rounded-2xl border border-border shadow-lg w-full max-w-sm p-8 transition-transform ${shaking ? "animate-shake" : ""}`}
      >
        {/* Logo & heading */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src="/manus-storage/genesis-logo_48897107.png"
            alt="Genesis Wills and Estate Planning"
            className="h-14 w-14 object-contain rounded-xl"
          />
          <div className="text-center">
            <h1 className="font-serif text-xl font-semibold genesis-green-text">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Genesis Wills and Estate Planning</p>
          </div>
        </div>

        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.28 0.07 155 / 0.08)" }}
          >
            <Lock className="w-6 h-6" style={{ color: "oklch(0.28 0.07 155)" }} />
          </div>
        </div>

        <p className="text-sm text-center text-muted-foreground mb-6">
          Enter the admin password to access the dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Admin password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`pr-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive text-center font-medium">
              Incorrect password. Please try again.
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold"
            style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
            disabled={!password}
          >
            Unlock Dashboard
          </Button>
        </form>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
}
