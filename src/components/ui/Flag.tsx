import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

export interface FlagProps {
  emoji: string;
  code?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showCode?: boolean;
  showName?: boolean;
  inline?: boolean;
  className?: string;
}

const sizes = {
  xs:  "text-base",
  sm:  "text-xl",
  md:  "text-2xl",
  lg:  "text-3xl",
  xl:  "text-4xl",
  "2xl": "text-5xl",
};

const wrapSizes = {
  xs:  "w-6  h-6",
  sm:  "w-8  h-8",
  md:  "w-10 h-10",
  lg:  "w-12 h-12",
  xl:  "w-14 h-14",
  "2xl": "w-16 h-16",
};

export function Flag({
  emoji,
  code,
  name,
  size = "md",
  showCode = false,
  showName = false,
  inline = false,
  className,
}: FlagProps) {
  const flag = (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        "rounded-md overflow-hidden",
        wrapSizes[size],
        className
      )}
      role="img"
      aria-label={name ?? code ?? "flag"}
      title={name ?? code}
    >
      <span className={cn(sizes[size], "leading-none select-none")}>{emoji}</span>
    </span>
  );

  if (!showCode && !showName) return flag;

  return (
    <span className={cn(
      "inline-flex items-center",
      inline ? "gap-1.5" : "gap-2"
    )}>
      {flag}
      <span className="flex flex-col min-w-0">
        {showName && name && (
          <span className="font-semibold text-navy-900 text-sm leading-tight truncate">{name}</span>
        )}
        {showCode && code && (
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">{code}</span>
        )}
      </span>
    </span>
  );
}

/* ── Flag Avatar (circular with border) ──────────────────────────────── */
export function FlagAvatar({ emoji, name, size = "md", className }: {
  emoji: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const s = { sm: "w-8 h-8 text-lg", md: "w-10 h-10 text-2xl", lg: "w-14 h-14 text-3xl" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "border-2 border-slate-200 bg-slate-50 shrink-0",
        s[size], className
      )}
      role="img"
      aria-label={name ?? "flag"}
      title={name}
    >
      <span className="leading-none select-none">{emoji}</span>
    </span>
  );
}

export default Flag;
