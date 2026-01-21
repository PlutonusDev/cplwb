"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { ECHO_CONFIG } from "@/lib/echo-aircraft-data";
import { Plane, Weight, Ruler, Fuel, Package } from "lucide-react";

export function AircraftReference() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Weight Limitations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Weight className="h-4 w-4" />
            Weight Limitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max Take-off Weight (MTOW)</dt>
              <dd className="font-medium">{ECHO_CONFIG.weights.maxTakeoffWeight} KG</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max Landing Weight (MLW)</dt>
              <dd className="font-medium">{ECHO_CONFIG.weights.maxLandingWeight} KG</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max Zero Fuel Weight (MZFW)</dt>
              <dd className="font-medium">{ECHO_CONFIG.weights.maxZeroFuelWeight} KG</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* MAC Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4" />
            Mean Aerodynamic Chord (MAC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">MAC Length</dt>
              <dd className="font-medium">{ECHO_CONFIG.mac.length} mm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Leading Edge (aft of datum)</dt>
              <dd className="font-medium">{ECHO_CONFIG.mac.leadingEdge} mm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Trailing Edge (aft of datum)</dt>
              <dd className="font-medium">{ECHO_CONFIG.mac.leadingEdge + ECHO_CONFIG.mac.length} mm</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* CG Limits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plane className="h-4 w-4" />
            CG Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">At ≤{ECHO_CONFIG.cgRange.lightWeight.weight} KG</dt>
              <dd className="font-medium">
                {ECHO_CONFIG.cgRange.lightWeight.forward} - {ECHO_CONFIG.cgRange.lightWeight.aft} mm
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">At {ECHO_CONFIG.cgRange.heavyWeight.weight} KG</dt>
              <dd className="font-medium">
                {ECHO_CONFIG.cgRange.heavyWeight.forward} - {ECHO_CONFIG.cgRange.heavyWeight.aft} mm
              </dd>
            </div>
            <div className="text-xs text-muted-foreground italic">
              Linear variation between points
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Fuel Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Fuel className="h-4 w-4" />
            Fuel Tanks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Main Tanks (L+R)</dt>
              <dd className="font-medium">
                {ECHO_CONFIG.fuel.mainTankGal * 2} USgal @ {ECHO_CONFIG.arms.mainTanks} mm
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Auxiliary Tanks (L+R)</dt>
              <dd className="font-medium">
                {ECHO_CONFIG.fuel.auxTankGal * 2} USgal @ {ECHO_CONFIG.arms.auxTanks} mm
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fuel Density (AVGAS)</dt>
              <dd className="font-medium">{ECHO_CONFIG.fuel.density} kg/L</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Loading Arms - Full Width */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Loading Arms & Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium">Location</th>
                  <th className="py-2 text-right font-medium">Arm (mm)</th>
                  <th className="py-2 text-right font-medium">Max Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2">Row 1 (Seats 1 & 2)</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.row1}</td>
                  <td className="py-2 text-right text-muted-foreground">Pilot + 1 Pax</td>
                </tr>
                <tr>
                  <td className="py-2">Row 2 (Seats 3 & 4)</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.row2}</td>
                  <td className="py-2 text-right text-muted-foreground">2 Passengers</td>
                </tr>
                <tr>
                  <td className="py-2">Row 3 (Seats 5 & 6)</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.row3}</td>
                  <td className="py-2 text-right text-muted-foreground">2 Passengers</td>
                </tr>
                <tr>
                  <td className="py-2">Forward Compartment</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.forwardCompt}</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.maxLoads.forwardCompt} KG</td>
                </tr>
                <tr>
                  <td className="py-2">Wing Compartments (L/R)</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.leftWingCompt}</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.maxLoads.leftWingCompt} KG each</td>
                </tr>
                <tr>
                  <td className="py-2">Rear Compartment</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.rearCompt}</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.maxLoads.rearCompt} KG</td>
                </tr>
                <tr>
                  <td className="py-2">Main Tanks (L+R)</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.mainTanks}</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.maxLoads.mainTanks} USgal each</td>
                </tr>
                <tr>
                  <td className="py-2">Auxiliary Tanks (L+R)</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.arms.auxTanks}</td>
                  <td className="py-2 text-right">{ECHO_CONFIG.maxLoads.auxTanks} USgal each</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
