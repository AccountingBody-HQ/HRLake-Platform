import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HTMLAttributes, forwardRef } from "react";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "stat" | "country" | "article" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const variants = {
  default: "bg-white border border-slate-200 shadow-sm",
  dark:    "bg-navy-800 border border-white/10 text-white",
  stat:    "bg-white border border-slate-200 shadow-sm",
  country: "bg-white border border-slate-200 shadow-sm",
  article: "bg-white border border-slate-200 shadow-sm",
  flat:    "bg-slate-50 border border-slate-100",
};

const paddings = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6 lg:p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", hoverable = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg overflow-hidden",
        variants[variant],
        paddings[padding],
        hoverable && [
          "transition-all duration-150 cursor-pointer",
          "hover:-translate-y-0.5 hover:shadow-md",
          variant === "default" && "hover:border-blue-500/20",
          variant === "dark"    && "hover:border-blue-500/30 hover:bg-navy-700",
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

/* ── Country Card ─────────────────────────────────────────────────────── */
export interface CountryCardProps {
  code: string;
  name: string;
  flag: string;
  region: string;
  currency?: string;
  employerRate?: string;
  href?: string;
  className?: string;
}

export function CountryCard({ code, name, flag, region, currency, employerRate, href, className }: CountryCardProps) {
  const content = (
    <div className={cn("card-base p-5 group cursor-pointer h-full", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl leading-none">{flag}</span>
        <span className="badge-base bg-slate-100 text-slate-500 text-2xs uppercase tracking-wider">{region}</span>
      </div>
      <h3 className="font-bold text-navy-900 text-base mb-1 group-hover:text-blue-500 transition-colors">{name}</h3>
      <p className="text-2xs text-slate-400 font-mono uppercase tracking-wider mb-3">{code.toUpperCase()}</p>
      {(currency || employerRate) && (
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          {currency && (
            <div>
              <p className="text-2xs text-slate-400 uppercase tracking-wider">Currency</p>
              <p className="text-xs font-semibold text-slate-700">{currency}</p>
            </div>
          )}
          {employerRate && (
            <div>
              <p className="text-2xs text-slate-400 uppercase tracking-wider">Employer SS</p>
              <p className="text-xs font-semibold text-blue-500">{employerRate}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
  if (href) return <a href={href} className="block h-full no-underline">{content}</a>;
  return content;
}

/* ── Article Card ─────────────────────────────────────────────────────── */
export interface ArticleCardProps {
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readTime?: string;
  href?: string;
  className?: string;
}

export function ArticleCard({ title, excerpt, category, date, readTime, href, className }: ArticleCardProps) {
  const content = (
    <div className={cn("card-base p-5 group cursor-pointer h-full flex flex-col", className)}>
      {category && (
        <span className="badge-base bg-blue-50 text-blue-600 mb-3 self-start">{category}</span>
      )}
      <h3 className="font-bold text-navy-900 text-base mb-2 group-hover:text-blue-500 transition-colors leading-snug flex-1">{title}</h3>
      {excerpt && <p className="text-sm text-slate-500 line-clamp-2 mb-4">{excerpt}</p>}
      {(date || readTime) && (
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-auto">
          {date    && <span className="text-2xs text-slate-400">{date}</span>}
          {readTime && <span className="text-2xs text-slate-400">{readTime} read</span>}
        </div>
      )}
    </div>
  );
  if (href) return <a href={href} className="block h-full no-underline">{content}</a>;
  return content;
}

/* ── Stat Card ────────────────────────────────────────────────────────── */
export interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, sub, icon, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn("card-base p-5", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        {icon && <span className="text-blue-500 opacity-70">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-navy-900 font-numeric mb-1">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
      {trendValue && (
        <div className="flex items-center gap-1 mt-2">
          <span className={cn(
            "text-xs font-semibold",
            trend === "up"   && "text-success-500",
            trend === "down" && "text-danger-500",
            trend === "neutral" && "text-slate-400"
          )}>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

export default Card;
