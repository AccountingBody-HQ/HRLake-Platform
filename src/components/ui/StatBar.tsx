"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

function useCountUp(target: number, duration = 1500, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

export interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sub?: string;
}

export interface StatBarProps {
  stats: StatItem[];
  variant?: "light" | "dark";
  className?: string;
}

export function StatBar({ stats, variant = "dark", className }: StatBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-px",
        stats.length === 2 && "grid-cols-2",
        stats.length === 3 && "grid-cols-3",
        stats.length === 4 && "grid-cols-2 md:grid-cols-4",
        stats.length >= 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        variant === "dark"  && "bg-white/10 rounded-xl overflow-hidden",
        variant === "light" && "bg-slate-200 rounded-xl overflow-hidden",
        className
      )}
    >
      {stats.map((stat, i) => (
        <StatItem key={i} stat={stat} variant={variant} visible={visible} />
      ))}
    </div>
  );
}

function StatItem({ stat, variant, visible }: { stat: StatItem; variant: "light" | "dark"; visible: boolean }) {
  const count = useCountUp(stat.value, 1500, visible);
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center px-6 py-8",
      variant === "dark"  && "bg-navy-900/80",
      variant === "light" && "bg-white"
    )}>
      <div className={cn(
        "text-4xl lg:text-5xl font-bold font-numeric mb-1 tabular-nums",
        variant === "dark"  && "text-white",
        variant === "light" && "text-navy-900"
      )}>
        {stat.prefix && <span className="text-blue-400">{stat.prefix}</span>}
        {count.toLocaleString()}
        {stat.suffix && <span className="text-blue-400">{stat.suffix}</span>}
      </div>
      <p className={cn(
        "text-sm font-semibold uppercase tracking-wider mb-0.5",
        variant === "dark"  && "text-slate-300",
        variant === "light" && "text-slate-600"
      )}>{stat.label}</p>
      {stat.sub && (
        <p className={cn(
          "text-xs",
          variant === "dark"  && "text-slate-500",
          variant === "light" && "text-slate-400"
        )}>{stat.sub}</p>
      )}
    </div>
  );
}

export default StatBar;
