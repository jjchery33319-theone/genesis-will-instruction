import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { CheckCircle2, Star, Mail, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormHeader from "../components/form/FormHeader";

export default function SubmissionSuccess() {
  const params = useParams<{ ref: string }>();
  const ref = params.ref ?? "";

  const { data: record, isLoading } = trpc.will.getByRef.useQuery(
    { ref },
    { enabled: !!ref }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
        <FormHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
        </div>
      </div>
    );
  }

  const recommendations = Array.isArray(record?.recommendationsJson) ? record.recommendationsJson : [];

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      <FormHeader />

      <div className="container max-w-3xl py-8 space-y-6">
        {/* Success Banner */}
        <div
          className="rounded-xl p-6 text-white text-center"
          style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 155) 0%, oklch(0.28 0.07 155) 100%)" }}
        >
          <CheckCircle2 className="w-14 h-14 mx-auto mb-3" style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1 className="font-serif text-2xl font-semibold">Instruction Submitted Successfully</h1>
          <p className="text-sm mt-2" style={{ color: "oklch(0.78 0.12 85)" }}>
            Reference Number: <strong>{ref}</strong>
          </p>
          <p className="text-sm mt-1 opacity-80">
            The admin team has been notified and will process this instruction shortly.
          </p>
        </div>

        {/* Email Notification Confirmation */}
        <div
          className="rounded-xl p-4 border flex items-start gap-3"
          style={{ background: "oklch(0.99 0.01 155)", borderColor: "oklch(0.78 0.12 85 / 0.3)" }}
        >
          <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.28 0.07 155)" }} />
          <div>
            <p className="text-sm font-semibold genesis-green-text">Admin Team Notified</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated emails have been sent to office@genesisestateplanning.info,
              customer-support@genesisestateplanning.info, and amelia@genesisestateplanning.info
              with the full instruction summary and recommendation email draft.
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ background: "oklch(0.97 0.015 90)" }}
            >
              <Star className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <h2 className="font-serif text-sm font-semibold genesis-green-text">
                Estate Planning Recommendations Generated
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {recommendations.map((rec: Record<string, string>) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{
                    background: rec.priority === "high" ? "oklch(0.99 0.01 85 / 0.6)" : "oklch(0.99 0.005 155)",
                    borderColor: rec.priority === "high" ? "oklch(0.78 0.12 85 / 0.5)" : "oklch(0.88 0.02 155)",
                  }}
                >
                  <AlertTriangle
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: rec.priority === "high" ? "oklch(0.65 0.14 80)" : "oklch(0.5 0.04 155)" }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold genesis-green-text">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                  </div>
                  <Badge
                    className="text-xs flex-shrink-0"
                    style={
                      rec.priority === "high"
                        ? { background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }
                        : { background: "oklch(0.88 0.02 155)", color: "oklch(0.28 0.07 155)" }
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Narrative */}
        {record?.aiRecommendationNarrative && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ background: "oklch(0.97 0.015 155)" }}>
              <h2 className="font-serif text-sm font-semibold genesis-green-text">Internal Recommendation Narrative</h2>
              <p className="text-xs text-muted-foreground">For admin team use only</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {record.aiRecommendationNarrative}
              </p>
            </div>
          </div>
        )}

        {/* Client Email Draft */}
        {record?.aiClientEmailDraft && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div
              className="px-5 py-3 border-b flex items-center gap-2"
              style={{ background: "oklch(0.97 0.015 90)" }}
            >
              <Mail className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <div>
                <h2 className="font-serif text-sm font-semibold genesis-green-text">Client Email Draft</h2>
                <p className="text-xs text-muted-foreground">Ready to copy and send to the client</p>
              </div>
            </div>
            <div className="p-5">
              <div
                className="rounded-lg border p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: "oklch(0.98 0.01 90)", borderColor: "oklch(0.88 0.05 85)", color: "oklch(0.15 0.02 150)" }}
              >
                {record.aiClientEmailDraft}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              New Instruction
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              className="gap-2"
              style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}
            >
              View All Submissions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
