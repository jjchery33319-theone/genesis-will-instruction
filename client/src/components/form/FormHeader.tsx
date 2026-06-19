import { Link } from "wouter";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormHeader() {
  return (
    <header className="genesis-gradient shadow-lg">
      <div className="container max-w-5xl py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img
              src="/manus-storage/genesis-logo_48897107.png"
              alt="Genesis Wills and Estate Planning"
              className="h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 object-contain rounded-lg"
            />
            <div className="min-w-0">
              <h1 className="font-serif text-sm sm:text-xl font-semibold text-white leading-tight">
                Genesis Wills and Estate Planning
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: "oklch(0.78 0.12 85)" }}>
                Will Instruction Form
              </p>
            </div>
          </div>
          <Link href="/admin" className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
