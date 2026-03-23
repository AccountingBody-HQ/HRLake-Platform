import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

export interface BadgeProps {
  label: string;
  variant?: "region" | "status" | "plan" | "category" | "default";
  color?: "blue" | "navy" | "green" | "amber" | "red" | "slate" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const colors = {
  blue:   "bg-blue-50 text-blue-600 border-blue-100",
  navy:   "bg-navy-100 text-navy-700 border-navy-200",
  green:  "bg-success-50 text-success-600 border-green-100",
  amber:  "bg-warning-50 text-warning-600 border-yellow-100",
  red:    "bg-danger-50 text-danger-500 border-red-100",
  slate:  "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

const dotColors = {
  blue:   "bg-blue-500",
  navy:   "bg-navy-600",
  green:  "bg-success-500",
  amber:  "bg-warning-500",
  red:    "bg-danger-500",
  slate:  "bg-slate-400",
  purple: "bg-purple-500",
};

const sizes = {
  sm: "px-2 py-0.5 text-2xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({ label, color = "slate", size = "md", dot = false, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center font-semibold rounded-full border",
      "leading-none tracking-wide",
      colors[color],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={cn("rounded-full shrink-0", dotColors[color], size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      )}
      {label}
    </span>
  );
}

/* ── Region Badge ─────────────────────────────────────────────────────── */
const regionColors: Record<string, BadgeProps["color"]> = {
  "Europe":        "blue",
  "North America": "navy",
  "Asia Pacific":  "green",
  "Middle East":   "amber",
  "Africa":        "purple",
  "Latin America": "red",
  "Global":        "slate",
};

export function RegionBadge({ region, size = "md", className }: { region: string; size?: "sm" | "md"; className?: string }) {
  const color = regionColors[region] ?? "slate";
  return <Badge label={region} color={color} size={size} className={className} />;
}

/* ── Plan Badge ───────────────────────────────────────────────────────── */
export function PlanBadge({ plan, className }: { plan: "free" | "pro" | "enterprise"; className?: string }) {
  const map = {
    free:       { label: "Free",       color: "slate" as const },
    pro:        { label: "Pro",        color: "blue"  as const },
    enterprise: { label: "Enterprise", color: "navy"  as const },
  };
  const { label, color } = map[plan];
  return <Badge label={label} color={color} dot className={className} />;
}

/* ── Status Badge ─────────────────────────────────────────────────────── */
export function StatusBadge({ status, className }: { status: "live" | "verified" | "pending" | "outdated"; className?: string }) {
  const map = {
    live:     { label: "Live",     color: "green" as const },
    verified: { label: "Verified", color: "green" as const },
    pending:  { label: "Pending",  color: "amber" as const },
    outdated: { label: "Outdated", color: "red"   as const },
  };
  const { label, color } = map[status];
  return <Badge label={label} color={color} dot className={className} />;
}

export default Badge;
