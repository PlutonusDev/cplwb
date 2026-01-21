"use client";

import type { LoadingItem } from "@/lib/question-types";

interface LoadingTableProps {
  items: LoadingItem[];
  showMomentIndex?: boolean;
}

export function LoadingTable({ items, showMomentIndex = true }: LoadingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="border border-border px-3 py-2 text-left font-semibold">
              Item
            </th>
            <th className="border border-border px-3 py-2 text-right font-semibold">
              Weight (KG)
            </th>
            <th className="border border-border px-3 py-2 text-right font-semibold">
              Arm (mm)
            </th>
            {showMomentIndex && (
              <th className="border border-border px-3 py-2 text-right font-semibold">
                Moment Index
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const isSubtotal = item.name.includes("Weight") && !item.name.includes("Empty");
            const isBurnOff = item.weight < 0;
            
            return (
              <tr 
                key={`${item.name}-${index}`}
                className={isSubtotal ? "bg-muted/50 font-medium" : ""}
              >
                <td className="border border-border px-3 py-2">
                  {item.name}
                </td>
                <td className={`border border-border px-3 py-2 text-right ${isBurnOff ? "text-destructive" : ""}`}>
                  {item.weight > 0 ? item.weight : `(${Math.abs(item.weight)})`}
                </td>
                <td className="border border-border px-3 py-2 text-right text-muted-foreground">
                  {item.arm > 0 ? item.arm : "—"}
                </td>
                {showMomentIndex && (
                  <td className={`border border-border px-3 py-2 text-right ${isBurnOff ? "text-destructive" : ""}`}>
                    {item.momentIndex !== 0 
                      ? (item.momentIndex > 0 ? item.momentIndex.toFixed(1) : `(${Math.abs(item.momentIndex).toFixed(1)})`)
                      : "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
