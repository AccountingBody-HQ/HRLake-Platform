import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const base = [
  "inline-flex items-center justify-center gap-2",
  "font-semibold rounded-md",
  "transition-all duration-150 ease-smooth",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  "select-none whitespace-nowrap",
].join(" ");

const variants = {
  primary: cn(
    "bg-blue-500 text-white",
    "hover:bg-blue-600 active:bg-blue-700",
    "shadow-sm hover:shadow-md",
    "focus-visible:ring-blue-500"
  ),
  secondary: cn(
    "bg-navy-900 text-white",
    "hover:bg-navy-800 active:bg-navy-700",
    "shadow-sm hover:shadow-md",
    "focus-visible:ring-navy-700"
  ),
  ghost: cn(
    "bg-transparent text-slate-600",
    "hover:bg-slate-100 hover:text-navy-900",
    "focus-visible:ring-slate-400"
  ),
  outline: cn(
    "bg-transparent text-navy-900 border border-slate-200",
    "hover:bg-slate-50 hover:border-blue-500 hover:text-blue-500",
    "focus-visible:ring-blue-500"
  ),
  danger: cn(
    "bg-danger-500 text-white",
    "hover:bg-danger-600 active:bg-red-700",
    "shadow-sm hover:shadow-md",
    "focus-visible:ring-danger-500"
  ),
};

const sizes = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  xl: "h-13 px-7 text-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin shrink-0" size={16} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
