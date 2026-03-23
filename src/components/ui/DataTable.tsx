import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(inputs));

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  compact?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  loading = false,
  emptyMessage = "No data available.",
  striped = false,
  compact = false,
  className,
}: DataTableProps<T>) {
  const cellPad = compact ? "px-4 py-2.5" : "px-4 py-3.5";

  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-slate-200", className)}>
      <table className="w-full text-sm">
        {caption && (
          <caption className="text-xs text-slate-400 text-left px-4 py-2 border-b border-slate-100">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "bg-navy-900 text-white text-xs font-semibold uppercase tracking-wider",
                  "px-4 py-3 text-left whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg",
                  col.align === "center" && "text-center",
                  col.align === "right"  && "text-right"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-t border-slate-100">
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn(cellPad)}>
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-t border-slate-100 transition-colors",
                  "hover:bg-slate-50",
                  striped && i % 2 === 0 && "bg-slate-50/50"
                )}
              >
                {columns.map((col) => {
                  const value = row[col.key as keyof T];
                  return (
                    <td
                      key={String(col.key)}
                      className={cn(
                        cellPad,
                        "text-slate-600 align-middle",
                        col.align === "center" && "text-center",
                        col.align === "right"  && "text-right font-numeric"
                      )}
                    >
                      {col.render ? col.render(value as unknown, row) : String(value ?? "—")}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Tax Bracket Table ────────────────────────────────────────────────── */
export interface TaxBracket extends Record<string, unknown> {
  bracket_label: string;
  min_income: number;
  max_income: number | null;
  rate_percent: number;
}

export function TaxBracketTable({ brackets, currency = "USD", className }: {
  brackets: TaxBracket[];
  currency?: string;
  className?: string;
}) {
  const fmt = (n: number) => n.toLocaleString();
  const columns: Column<TaxBracket>[] = [
    { key: "bracket_label", header: "Band",         width: "30%" },
    { key: "min_income",    header: "Income From",  align: "right", render: (v) => `${currency} ${fmt(v as number)}` },
    { key: "max_income",    header: "Income To",    align: "right", render: (v) => v === null ? "No limit" : `${currency} ${fmt(v as number)}` },
    { key: "rate_percent",  header: "Rate",         align: "right", render: (v) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="font-bold text-navy-900">{v as number}%</span>
        <span className="h-1.5 rounded-full bg-blue-500 block" style={{ width: `${Math.min((v as number) * 2, 80)}px` }} />
      </span>
    )},
  ];
  return <DataTable<TaxBracket> columns={columns as Column<TaxBracket>[]} data={brackets} striped className={className} />;
}

export default DataTable;
