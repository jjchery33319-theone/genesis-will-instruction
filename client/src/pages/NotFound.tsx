import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
      <div className="text-center max-w-md px-6">
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: "oklch(0.28 0.07 155)" }}
        >
          <FileQuestion className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-serif text-5xl font-bold genesis-green-text mb-2">404</h1>
        <h2 className="font-serif text-xl font-semibold genesis-green-text mb-3">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button
            className="gap-2"
            style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}
          >
            <Home className="w-4 h-4" />
            Return to Form
          </Button>
        </Link>
      </div>
    </div>
  );
}
