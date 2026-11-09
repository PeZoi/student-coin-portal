import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export function Table({ className, containerClassName, children, ...props }: TableProps) {
  return (
    <div className={cn("relative w-full overflow-x-auto", containerClassName)}>
      <table className={cn("w-full text-left text-sm border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-slate-200 bg-slate-50 text-[13px] font-semibold text-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  striped?: boolean;
}

export function TableBody({ className, striped = false, children, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn(
        "divide-y divide-slate-100",
        striped && "[&>tr:nth-child(even)]:bg-[#F8FAFC] [&>tr:nth-child(odd)]:bg-white",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-[#EAF2FF]/40", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

export function TableHead({ className, align = "left", children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "py-3 px-4 font-semibold text-slate-600",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

export function TableCell({ className, align = "left", children, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        "py-3.5 px-4 align-middle",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableFooter({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={cn("border-t border-slate-200 bg-slate-50 font-medium", className)} {...props}>
      {children}
    </tfoot>
  );
}

export function TableCaption({ className, children, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption className={cn("mt-4 text-xs text-slate-500", className)} {...props}>
      {children}
    </caption>
  );
}
