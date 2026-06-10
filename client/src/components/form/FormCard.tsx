import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormCard({ title, subtitle, icon, children, className }: FormCardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-border overflow-hidden", className)}>
      <div className="px-6 py-4 border-b border-border" style={{ background: "oklch(0.97 0.015 155)" }}>
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.28 0.07 155)" }}
            >
              <span className="text-white">{icon}</span>
            </div>
          )}
          <div>
            <h2 className="font-serif text-base font-semibold genesis-green-text">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FieldRow({ label, required, hint, children, className }: FieldRowProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface SectionDividerProps {
  title: string;
}

export function SectionDivider({ title }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1" style={{ background: "oklch(0.78 0.12 85)" }} />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.65 0.14 80)" }}>
        {title}
      </span>
      <div className="h-px flex-1" style={{ background: "oklch(0.78 0.12 85)" }} />
    </div>
  );
}
