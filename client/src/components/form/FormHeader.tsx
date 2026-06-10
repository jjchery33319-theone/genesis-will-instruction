import { Link } from "wouter";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormHeader() {
  return (
    <header className="genesis-gradient shadow-lg">
      <div className="container max-w-5xl py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/manus-storage/genesis-logo_48897107.png"
              alt="Genesis Estate Planning"
              className="h-14 w-14 object-contain rounded-lg"
            />
            <div>
              <h1 className="font-serif text-xl font-semibold text-white leading-tight">
                Genesis Estate Planning
              </h1>
              <p className="text-sm" style={{ color: "oklch(0.78 0.12 85)" }}>
                Will Instruction Form
              </p>
            </div>
          </div>
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
