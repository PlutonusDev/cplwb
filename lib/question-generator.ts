import {
  ECHO_CONFIG,
  calculateMomentIndex,
  calculateCG,
  calculatePercentMAC,
  getForwardCGLimit,
  calculateBallast,
  fuelGalToKg,
  fuelLtToKg,
  kgToLbs,
  lbsToKg,
  galToLt,
  randomInRange,
  roundTo,
} from "./echo-aircraft-data";
import type { Question, LoadingItem } from "./question-types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Unit types for randomization
type WeightUnit = "kg" | "lbs";
type FuelUnit = "gal" | "lt";

interface UnitConfig {
  weightUnit: WeightUnit;
  fuelUnit: FuelUnit;
}

function randomUnitConfig(): UnitConfig {
  return {
    weightUnit: Math.random() > 0.5 ? "kg" : "lbs",
    fuelUnit: Math.random() > 0.5 ? "gal" : "lt",
  };
}

// Generate passenger weight (max 77kg per seat)
function randomPassengerWeight(): number {
  return randomInRange(55, 77, 1);
}

function randomChildWeight(): number {
  return randomInRange(25, 45, 1);
}

// Format weight with unit
function formatWeight(kg: number, unit: WeightUnit): string {
  if (unit === "lbs") {
    return `${roundTo(kgToLbs(kg), 0)} lbs`;
  }
  return `${kg} kg`;
}

// Parse weight to kg regardless of display unit
function toKg(value: number, unit: WeightUnit): number {
  return unit === "lbs" ? roundTo(lbsToKg(value), 1) : value;
}

// Format fuel with unit
function formatFuel(gal: number, unit: FuelUnit): string {
  if (unit === "lt") {
    return `${roundTo(galToLt(gal), 0)} litres`;
  }
  return `${gal} US gallons`;
}

// Get fuel kg from displayed value
function fuelToKg(value: number, unit: FuelUnit): number {
  return unit === "lt" ? fuelLtToKg(value) : fuelGalToKg(value);
}

// Generate random passenger configuration
interface PassengerConfig {
  row1: { pilot: number; copilot: number | null };
  row2: { pax1: number | null; pax2: number | null };
  row3: { pax1: number | null; pax2: number | null };
}

function generateRandomPassengerConfig(includeRow3: boolean = false): PassengerConfig {
  const pilot = randomPassengerWeight();
  const hasCopilot = Math.random() > 0.4; // 60% chance of front passenger
  const copilot = hasCopilot ? randomPassengerWeight() : null;

  // Row 2: 0, 1, or 2 passengers
  const row2Count = Math.floor(Math.random() * 3); // 0, 1, or 2
  const row2Pax1 = row2Count >= 1 ? randomPassengerWeight() : null;
  const row2Pax2 = row2Count >= 2 ? randomPassengerWeight() : null;

  // Row 3: 0, 1, or 2 passengers (usually children)
  let row3Pax1: number | null = null;
  let row3Pax2: number | null = null;
  
  if (includeRow3) {
    const row3Count = Math.floor(Math.random() * 3);
    row3Pax1 = row3Count >= 1 ? randomChildWeight() : null;
    row3Pax2 = row3Count >= 2 ? randomChildWeight() : null;
  }

  return {
    row1: { pilot, copilot },
    row2: { pax1: row2Pax1, pax2: row2Pax2 },
    row3: { pax1: row3Pax1, pax2: row3Pax2 },
  };
}

// Generate scenario text from passenger config
function generatePassengerScenarioText(
  config: PassengerConfig,
  units: UnitConfig
): string {
  const parts: string[] = [];
  
  // Row 1
  if (config.row1.copilot !== null) {
    parts.push(`The pilot weighs ${formatWeight(config.row1.pilot, units.weightUnit)} and sits in the left front seat. A front seat passenger weighing ${formatWeight(config.row1.copilot, units.weightUnit)} occupies the right front seat.`);
  } else {
    parts.push(`The pilot weighs ${formatWeight(config.row1.pilot, units.weightUnit)} and is the only occupant in the front row.`);
  }

  // Row 2
  if (config.row2.pax1 !== null && config.row2.pax2 !== null) {
    parts.push(`In the second row, there are two passengers weighing ${formatWeight(config.row2.pax1, units.weightUnit)} and ${formatWeight(config.row2.pax2, units.weightUnit)}.`);
  } else if (config.row2.pax1 !== null) {
    parts.push(`There is one passenger in the second row weighing ${formatWeight(config.row2.pax1, units.weightUnit)}.`);
  } else {
    parts.push(`The second row is empty.`);
  }

  // Row 3
  if (config.row3.pax1 !== null && config.row3.pax2 !== null) {
    parts.push(`Two children occupy the third row, weighing ${formatWeight(config.row3.pax1, units.weightUnit)} and ${formatWeight(config.row3.pax2, units.weightUnit)}.`);
  } else if (config.row3.pax1 !== null) {
    parts.push(`One child sits in the third row, weighing ${formatWeight(config.row3.pax1, units.weightUnit)}.`);
  } else if (config.row3.pax2 !== null) {
    // Edge case, shouldn't happen but handle it
    parts.push(`One child sits in the third row, weighing ${formatWeight(config.row3.pax2, units.weightUnit)}.`);
  }

  return parts.join("\n\n");
}

// Calculate loading items from passenger config
function getPassengerLoadingItems(config: PassengerConfig): LoadingItem[] {
  const items: LoadingItem[] = [];

  // Row 1
  const row1Weight = config.row1.pilot + (config.row1.copilot ?? 0);
  if (row1Weight > 0) {
    const row1Name = config.row1.copilot !== null ? "Row 1 (Pilot + Passenger)" : "Row 1 (Pilot only)";
    items.push({
      name: row1Name,
      weight: row1Weight,
      arm: ECHO_CONFIG.arms.row1,
      momentIndex: roundTo(calculateMomentIndex(row1Weight, ECHO_CONFIG.arms.row1), 1),
    });
  }

  // Row 2
  const row2Weight = (config.row2.pax1 ?? 0) + (config.row2.pax2 ?? 0);
  if (row2Weight > 0) {
    const paxCount = (config.row2.pax1 !== null ? 1 : 0) + (config.row2.pax2 !== null ? 1 : 0);
    const row2Name = paxCount === 2 ? "Row 2 (2 Passengers)" : "Row 2 (1 Passenger)";
    items.push({
      name: row2Name,
      weight: row2Weight,
      arm: ECHO_CONFIG.arms.row2,
      momentIndex: roundTo(calculateMomentIndex(row2Weight, ECHO_CONFIG.arms.row2), 1),
    });
  }

  // Row 3
  const row3Weight = (config.row3.pax1 ?? 0) + (config.row3.pax2 ?? 0);
  if (row3Weight > 0) {
    const childCount = (config.row3.pax1 !== null ? 1 : 0) + (config.row3.pax2 !== null ? 1 : 0);
    const row3Name = childCount === 2 ? "Row 3 (2 Children)" : "Row 3 (1 Child)";
    items.push({
      name: row3Name,
      weight: row3Weight,
      arm: ECHO_CONFIG.arms.row3,
      momentIndex: roundTo(calculateMomentIndex(row3Weight, ECHO_CONFIG.arms.row3), 1),
    });
  }

  return items;
}

interface LoadingData {
  items: LoadingItem[];
  scenarioText: string;
  basicEmptyWeight: number;
  basicEmptyIndex: number;
  units: UnitConfig;
}

function generatePercentMACLoading(): LoadingData {
  const units = randomUnitConfig();
  const basicEmptyWeight = randomInRange(1900, 2050, 10);
  const basicEmptyIndex = roundTo(randomInRange(465, 510, 5), 1);

  const paxConfig = generateRandomPassengerConfig(false);
  const passengerText = generatePassengerScenarioText(paxConfig, units);
  const passengerItems = getPassengerLoadingItems(paxConfig);

  const rearCargoWeight = randomInRange(15, 45, 5);
  const fuelGal = randomInRange(60, 100, 5);
  const fuelWeight = roundTo(fuelGalToKg(fuelGal), 0);

  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    ...passengerItems,
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];

  // Add ZFW subtotal
  const zfwTotals = items.reduce((acc, item) => ({ totalWeight: acc.totalWeight + item.weight, totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1) }), { totalWeight: 0, totalIndex: 0 });
  items.push({ name: "Zero Fuel Weight", weight: zfwTotals.totalWeight, arm: 0, momentIndex: zfwTotals.totalIndex });

  const fuelDisplayValue = units.fuelUnit === "lt" ? roundTo(galToLt(fuelGal), 0) : fuelGal;
  items.push({ 
    name: `Fuel (Main Tanks - ${fuelDisplayValue} ${units.fuelUnit === "lt" ? "lt" : "gal"})`, 
    weight: fuelWeight, 
    arm: ECHO_CONFIG.arms.mainTanks, 
    momentIndex: roundTo(calculateMomentIndex(fuelWeight, ECHO_CONFIG.arms.mainTanks), 1) 
  });

  const scenarioText = `An Echo aircraft has a basic empty weight of ${formatWeight(basicEmptyWeight, units.weightUnit)} and a basic moment index of ${basicEmptyIndex}.

${passengerText}

The rear compartment contains ${formatWeight(rearCargoWeight, units.weightUnit)} of baggage.

The main fuel tanks contain ${formatFuel(fuelGal, units.fuelUnit)} of fuel.`;

  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex, units };
}

function generateForwardCGLoading(): LoadingData {
  const units = randomUnitConfig();
  const basicEmptyWeight = randomInRange(1900, 2050, 10);
  const basicEmptyIndex = roundTo(randomInRange(465, 510, 5), 1);

  const paxConfig = generateRandomPassengerConfig(true); // Include row 3
  const passengerText = generatePassengerScenarioText(paxConfig, units);
  const passengerItems = getPassengerLoadingItems(paxConfig);

  const fwdCargoWeight = randomInRange(10, 30, 5);
  const rearCargoWeight = randomInRange(20, 60, 5);
  const fuelGal = randomInRange(70, 100, 5);
  const fuelWeight = roundTo(fuelGalToKg(fuelGal), 0);

  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    ...passengerItems,
    { name: "Forward Compartment", weight: fwdCargoWeight, arm: ECHO_CONFIG.arms.forwardCompt, momentIndex: roundTo(calculateMomentIndex(fwdCargoWeight, ECHO_CONFIG.arms.forwardCompt), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];

  const zfwTotals = items.reduce((acc, item) => ({ totalWeight: acc.totalWeight + item.weight, totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1) }), { totalWeight: 0, totalIndex: 0 });
  items.push({ name: "Zero Fuel Weight", weight: zfwTotals.totalWeight, arm: 0, momentIndex: zfwTotals.totalIndex });

  const fuelDisplayValue = units.fuelUnit === "lt" ? roundTo(galToLt(fuelGal), 0) : fuelGal;
  items.push({ 
    name: `Fuel (Main Tanks - ${fuelDisplayValue} ${units.fuelUnit === "lt" ? "lt" : "gal"})`, 
    weight: fuelWeight, 
    arm: ECHO_CONFIG.arms.mainTanks, 
    momentIndex: roundTo(calculateMomentIndex(fuelWeight, ECHO_CONFIG.arms.mainTanks), 1) 
  });

  const scenarioText = `An Echo aircraft has a basic empty weight of ${formatWeight(basicEmptyWeight, units.weightUnit)} with a basic moment index of ${basicEmptyIndex}.

${passengerText}

The forward compartment contains ${formatWeight(fwdCargoWeight, units.weightUnit)} of equipment and the rear compartment holds ${formatWeight(rearCargoWeight, units.weightUnit)} of luggage.

The aircraft has ${formatFuel(fuelGal, units.fuelUnit)} of fuel in the main tanks.`;

  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex, units };
}

function generateWeightBalanceLoading(): LoadingData {
  const units = randomUnitConfig();
  const basicEmptyWeight = randomInRange(1900, 2050, 10);
  const basicEmptyIndex = roundTo(randomInRange(465, 510, 5), 1);

  const paxConfig = generateRandomPassengerConfig(Math.random() > 0.5); // Sometimes include row 3
  const passengerText = generatePassengerScenarioText(paxConfig, units);
  const passengerItems = getPassengerLoadingItems(paxConfig);

  const fwdCargoWeight = randomInRange(15, 40, 5);
  const rearCargoWeight = randomInRange(40, 100, 5);
  const fuelGal = randomInRange(80, 100, 5);
  const fuelWeight = roundTo(fuelGalToKg(fuelGal), 0);
  const burnGal = randomInRange(20, 40, 5);
  const burnWeight = roundTo(fuelGalToKg(burnGal), 0);

  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    ...passengerItems,
    { name: "Forward Compartment", weight: fwdCargoWeight, arm: ECHO_CONFIG.arms.forwardCompt, momentIndex: roundTo(calculateMomentIndex(fwdCargoWeight, ECHO_CONFIG.arms.forwardCompt), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];

  const zfwTotals = items.reduce((acc, item) => ({ totalWeight: acc.totalWeight + item.weight, totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1) }), { totalWeight: 0, totalIndex: 0 });
  items.push({ name: "Zero Fuel Weight", weight: zfwTotals.totalWeight, arm: 0, momentIndex: zfwTotals.totalIndex });

  const fuelDisplayValue = units.fuelUnit === "lt" ? roundTo(galToLt(fuelGal), 0) : fuelGal;
  const burnDisplayValue = units.fuelUnit === "lt" ? roundTo(galToLt(burnGal), 0) : burnGal;
  
  items.push({ 
    name: `Fuel (Main Tanks - ${fuelDisplayValue} ${units.fuelUnit === "lt" ? "lt" : "gal"})`, 
    weight: fuelWeight, 
    arm: ECHO_CONFIG.arms.mainTanks, 
    momentIndex: roundTo(calculateMomentIndex(fuelWeight, ECHO_CONFIG.arms.mainTanks), 1) 
  });
  items.push({ 
    name: `Fuel Burn-off (${burnDisplayValue} ${units.fuelUnit === "lt" ? "lt" : "gal"})`, 
    weight: -burnWeight, 
    arm: ECHO_CONFIG.arms.mainTanks, 
    momentIndex: -roundTo(calculateMomentIndex(burnWeight, ECHO_CONFIG.arms.mainTanks), 1) 
  });

  const scenarioText = `An Echo aircraft has a basic empty weight of ${formatWeight(basicEmptyWeight, units.weightUnit)} and a basic moment index of ${basicEmptyIndex}.

${passengerText}

The forward compartment is loaded with ${formatWeight(fwdCargoWeight, units.weightUnit)} of cargo and the rear compartment contains ${formatWeight(rearCargoWeight, units.weightUnit)} of baggage.

The main fuel tanks are filled with ${formatFuel(fuelGal, units.fuelUnit)} of fuel. The flight is expected to use ${formatFuel(burnGal, units.fuelUnit)} of fuel.`;

  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex, units };
}

// Ballast method types
type BallastMethod = "fuel" | "weights";

interface BallastConfig {
  method: BallastMethod;
  weightSize?: 5 | 10;
  compartment?: "forward" | "rear" | "leftWing" | "rightWing";
}

function randomBallastConfig(): BallastConfig {
  const method: BallastMethod = Math.random() > 0.5 ? "fuel" : "weights";
  
  if (method === "fuel") {
    return { method: "fuel" };
  }

  const weightSize = Math.random() > 0.5 ? 5 : 10;
  const compartments: BallastConfig["compartment"][] = ["forward", "rear", "leftWing", "rightWing"];
  const compartment = compartments[Math.floor(Math.random() * compartments.length)];

  return { method: "weights", weightSize, compartment };
}

function getCompartmentName(comp: BallastConfig["compartment"]): string {
  switch (comp) {
    case "forward": return "forward compartment";
    case "rear": return "rear compartment";
    case "leftWing": return "left wing compartment";
    case "rightWing": return "right wing compartment";
    default: return "compartment";
  }
}

function getCompartmentArm(comp: BallastConfig["compartment"]): number {
  switch (comp) {
    case "forward": return ECHO_CONFIG.arms.forwardCompt;
    case "rear": return ECHO_CONFIG.arms.rearCompt;
    case "leftWing": return ECHO_CONFIG.arms.leftWingCompt;
    case "rightWing": return ECHO_CONFIG.arms.rightWingCompt;
    default: return ECHO_CONFIG.arms.rearCompt;
  }
}

function generateBallastLoading(): LoadingData & { ballastConfig: BallastConfig } {
  const units = randomUnitConfig();
  const basicEmptyWeight = randomInRange(1920, 2000, 10);
  const basicEmptyIndex = roundTo(randomInRange(470, 490, 5), 1);

  // Create a loading that's forward of CG limits
  const pilotWeight = randomPassengerWeight();
  const copilotWeight = Math.random() > 0.5 ? randomPassengerWeight() : null;
  const row1Weight = pilotWeight + (copilotWeight ?? 0);

  // Heavy forward loading to push CG forward
  const fwdCargoWeight = randomInRange(45, 55, 5);
  const rearCargoWeight = randomInRange(5, 15, 5);

  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    { 
      name: copilotWeight ? "Row 1 (Pilot + Passenger)" : "Row 1 (Pilot only)", 
      weight: row1Weight, 
      arm: ECHO_CONFIG.arms.row1, 
      momentIndex: roundTo(calculateMomentIndex(row1Weight, ECHO_CONFIG.arms.row1), 1) 
    },
    { name: "Forward Compartment", weight: fwdCargoWeight, arm: ECHO_CONFIG.arms.forwardCompt, momentIndex: roundTo(calculateMomentIndex(fwdCargoWeight, ECHO_CONFIG.arms.forwardCompt), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];

  const ballastConfig = randomBallastConfig();

  let passengerText: string;
  if (copilotWeight !== null) {
    passengerText = `The pilot weighing ${formatWeight(pilotWeight, units.weightUnit)} and a front seat passenger weighing ${formatWeight(copilotWeight, units.weightUnit)} are the only occupants.`;
  } else {
    passengerText = `The pilot weighing ${formatWeight(pilotWeight, units.weightUnit)} is the only occupant.`;
  }

  let ballastText: string;
  if (ballastConfig.method === "fuel") {
    ballastText = `No fuel has been loaded yet. Calculate how much fuel must be added to the main tanks to bring the CG within limits.`;
  } else {
    ballastText = `No fuel has been loaded yet. Calculate how many ${ballastConfig.weightSize} kg weights must be placed in the ${getCompartmentName(ballastConfig.compartment)} to bring the CG within limits.`;
  }

  const scenarioText = `An Echo aircraft has a basic empty weight of ${formatWeight(basicEmptyWeight, units.weightUnit)} and a basic moment index of ${basicEmptyIndex}.

${passengerText}

The forward compartment contains ${formatWeight(fwdCargoWeight, units.weightUnit)} of dense equipment and there is ${formatWeight(rearCargoWeight, units.weightUnit)} of light baggage in the rear compartment.

${ballastText}`;

  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex, units, ballastConfig };
}

function calculateTotals(items: LoadingItem[]): { totalWeight: number; totalIndex: number } {
  return items.reduce(
    (acc, item) => ({
      totalWeight: acc.totalWeight + item.weight,
      totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1),
    }),
    { totalWeight: 0, totalIndex: 0 }
  );
}

function formatTableRow(name: string, weight: number | string, arm: number | string, index: number | string): string {
  const nameStr = String(name).padEnd(29);
  const weightStr = String(weight).padStart(11);
  const armStr = String(arm).padStart(8);
  const indexStr = String(index).padStart(9);
  return `${nameStr} | ${weightStr} | ${armStr} | ${indexStr}`;
}

export function generatePercentMACQuestion(): Question {
  const { items, scenarioText, units } = generatePercentMACLoading();

  const totals = calculateTotals(items.filter(i => i.name !== "Zero Fuel Weight"));
  const cgPosition = calculateCG(totals.totalWeight, totals.totalIndex);
  const percentMAC = calculatePercentMAC(cgPosition);

  const tableHeader = `${"=".repeat(66)}\nItem                          | Weight (kg) | Arm (mm) | Mom Index\n${"=".repeat(66)}`;
  const tableRows = items.map(item => {
    if (item.name === "Zero Fuel Weight") {
      return `${"=".repeat(66)}\n${formatTableRow(item.name, item.weight, "", item.momentIndex)}`;
    }
    if (item.name.includes("Aeroplane Basic")) {
      return formatTableRow(item.name, item.weight, "", item.momentIndex);
    }
    return formatTableRow(item.name, item.weight, item.arm, item.momentIndex);
  }).join('\n');

  return {
    id: generateId(),
    type: "percent-mac",
    title: "%MAC Calculation",
    scenario: `Using Loading System ECHO, calculate the Centre of Gravity position as a percentage of Mean Aerodynamic Chord. (Weights given in ${units.weightUnit}, fuel in ${units.fuelUnit})`,
    scenarioText,
    loadingTable: items,
    question: "Calculate the Centre of Gravity position as a percentage of the Mean Aerodynamic Chord (%MAC) at take-off.",
    answer: `${roundTo(percentMAC, 1)}% MAC`,
    workings: `
WEIGHT & BALANCE TABLE:
${tableHeader}
${tableRows}
${"=".repeat(66)}
${formatTableRow("TAKE-OFF TOTALS", totals.totalWeight, "", roundTo(totals.totalIndex, 1))}
${"=".repeat(66)}

CALCULATIONS:
1. CG Position:
   CG = (Moment Index x 10000) / Weight
   CG = (${roundTo(totals.totalIndex, 1)} x 10000) / ${totals.totalWeight}
   CG = ${roundTo(cgPosition, 1)} mm aft of datum

2. %MAC Calculation:
   MAC Length = ${ECHO_CONFIG.mac.length} mm
   MAC Leading Edge = ${ECHO_CONFIG.mac.leadingEdge} mm aft of datum
   
   %MAC = (CG - LE) / MAC x 100
   %MAC = (${roundTo(cgPosition, 1)} - ${ECHO_CONFIG.mac.leadingEdge}) / ${ECHO_CONFIG.mac.length} x 100
   %MAC = ${roundTo(percentMAC, 1)}%
    `.trim(),
    numericalAnswer: roundTo(percentMAC, 1),
    unit: "% MAC",
  };
}

export function generateForwardCGLimitQuestion(): Question {
  const { items, scenarioText, units } = generateForwardCGLoading();

  const totals = calculateTotals(items.filter(i => i.name !== "Zero Fuel Weight"));
  const forwardLimit = getForwardCGLimit(totals.totalWeight);
  const forwardLimitMAC = calculatePercentMAC(forwardLimit);

  const tableHeader = `${"=".repeat(66)}\nItem                          | Weight (kg) | Arm (mm) | Mom Index\n${"=".repeat(66)}`;
  const tableRows = items.map(item => {
    if (item.name === "Zero Fuel Weight") {
      return `${"=".repeat(66)}\n${formatTableRow(item.name, item.weight, "", item.momentIndex)}`;
    }
    if (item.name.includes("Aeroplane Basic")) {
      return formatTableRow(item.name, item.weight, "", item.momentIndex);
    }
    return formatTableRow(item.name, item.weight, item.arm, item.momentIndex);
  }).join('\n');

  return {
    id: generateId(),
    type: "forward-cg-limit",
    title: "Forward CG Limit",
    scenario: `Using Loading System ECHO, determine the forward CG limit for the given loading. (Weights given in ${units.weightUnit}, fuel in ${units.fuelUnit})`,
    scenarioText,
    loadingTable: items,
    question: "Determine the forward CG limit for this aircraft at the take-off weight, expressed as a position in mm aft of datum AND as %MAC.",
    answer: `Forward CG Limit: ${roundTo(forwardLimit, 0)} mm aft of datum (${roundTo(forwardLimitMAC, 1)}% MAC)`,
    workings: `
WEIGHT & BALANCE TABLE:
${tableHeader}
${tableRows}
${"=".repeat(66)}
${formatTableRow("TAKE-OFF TOTALS", totals.totalWeight, "", roundTo(totals.totalIndex, 1))}
${"=".repeat(66)}

CALCULATIONS:
1. Take-off Weight = ${totals.totalWeight} kg

2. Forward CG Limit (Linear Interpolation):
   At ${ECHO_CONFIG.cgRange.lightWeight.weight} kg: Forward limit = ${ECHO_CONFIG.cgRange.lightWeight.forward} mm
   At ${ECHO_CONFIG.cgRange.heavyWeight.weight} kg: Forward limit = ${ECHO_CONFIG.cgRange.heavyWeight.forward} mm
   
   Ratio = (${totals.totalWeight} - ${ECHO_CONFIG.cgRange.lightWeight.weight}) / (${ECHO_CONFIG.cgRange.heavyWeight.weight} - ${ECHO_CONFIG.cgRange.lightWeight.weight})
   Ratio = ${roundTo((totals.totalWeight - ECHO_CONFIG.cgRange.lightWeight.weight) / (ECHO_CONFIG.cgRange.heavyWeight.weight - ECHO_CONFIG.cgRange.lightWeight.weight), 3)}
   
   Forward Limit = ${ECHO_CONFIG.cgRange.lightWeight.forward} + ${roundTo((totals.totalWeight - ECHO_CONFIG.cgRange.lightWeight.weight) / (ECHO_CONFIG.cgRange.heavyWeight.weight - ECHO_CONFIG.cgRange.lightWeight.weight), 3)} x (${ECHO_CONFIG.cgRange.heavyWeight.forward} - ${ECHO_CONFIG.cgRange.lightWeight.forward})
   Forward Limit = ${roundTo(forwardLimit, 0)} mm aft of datum

3. Convert to %MAC:
   %MAC = (${roundTo(forwardLimit, 0)} - ${ECHO_CONFIG.mac.leadingEdge}) / ${ECHO_CONFIG.mac.length} x 100
   %MAC = ${roundTo(forwardLimitMAC, 1)}%
    `.trim(),
    numericalAnswer: roundTo(forwardLimit, 0),
    unit: "mm",
  };
}

export function generateWeightBalanceQuestion(): Question {
  const { items, scenarioText, units } = generateWeightBalanceLoading();

  const nonZfwItems = items.filter(i => i.name !== "Zero Fuel Weight" && !i.name.includes("Burn-off"));
  const towTotals = calculateTotals(nonZfwItems);
  const towCG = calculateCG(towTotals.totalWeight, towTotals.totalIndex);

  const burnItem = items.find(i => i.name.includes("Burn-off"));
  const burnWeight = burnItem ? Math.abs(burnItem.weight) : 0;
  const burnIndex = burnItem ? Math.abs(burnItem.momentIndex) : 0;

  const landingWeight = towTotals.totalWeight - burnWeight;
  const landingIndex = roundTo(towTotals.totalIndex - burnIndex, 1);
  const landingCG = calculateCG(landingWeight, landingIndex);

  const towForwardLimit = getForwardCGLimit(towTotals.totalWeight);
  const landingForwardLimit = getForwardCGLimit(landingWeight);

  const isTowWithinLimits = towTotals.totalWeight <= ECHO_CONFIG.weights.maxTakeoffWeight &&
    towCG >= towForwardLimit && towCG <= ECHO_CONFIG.cgRange.lightWeight.aft;

  const isLandingWithinLimits = landingWeight <= ECHO_CONFIG.weights.maxLandingWeight &&
    landingCG >= landingForwardLimit && landingCG <= ECHO_CONFIG.cgRange.lightWeight.aft;

  const tableHeader = `${"=".repeat(66)}\nItem                          | Weight (kg) | Arm (mm) | Mom Index\n${"=".repeat(66)}`;
  const tableRows = items.map(item => {
    if (item.name === "Zero Fuel Weight") {
      return `${"=".repeat(66)}\n${formatTableRow(item.name, item.weight, "", item.momentIndex)}`;
    }
    if (item.name.includes("Aeroplane Basic")) {
      return formatTableRow(item.name, item.weight, "", item.momentIndex);
    }
    if (item.name.includes("Burn-off")) {
      return `${"=".repeat(66)}\n${formatTableRow(item.name, item.weight, item.arm, item.momentIndex)}`;
    }
    return formatTableRow(item.name, item.weight, item.arm, item.momentIndex);
  }).join('\n');

  return {
    id: generateId(),
    type: "weight-balance",
    title: "Weight & Balance Check",
    scenario: `Using Loading System ECHO, verify the aircraft loading is within limits. (Weights given in ${units.weightUnit}, fuel in ${units.fuelUnit})`,
    scenarioText,
    loadingTable: items,
    question: `1. Calculate the Take-off Weight and CG position
2. Calculate the Landing Weight and CG position  
3. Is the aircraft within weight and balance limits for the entire flight?`,
    answer: `1. Take-off Weight: ${towTotals.totalWeight} kg, CG: ${roundTo(towCG, 1)} mm aft of datum
2. Landing Weight: ${landingWeight} kg, CG: ${roundTo(landingCG, 1)} mm aft of datum
3. ${isTowWithinLimits && isLandingWithinLimits ? "Yes, within limits" : "No, outside limits"}`,
    workings: `
WEIGHT & BALANCE TABLE:
${tableHeader}
${tableRows}
${"=".repeat(66)}
${formatTableRow("TAKE-OFF TOTALS", towTotals.totalWeight, "", roundTo(towTotals.totalIndex, 1))}
${formatTableRow("LANDING TOTALS", landingWeight, "", landingIndex)}
${"=".repeat(66)}

TAKE-OFF CHECK:
Weight: ${towTotals.totalWeight} kg (MTOW: ${ECHO_CONFIG.weights.maxTakeoffWeight} kg) ${towTotals.totalWeight <= ECHO_CONFIG.weights.maxTakeoffWeight ? "OK" : "EXCEEDED"}
CG: ${roundTo(towCG, 1)} mm
Forward Limit at ${towTotals.totalWeight} kg: ${roundTo(towForwardLimit, 0)} mm
Aft Limit: ${ECHO_CONFIG.cgRange.lightWeight.aft} mm
Status: ${isTowWithinLimits ? "WITHIN LIMITS" : "OUTSIDE LIMITS"}

LANDING CHECK:
Weight: ${landingWeight} kg (MLW: ${ECHO_CONFIG.weights.maxLandingWeight} kg) ${landingWeight <= ECHO_CONFIG.weights.maxLandingWeight ? "OK" : "EXCEEDED"}
CG: ${roundTo(landingCG, 1)} mm
Forward Limit at ${landingWeight} kg: ${roundTo(landingForwardLimit, 0)} mm
Aft Limit: ${ECHO_CONFIG.cgRange.lightWeight.aft} mm
Status: ${isLandingWithinLimits ? "WITHIN LIMITS" : "OUTSIDE LIMITS"}

FINAL RESULT: ${isTowWithinLimits && isLandingWithinLimits ? "Aircraft is within all limits" : "Aircraft exceeds limits"}
    `.trim(),
    numericalAnswer: towTotals.totalWeight,
    unit: "kg",
  };
}

export function generateBallastQuestion(): Question {
  const { items, scenarioText, units, ballastConfig } = generateBallastLoading();

  const totals = calculateTotals(items);
  const currentCG = calculateCG(totals.totalWeight, totals.totalIndex);
  const forwardLimit = getForwardCGLimit(totals.totalWeight);

  // Target CG is slightly inside the forward limit
  const targetCG = forwardLimit + 10;

  let answer: string;
  let workings: string;

  const tableHeader = `${"=".repeat(66)}\nItem                          | Weight (kg) | Arm (mm) | Mom Index\n${"=".repeat(66)}`;
  const tableRows = items.map(item => {
    if (item.name.includes("Aeroplane Basic")) {
      return formatTableRow(item.name, item.weight, "", item.momentIndex);
    }
    return formatTableRow(item.name, item.weight, item.arm, item.momentIndex);
  }).join('\n');

  if (ballastConfig.method === "fuel") {
    const fuelArm = ECHO_CONFIG.arms.mainTanks;
    const ballastRequired = calculateBallast(totals.totalWeight, currentCG, targetCG, fuelArm);
    const fuelGallons = roundTo(ballastRequired / (ECHO_CONFIG.fuel.galToLitre * ECHO_CONFIG.fuel.density), 0);
    const fuelLitres = roundTo(fuelGallons * ECHO_CONFIG.fuel.galToLitre, 0);

    answer = units.fuelUnit === "lt" 
      ? `Approximately ${fuelLitres} litres of fuel required`
      : `Approximately ${fuelGallons} US gallons of fuel required`;

    workings = `
INITIAL WEIGHT & BALANCE TABLE:
${tableHeader}
${tableRows}
${"=".repeat(66)}
${formatTableRow("TOTALS (no fuel)", totals.totalWeight, "", roundTo(totals.totalIndex, 1))}
${"=".repeat(66)}

CALCULATIONS:
1. Current CG Position:
   CG = (${roundTo(totals.totalIndex, 1)} x 10000) / ${totals.totalWeight}
   CG = ${roundTo(currentCG, 1)} mm aft of datum

2. Forward CG Limit at ${totals.totalWeight} kg:
   Forward Limit = ${roundTo(forwardLimit, 0)} mm (CG is FORWARD of limit!)

3. Target CG = ${targetCG} mm (just inside forward limit)

4. Fuel required (Ballast Formula):
   Fuel Arm = ${fuelArm} mm
   
   Ballast = Weight x (Target CG - Current CG) / (Ballast Arm - Target CG)
   Ballast = ${totals.totalWeight} x (${targetCG} - ${roundTo(currentCG, 1)}) / (${fuelArm} - ${targetCG})
   Ballast = ${roundTo(ballastRequired, 1)} kg

5. Convert to volume:
   Fuel = ${roundTo(ballastRequired, 1)} / (3.785 x 0.72) = ${fuelGallons} US gal
   Or: ${fuelLitres} litres

ANSWER: Add approximately ${fuelGallons} US gallons (${fuelLitres} lt) of fuel to main tanks.
    `.trim();
  } else {
    const ballastArm = getCompartmentArm(ballastConfig.compartment);
    const ballastRequired = calculateBallast(totals.totalWeight, currentCG, targetCG, ballastArm);
    const numberOfWeights = Math.ceil(ballastRequired / ballastConfig.weightSize!);
    const actualBallast = numberOfWeights * ballastConfig.weightSize!;

    answer = `${numberOfWeights} x ${ballastConfig.weightSize} kg weights (${actualBallast} kg total) in the ${getCompartmentName(ballastConfig.compartment)}`;

    workings = `
INITIAL WEIGHT & BALANCE TABLE:
${tableHeader}
${tableRows}
${"=".repeat(66)}
${formatTableRow("TOTALS (no fuel)", totals.totalWeight, "", roundTo(totals.totalIndex, 1))}
${"=".repeat(66)}

CALCULATIONS:
1. Current CG Position:
   CG = (${roundTo(totals.totalIndex, 1)} x 10000) / ${totals.totalWeight}
   CG = ${roundTo(currentCG, 1)} mm aft of datum

2. Forward CG Limit at ${totals.totalWeight} kg:
   Forward Limit = ${roundTo(forwardLimit, 0)} mm (CG is FORWARD of limit!)

3. Target CG = ${targetCG} mm (just inside forward limit)

4. Ballast required in ${getCompartmentName(ballastConfig.compartment)}:
   Compartment Arm = ${ballastArm} mm
   
   Ballast = Weight x (Target CG - Current CG) / (Ballast Arm - Target CG)
   Ballast = ${totals.totalWeight} x (${targetCG} - ${roundTo(currentCG, 1)}) / (${ballastArm} - ${targetCG})
   Ballast = ${roundTo(ballastRequired, 1)} kg

5. Using ${ballastConfig.weightSize} kg weights:
   Number of weights = ${roundTo(ballastRequired, 1)} / ${ballastConfig.weightSize} = ${roundTo(ballastRequired / ballastConfig.weightSize!, 2)}
   Round up to ${numberOfWeights} weights = ${actualBallast} kg

ANSWER: Add ${numberOfWeights} x ${ballastConfig.weightSize} kg weights (${actualBallast} kg) to ${getCompartmentName(ballastConfig.compartment)}.
    `.trim();
  }

  return {
    id: generateId(),
    type: "ballast",
    title: "Ballast Calculation",
    scenario: `Using Loading System ECHO, calculate the ballast required to bring the CG within limits. (Weights given in ${units.weightUnit})`,
    scenarioText,
    loadingTable: items,
    question: ballastConfig.method === "fuel" 
      ? "How much fuel must be added to the main tanks to bring the CG within limits?"
      : `How many ${ballastConfig.weightSize} kg weights must be placed in the ${getCompartmentName(ballastConfig.compartment)} to bring the CG within limits?`,
    answer,
    workings,
    numericalAnswer: ballastConfig.method === "fuel" 
      ? roundTo(calculateBallast(totals.totalWeight, currentCG, targetCG, ECHO_CONFIG.arms.mainTanks) / (ECHO_CONFIG.fuel.galToLitre * ECHO_CONFIG.fuel.density), 0)
      : Math.ceil(calculateBallast(totals.totalWeight, currentCG, targetCG, getCompartmentArm(ballastConfig.compartment)) / ballastConfig.weightSize!),
    unit: ballastConfig.method === "fuel" ? "gallons" : "weights",
  };
}

export function generateRandomQuestion(): Question {
  const types = ["percent-mac", "forward-cg-limit", "weight-balance", "ballast"];
  const randomType = types[Math.floor(Math.random() * types.length)];

  switch (randomType) {
    case "percent-mac":
      return generatePercentMACQuestion();
    case "forward-cg-limit":
      return generateForwardCGLimitQuestion();
    case "weight-balance":
      return generateWeightBalanceQuestion();
    case "ballast":
      return generateBallastQuestion();
    default:
      return generatePercentMACQuestion();
  }
}

export function generateQuestionSet(types: string[], countPerType: number): Question[] {
  const questions: Question[] = [];
  
  for (const type of types) {
    for (let i = 0; i < countPerType; i++) {
      switch (type) {
        case "percent-mac":
          questions.push(generatePercentMACQuestion());
          break;
        case "forward-cg-limit":
          questions.push(generateForwardCGLimitQuestion());
          break;
        case "weight-balance":
          questions.push(generateWeightBalanceQuestion());
          break;
        case "ballast":
          questions.push(generateBallastQuestion());
          break;
      }
    }
  }
  
  return questions;
}
