import { trpc } from "../lib/trpc";
import { Link } from "wouter";
import { Loader2, FileText, Eye, Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "../../../shared/willConstants";

function getProductLabel(id: string) {
  return PRODUCTS.find(p => p.id === id)?.label ?? id;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { data: submissions, isLoading } = trpc.will.list.useQuery();

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      {/* Header */}
      <header className="genesis-gradient shadow-lg">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/manus-storage/genesis-logo_48897107.png"
                alt="Genesis Estate Planning"
                className="h-12 w-12 object-contain rounded-lg"
              />
              <div>
                <h1 className="font-serif text-xl font-semibold text-white">Admin Dashboard</h1>
                <p className="text-sm" style={{ color: "oklch(0.78 0.12 85)" }}>
                  Will Instruction Submissions
                </p>
              </div>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4" />
                New Instruction
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Submissions", value: submissions?.length ?? 0 },
            { label: "This Month", value: submissions?.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length ?? 0 },
            { label: "With Mirror Wills", value: submissions?.filter(s => Array.isArray(s.productsOrdered) && (s.productsOrdered as string[]).includes("mirror_wills")).length ?? 0 },
            { label: "With LPAs", value: submissions?.filter(s => Array.isArray(s.productsOrdered) && (s.productsOrdered as string[]).some((p: string) => p.includes("lpa") || p === "both_lpas")).length ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold genesis-green-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ background: "oklch(0.97 0.015 155)" }}>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 genesis-green-text" />
              <h2 className="font-serif text-base font-semibold genesis-green-text">
                All Submissions ({submissions?.length ?? 0})
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
            </div>
          ) : !submissions?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No submissions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Completed Will instructions will appear here
              </p>
              <Link href="/" className="mt-4">
                <Button size="sm" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                  Create First Instruction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: "oklch(0.98 0.005 155)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Reference</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Consultant</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Products</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, index) => {
                    const products = Array.isArray(sub.productsOrdered) ? sub.productsOrdered as string[] : [];
                    return (
                      <tr
                        key={sub.id}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                        style={{ background: index % 2 === 0 ? "white" : "oklch(0.99 0.003 155)" }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold" style={{ color: "oklch(0.65 0.14 80)" }}>
                            {sub.referenceNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">
                            {sub.client1FirstName} {sub.client1LastName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sub.consultantName ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {products.slice(0, 2).map(id => (
                              <Badge
                                key={id}
                                className="text-[10px] py-0"
                                style={{ background: "oklch(0.28 0.07 155 / 0.1)", color: "oklch(0.28 0.07 155)" }}
                              >
                                {getProductLabel(id)}
                              </Badge>
                            ))}
                            {products.length > 2 && (
                              <Badge className="text-[10px] py-0 bg-muted text-muted-foreground">
                                +{products.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatDate(sub.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className="text-xs capitalize"
                            style={{ background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }}
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/submission/${sub.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
