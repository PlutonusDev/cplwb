"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { QuestionGenerator } from "@/components/question-generator";
import { AircraftReference } from "@/components/aircraft-reference";
import { Plane, BookOpen, Calculator, Info } from "lucide-react";

export default function CPLFlightPlanningApp() {
  const [activeTab, setActiveTab] = useState("questions");

  return (
    <div className="min-h-screen bg-background print:bg-background">
      {/* Header - Hidden when printing */}
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Practice Question Generator</h1>
              <p className="text-sm text-muted-foreground">
                Performance, Operations & Flight Planning
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 print:p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
          <TabsList className="mb-6 grid w-full grid-cols-3 sm:w-auto sm:grid-cols-none sm:flex">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Questions</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="reference" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Reference</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <QuestionGenerator />
          </TabsContent>

          <TabsContent value="calculator">
            <WeightBalanceCalculator />
          </TabsContent>

          <TabsContent value="reference">
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-lg font-semibold">Echo Aircraft Reference Data</h2>
                <AircraftReference />
              </div>
              
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-2 font-medium">Important Formulas</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Moment Index:</strong> Weight × Arm ÷ 10,000</p>
                  <p><strong>CG Position:</strong> Total Moment Index × 10,000 ÷ Total Weight</p>
                  <p><strong>%MAC:</strong> (CG - MAC Leading Edge) ÷ MAC Length × 100</p>
                  <p><strong>Add Weight:</strong> Weight × (Target CG - Current CG) ÷ (Ballast Arm - Target CG)</p>
                  <p><strong>Fuel (AVGAS):</strong> USgal × 2.72 = kg | Lt × 0.72 = kg | USgal × 3.8 = Lt</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Print content shows here via QuestionGenerator */}
      </main>
    </div>
  );
}

// Simple Weight & Balance Calculator Component
function WeightBalanceCalculator() {
  const [rows, setRows] = useState([
    { name: "Basic Empty Weight", weight: "", arm: "", index: "" },
    { name: "Row 1 (Pilot + Pax)", weight: "", arm: "2290", index: "" },
    { name: "Row 2 (2 Pax)", weight: "", arm: "3300", index: "" },
    { name: "Row 3 (2 Pax)", weight: "", arm: "4300", index: "" },
    { name: "Forward Compt", weight: "", arm: "500", index: "" },
    { name: "Rear Compt", weight: "", arm: "5000", index: "" },
    { name: "Main Fuel", weight: "", arm: "1780", index: "" },
  ]);

  const updateRow = (index: number, field: "weight" | "arm" | "index", value: string) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      
      // Auto-calculate index if weight and arm are provided
      if (field !== "index") {
        const weight = parseFloat(newRows[index].weight) || 0;
        const arm = parseFloat(newRows[index].arm) || 0;
        if (weight > 0 && arm > 0) {
          newRows[index].index = ((weight * arm) / 10000).toFixed(1);
        }
      }
      
      return newRows;
    });
  };

  const totals = rows.reduce(
    (acc, row) => ({
      weight: acc.weight + (parseFloat(row.weight) || 0),
      index: acc.index + (parseFloat(row.index) || 0),
    }),
    { weight: 0, index: 0 }
  );

  const cgPosition = totals.weight > 0 ? (totals.index * 10000) / totals.weight : 0;
  const percentMAC = cgPosition > 0 ? ((cgPosition - 2190) / 1900) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Weight & Balance Calculator</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Item</th>
                <th className="py-2 text-right font-medium">Weight (KG)</th>
                <th className="py-2 text-right font-medium">Arm (mm)</th>
                <th className="py-2 text-right font-medium">Moment Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, index) => (
                <tr key={row.name}>
                  <td className="py-2">{row.name}</td>
                  <td className="py-2 flex justify-end">
                    <input
                      type="number"
                      value={row.weight}
                      onChange={(e) => updateRow(index, "weight", e.target.value)}
                      className="w-20 rounded border border-input bg-background px-2 py-1 text-right"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 flex justify-end">
                    <input
                      type="number"
                      value={row.arm}
                      onChange={(e) => updateRow(index, "arm", e.target.value)}
                      className="w-20 rounded border border-input bg-background px-2 py-1 text-right"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 text-right font-mono justify-end">
                    {row.index || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right">{totals.weight.toFixed(0)}</td>
                <td className="py-2 text-right text-muted-foreground">—</td>
                <td className="py-2 text-right font-mono">{totals.index.toFixed(1)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Results */}
      {totals.weight > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Weight</p>
            <p className="text-2xl font-bold">{totals.weight.toFixed(0)} KG</p>
          </div>
          <div className="rounded-lg border border-border bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">CG Position</p>
            <p className="text-2xl font-bold">{cgPosition.toFixed(1)} mm</p>
          </div>
          <div className="rounded-lg border border-border bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">%MAC</p>
            <p className="text-2xl font-bold">{percentMAC.toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
