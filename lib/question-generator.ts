import {
  ECHO_CONFIG,
  calculateMomentIndex,
  calculateCG,
  calculatePercentMAC,
  getForwardCGLimit,
  calculateBallast,
  fuelGalToKg,
  randomInRange,
  roundTo,
} from "./echo-aircraft-data";
import type { Question, QuestionType, LoadingItem } from "./question-types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Generate realistic passenger weights
function randomPassengerWeight(): number {
  return randomInRange(65, 95, 1);
}

function randomChildWeight(): number {
  return randomInRange(25, 45, 1);
}

interface LoadingData {
  items: LoadingItem[];
  scenarioText: string;
  basicEmptyWeight: number;
  basicEmptyIndex: number;
}

function generatePercentMACLoading(): LoadingData {
  const basicEmptyWeight = randomInRange(1900, 2050, 10);
  const basicEmptyIndex = roundTo(randomInRange(465, 510, 5), 1);
  
  const pilotWeight = randomPassengerWeight();
  const copilotWeight = randomPassengerWeight();
  const row1Weight = pilotWeight + copilotWeight;
  
  const pax1Weight = randomPassengerWeight();
  const pax2Weight = randomPassengerWeight();
  const row2Weight = pax1Weight + pax2Weight;
  
  const rearCargoWeight = randomInRange(15, 45, 5);
  const fuelGal = randomInRange(60, 100, 5);
  const fuelWeight = roundTo(fuelGalToKg(fuelGal), 0);
  
  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    { name: "Row 1 (Pilot + Passenger)", weight: row1Weight, arm: ECHO_CONFIG.arms.row1, momentIndex: roundTo(calculateMomentIndex(row1Weight, ECHO_CONFIG.arms.row1), 1) },
    { name: "Row 2 (2 Passengers)", weight: row2Weight, arm: ECHO_CONFIG.arms.row2, momentIndex: roundTo(calculateMomentIndex(row2Weight, ECHO_CONFIG.arms.row2), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];
  
  // Add ZFW subtotal
  const zfwTotals = items.reduce((acc, item) => ({ totalWeight: acc.totalWeight + item.weight, totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1) }), { totalWeight: 0, totalIndex: 0 });
  items.push({ name: "Zero Fuel Weight", weight: zfwTotals.totalWeight, arm: 0, momentIndex: zfwTotals.totalIndex });
  
  items.push({ name: `Fuel (Main Tanks - ${fuelGal} gal)`, weight: fuelWeight, arm: ECHO_CONFIG.arms.mainTanks, momentIndex: roundTo(calculateMomentIndex(fuelWeight, ECHO_CONFIG.arms.mainTanks), 1) });
  
  const scenarioText = `An Echo aircraft has a basic empty weight of ${basicEmptyWeight} kg and a basic moment index of ${basicEmptyIndex}. The pilot weighs ${pilotWeight} kg and occupies the left seat. A front seat passenger weighing ${copilotWeight} kg sits in the right seat.

In row 2, there are two passengers weighing ${pax1Weight} kg and ${pax2Weight} kg.

The rear compartment contains ${rearCargoWeight} kg of baggage.

The main fuel tanks contain ${fuelGal} US gallons of fuel.`;
  
  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex };
}

function generateForwardCGLoading(): LoadingData {
  const basicEmptyWeight = randomInRange(1900, 2050, 10);
  const basicEmptyIndex = roundTo(randomInRange(465, 510, 5), 1);
  
  const pilotWeight = randomPassengerWeight();
  const copilotWeight = randomPassengerWeight();
  const row1Weight = pilotWeight + copilotWeight;
  
  const row2Pax1 = randomPassengerWeight();
  const row2Pax2 = randomPassengerWeight();
  const row2Weight = row2Pax1 + row2Pax2;
  
  const row3Child1 = randomChildWeight();
  const row3Child2 = randomChildWeight();
  const row3Weight = row3Child1 + row3Child2;
  
  const fwdCargoWeight = randomInRange(10, 30, 5);
  const rearCargoWeight = randomInRange(20, 60, 5);
  const fuelGal = randomInRange(70, 100, 5);
  const fuelWeight = roundTo(fuelGalToKg(fuelGal), 0);
  
  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    { name: "Row 1 (Pilot + Passenger)", weight: row1Weight, arm: ECHO_CONFIG.arms.row1, momentIndex: roundTo(calculateMomentIndex(row1Weight, ECHO_CONFIG.arms.row1), 1) },
    { name: "Row 2 (2 Passengers)", weight: row2Weight, arm: ECHO_CONFIG.arms.row2, momentIndex: roundTo(calculateMomentIndex(row2Weight, ECHO_CONFIG.arms.row2), 1) },
    { name: "Row 3 (2 Children)", weight: row3Weight, arm: ECHO_CONFIG.arms.row3, momentIndex: roundTo(calculateMomentIndex(row3Weight, ECHO_CONFIG.arms.row3), 1) },
    { name: "Forward Compartment", weight: fwdCargoWeight, arm: ECHO_CONFIG.arms.forwardCompt, momentIndex: roundTo(calculateMomentIndex(fwdCargoWeight, ECHO_CONFIG.arms.forwardCompt), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];
  
  const zfwTotals = items.reduce((acc, item) => ({ totalWeight: acc.totalWeight + item.weight, totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1) }), { totalWeight: 0, totalIndex: 0 });
  items.push({ name: "Zero Fuel Weight", weight: zfwTotals.totalWeight, arm: 0, momentIndex: zfwTotals.totalIndex });
  
  items.push({ name: `Fuel (Main Tanks - ${fuelGal} gal)`, weight: fuelWeight, arm: ECHO_CONFIG.arms.mainTanks, momentIndex: roundTo(calculateMomentIndex(fuelWeight, ECHO_CONFIG.arms.mainTanks), 1) });
  
  const scenarioText = `An Echo aircraft has a basic empty weight of ${basicEmptyWeight} kg with a basic moment index of ${basicEmptyIndex}. The pilot weighs ${pilotWeight} kg and the front seat passenger weighs ${copilotWeight} kg.

In the second row sit two adult passengers weighing ${row2Pax1} kg and ${row2Pax2} kg respectively.

Two children occupy the third row, weighing ${row3Child1} kg and ${row3Child2} kg.

The forward compartment contains ${fwdCargoWeight} kg of equipment and the rear compartment holds ${rearCargoWeight} kg of luggage.

The aircraft has ${fuelGal} US gallons of fuel in the main tanks.`;
  
  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex };
}

function generateWeightBalanceLoading(): LoadingData {
  const basicEmptyWeight = randomInRange(1900, 2050, 10);
  const basicEmptyIndex = roundTo(randomInRange(465, 510, 5), 1);
  
  const pilotWeight = randomPassengerWeight();
  const copilotWeight = randomPassengerWeight();
  const row1Weight = pilotWeight + copilotWeight;
  
  const row2Pax1 = randomPassengerWeight();
  const row2Pax2 = randomPassengerWeight();
  const row2Weight = row2Pax1 + row2Pax2;
  
  const fwdCargoWeight = randomInRange(15, 40, 5);
  const rearCargoWeight = randomInRange(40, 100, 5);
  const fuelGal = randomInRange(80, 100, 5);
  const fuelWeight = roundTo(fuelGalToKg(fuelGal), 0);
  const burnGal = randomInRange(20, 40, 5);
  const burnWeight = roundTo(fuelGalToKg(burnGal), 0);
  
  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    { name: "Row 1 (Pilot + Passenger)", weight: row1Weight, arm: ECHO_CONFIG.arms.row1, momentIndex: roundTo(calculateMomentIndex(row1Weight, ECHO_CONFIG.arms.row1), 1) },
    { name: "Row 2 (2 Passengers)", weight: row2Weight, arm: ECHO_CONFIG.arms.row2, momentIndex: roundTo(calculateMomentIndex(row2Weight, ECHO_CONFIG.arms.row2), 1) },
    { name: "Forward Compartment", weight: fwdCargoWeight, arm: ECHO_CONFIG.arms.forwardCompt, momentIndex: roundTo(calculateMomentIndex(fwdCargoWeight, ECHO_CONFIG.arms.forwardCompt), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];
  
  const zfwTotals = items.reduce((acc, item) => ({ totalWeight: acc.totalWeight + item.weight, totalIndex: roundTo(acc.totalIndex + item.momentIndex, 1) }), { totalWeight: 0, totalIndex: 0 });
  items.push({ name: "Zero Fuel Weight", weight: zfwTotals.totalWeight, arm: 0, momentIndex: zfwTotals.totalIndex });
  
  items.push({ name: `Fuel (Main Tanks - ${fuelGal} gal)`, weight: fuelWeight, arm: ECHO_CONFIG.arms.mainTanks, momentIndex: roundTo(calculateMomentIndex(fuelWeight, ECHO_CONFIG.arms.mainTanks), 1) });
  items.push({ name: `Fuel Burn-off (${burnGal} gal)`, weight: -burnWeight, arm: ECHO_CONFIG.arms.mainTanks, momentIndex: -roundTo(calculateMomentIndex(burnWeight, ECHO_CONFIG.arms.mainTanks), 1) });
  
  const scenarioText = `An Echo aircraft has a basic empty weight of ${basicEmptyWeight} kg and a basic moment index of ${basicEmptyIndex}. The pilot weighs ${pilotWeight} kg and a front seat passenger weighs ${copilotWeight} kg.

Two passengers in the second row weigh ${row2Pax1} kg and ${row2Pax2} kg.

The forward compartment is loaded with ${fwdCargoWeight} kg of cargo and the rear compartment contains ${rearCargoWeight} kg of baggage.

The main fuel tanks are filled with ${fuelGal} US gallons of fuel. The flight is expected to use ${burnGal} US gallons of fuel.`;
  
  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex };
}

function generateBallastLoading(): LoadingData {
  const basicEmptyWeight = randomInRange(1920, 2000, 10);
  const basicEmptyIndex = roundTo(randomInRange(470, 490, 5), 1);
  
  const pilotWeight = randomPassengerWeight();
  const copilotWeight = randomPassengerWeight();
  const row1Weight = pilotWeight + copilotWeight;
  
  // Heavy forward loading to push CG forward
  const fwdCargoWeight = randomInRange(45, 55, 5);
  const rearCargoWeight = randomInRange(5, 15, 5);
  
  const items: LoadingItem[] = [
    { name: "Aeroplane Basic Empty Weight", weight: basicEmptyWeight, arm: 0, momentIndex: basicEmptyIndex },
    { name: "Row 1 (Pilot + Passenger)", weight: row1Weight, arm: ECHO_CONFIG.arms.row1, momentIndex: roundTo(calculateMomentIndex(row1Weight, ECHO_CONFIG.arms.row1), 1) },
    { name: "Forward Compartment", weight: fwdCargoWeight, arm: ECHO_CONFIG.arms.forwardCompt, momentIndex: roundTo(calculateMomentIndex(fwdCargoWeight, ECHO_CONFIG.arms.forwardCompt), 1) },
    { name: "Rear Compartment", weight: rearCargoWeight, arm: ECHO_CONFIG.arms.rearCompt, momentIndex: roundTo(calculateMomentIndex(rearCargoWeight, ECHO_CONFIG.arms.rearCompt), 1) },
  ];
  
  const scenarioText = `An Echo aircraft has a basic empty weight of ${basicEmptyWeight} kg and a basic moment index of ${basicEmptyIndex}. The pilot weighing ${pilotWeight} kg and a front seat passenger weighing ${copilotWeight} kg are the only occupants.

The forward compartment contains ${fwdCargoWeight} kg of dense equipment and there is ${rearCargoWeight} kg of light baggage in the rear compartment.

No fuel has been loaded yet. After calculation, the CG is found to be forward of limits.`;
  
  return { items, scenarioText, basicEmptyWeight, basicEmptyIndex };
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

export function generatePercentMACQuestion(): Question {
  const { items, scenarioText } = generatePercentMACLoading();
  
  const totals = calculateTotals(items.filter(i => i.name !== "Zero Fuel Weight"));
  const cgPosition = calculateCG(totals.totalWeight, totals.totalIndex);
  const percentMAC = calculatePercentMAC(cgPosition);
  
  return {
    id: generateId(),
    type: "percent-mac",
    title: "%MAC Calculation",
    scenario: "Using Loading System ECHO, calculate the Centre of Gravity position as a percentage of Mean Aerodynamic Chord.",
    scenarioText,
    loadingTable: items,
    question: "Calculate the Centre of Gravity position as a percentage of the Mean Aerodynamic Chord (%MAC) at take-off.",
    answer: `${roundTo(percentMAC, 1)}% MAC`,
    workings: `
WEIGHT & BALANCE TABLE:
${"=".repeat(65)}
Item                          | Weight (kg) | Arm (mm) | Mom Index
${"=".repeat(65)}
${items.map(item => {
  if (item.name === "Zero Fuel Weight") {
    return `${"─".repeat(65)}\n${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  if (item.name.includes("Aeroplane Basic")) {
    return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} | ${item.arm.toString().padStart(8)} | ${item.momentIndex.toString().padStart(9)}`;
}).join('\n')}
${"─".repeat(65)}
TAKE-OFF TOTALS                | ${totals.totalWeight.toString().padStart(11)} |          | ${roundTo(totals.totalIndex, 1).toString().padStart(9)}
${"=".repeat(65)}

CALCULATIONS:
1. CG Position:
   CG = (Moment Index × 10000) ÷ Weight
   CG = (${roundTo(totals.totalIndex, 1)} × 10000) ÷ ${totals.totalWeight}
   CG = ${roundTo(cgPosition, 1)} mm aft of datum

2. %MAC Calculation:
   MAC Length = ${ECHO_CONFIG.mac.length} mm
   MAC Leading Edge = ${ECHO_CONFIG.mac.leadingEdge} mm aft of datum
   
   %MAC = (CG - LE) ÷ MAC × 100
   %MAC = (${roundTo(cgPosition, 1)} - ${ECHO_CONFIG.mac.leadingEdge}) ÷ ${ECHO_CONFIG.mac.length} × 100
   %MAC = ${roundTo(percentMAC, 1)}%
    `.trim(),
    numericalAnswer: roundTo(percentMAC, 1),
    unit: "% MAC",
  };
}

export function generateForwardCGLimitQuestion(): Question {
  const { items, scenarioText } = generateForwardCGLoading();
  
  const totals = calculateTotals(items.filter(i => i.name !== "Zero Fuel Weight"));
  const forwardLimit = getForwardCGLimit(totals.totalWeight);
  const forwardLimitMAC = calculatePercentMAC(forwardLimit);
  
  return {
    id: generateId(),
    type: "forward-cg-limit",
    title: "Forward CG Limit",
    scenario: "Using Loading System ECHO, determine the forward CG limit for the given loading.",
    scenarioText,
    loadingTable: items,
    question: "Determine the forward CG limit for this aircraft at the take-off weight, expressed as a position in mm aft of datum AND as %MAC.",
    answer: `Forward CG Limit: ${roundTo(forwardLimit, 0)} mm aft of datum (${roundTo(forwardLimitMAC, 1)}% MAC)`,
    workings: `
WEIGHT & BALANCE TABLE:
${"=".repeat(65)}
Item                          | Weight (kg) | Arm (mm) | Mom Index
${"=".repeat(65)}
${items.map(item => {
  if (item.name === "Zero Fuel Weight") {
    return `${"─".repeat(65)}\n${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  if (item.name.includes("Aeroplane Basic")) {
    return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} | ${item.arm.toString().padStart(8)} | ${item.momentIndex.toString().padStart(9)}`;
}).join('\n')}
${"─".repeat(65)}
TAKE-OFF TOTALS                | ${totals.totalWeight.toString().padStart(11)} |          | ${roundTo(totals.totalIndex, 1).toString().padStart(9)}
${"=".repeat(65)}

CALCULATIONS:
1. Take-off Weight = ${totals.totalWeight} kg

2. Forward CG Limit (Linear Interpolation):
   At ${ECHO_CONFIG.cgRange.lightWeight.weight} kg: Forward limit = ${ECHO_CONFIG.cgRange.lightWeight.forward} mm
   At ${ECHO_CONFIG.cgRange.heavyWeight.weight} kg: Forward limit = ${ECHO_CONFIG.cgRange.heavyWeight.forward} mm
   
   Ratio = (${totals.totalWeight} - ${ECHO_CONFIG.cgRange.lightWeight.weight}) ÷ (${ECHO_CONFIG.cgRange.heavyWeight.weight} - ${ECHO_CONFIG.cgRange.lightWeight.weight})
   Ratio = ${roundTo((totals.totalWeight - ECHO_CONFIG.cgRange.lightWeight.weight) / (ECHO_CONFIG.cgRange.heavyWeight.weight - ECHO_CONFIG.cgRange.lightWeight.weight), 3)}
   
   Forward Limit = ${ECHO_CONFIG.cgRange.lightWeight.forward} + ${roundTo((totals.totalWeight - ECHO_CONFIG.cgRange.lightWeight.weight) / (ECHO_CONFIG.cgRange.heavyWeight.weight - ECHO_CONFIG.cgRange.lightWeight.weight), 3)} × (${ECHO_CONFIG.cgRange.heavyWeight.forward} - ${ECHO_CONFIG.cgRange.lightWeight.forward})
   Forward Limit = ${roundTo(forwardLimit, 0)} mm aft of datum

3. Convert to %MAC:
   %MAC = (${roundTo(forwardLimit, 0)} - ${ECHO_CONFIG.mac.leadingEdge}) ÷ ${ECHO_CONFIG.mac.length} × 100
   %MAC = ${roundTo(forwardLimitMAC, 1)}%
    `.trim(),
    numericalAnswer: roundTo(forwardLimit, 0),
    unit: "mm",
  };
}

export function generateWeightBalanceQuestion(): Question {
  const { items, scenarioText } = generateWeightBalanceLoading();
  
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
  
  return {
    id: generateId(),
    type: "weight-balance",
    title: "Weight & Balance Check",
    scenario: "Using Loading System ECHO, verify the aircraft loading is within limits.",
    scenarioText,
    loadingTable: items,
    question: `a) Calculate the Take-off Weight and CG position
b) Calculate the Landing Weight and CG position  
c) Is the aircraft within weight and balance limits for the entire flight?`,
    answer: `a) Take-off Weight: ${towTotals.totalWeight} kg, CG: ${roundTo(towCG, 1)} mm aft of datum
b) Landing Weight: ${landingWeight} kg, CG: ${roundTo(landingCG, 1)} mm aft of datum
c) ${isTowWithinLimits && isLandingWithinLimits ? "Yes, within limits" : "No, outside limits"}`,
    workings: `
WEIGHT & BALANCE TABLE:
${"=".repeat(65)}
Item                          | Weight (kg) | Arm (mm) | Mom Index
${"=".repeat(65)}
${items.map(item => {
  if (item.name === "Zero Fuel Weight") {
    return `${"─".repeat(65)}\n${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  if (item.name.includes("Aeroplane Basic")) {
    return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  if (item.name.includes("Burn-off")) {
    return `${"─".repeat(65)}\n${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} | ${item.arm.toString().padStart(8)} | ${item.momentIndex.toString().padStart(9)}`;
  }
  return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} | ${item.arm.toString().padStart(8)} | ${item.momentIndex.toString().padStart(9)}`;
}).join('\n')}
${"─".repeat(65)}
TAKE-OFF TOTALS                | ${towTotals.totalWeight.toString().padStart(11)} |          | ${roundTo(towTotals.totalIndex, 1).toString().padStart(9)}
LANDING TOTALS                 | ${landingWeight.toString().padStart(11)} |          | ${landingIndex.toString().padStart(9)}
${"=".repeat(65)}

TAKE-OFF CHECK:
Weight: ${towTotals.totalWeight} kg (MTOW: ${ECHO_CONFIG.weights.maxTakeoffWeight} kg) ${towTotals.totalWeight <= ECHO_CONFIG.weights.maxTakeoffWeight ? "✓" : "✗"}
CG: ${roundTo(towCG, 1)} mm
Forward Limit at ${towTotals.totalWeight} kg: ${roundTo(towForwardLimit, 0)} mm ${towCG >= towForwardLimit ? "✓" : "✗"}
Aft Limit: ${ECHO_CONFIG.cgRange.lightWeight.aft} mm ${towCG <= ECHO_CONFIG.cgRange.lightWeight.aft ? "✓" : "✗"}

LANDING CHECK:
Weight: ${landingWeight} kg (MLW: ${ECHO_CONFIG.weights.maxLandingWeight} kg) ${landingWeight <= ECHO_CONFIG.weights.maxLandingWeight ? "✓" : "✗"}
CG: ${roundTo(landingCG, 1)} mm
Forward Limit at ${landingWeight} kg: ${roundTo(landingForwardLimit, 0)} mm ${landingCG >= landingForwardLimit ? "✓" : "✗"}
Aft Limit: ${ECHO_CONFIG.cgRange.lightWeight.aft} mm ${landingCG <= ECHO_CONFIG.cgRange.lightWeight.aft ? "✓" : "✗"}

CONCLUSION: ${isTowWithinLimits && isLandingWithinLimits ? "Aircraft is within all weight and balance limits" : "Aircraft exceeds weight or balance limits"}
    `.trim(),
  };
}

export function generateBallastQuestion(): Question {
  const { items, scenarioText } = generateBallastLoading();
  
  const totals = calculateTotals(items);
  const currentCG = calculateCG(totals.totalWeight, totals.totalIndex);
  const forwardLimit = getForwardCGLimit(totals.totalWeight);
  
  // Target CG just inside the forward limit
  const targetCG = forwardLimit + 15;
  const ballastArm = ECHO_CONFIG.arms.rearCompt;
  const ballastRequired = calculateBallast(totals.totalWeight, currentCG, targetCG, ballastArm);
  
  return {
    id: generateId(),
    type: "ballast",
    title: "Ballast Calculation",
    scenario: "Using Loading System ECHO, calculate the ballast required to bring CG within limits.",
    scenarioText,
    loadingTable: items,
    question: `Calculate the minimum ballast weight required in the rear compartment (arm ${ECHO_CONFIG.arms.rearCompt} mm) to bring the CG within limits.`,
    answer: `Ballast required: ${roundTo(Math.abs(ballastRequired), 1)} kg in rear compartment`,
    workings: `
WEIGHT & BALANCE TABLE:
${"=".repeat(65)}
Item                          | Weight (kg) | Arm (mm) | Mom Index
${"=".repeat(65)}
${items.map(item => {
  if (item.name.includes("Aeroplane Basic")) {
    return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} |          | ${item.momentIndex.toString().padStart(9)}`;
  }
  return `${item.name.padEnd(29)} | ${item.weight.toString().padStart(11)} | ${item.arm.toString().padStart(8)} | ${item.momentIndex.toString().padStart(9)}`;
}).join('\n')}
${"─".repeat(65)}
TOTALS                         | ${totals.totalWeight.toString().padStart(11)} |          | ${roundTo(totals.totalIndex, 1).toString().padStart(9)}
${"=".repeat(65)}

CURRENT CG POSITION:
CG = (${roundTo(totals.totalIndex, 1)} × 10000) ÷ ${totals.totalWeight}
CG = ${roundTo(currentCG, 1)} mm aft of datum

FORWARD CG LIMIT:
At ${totals.totalWeight} kg, forward limit = ${roundTo(forwardLimit, 0)} mm
Current CG (${roundTo(currentCG, 1)} mm) is ${currentCG < forwardLimit ? "FORWARD OF" : "within"} limit

BALLAST CALCULATION:
Target CG = ${roundTo(targetCG, 0)} mm (just inside forward limit)
Ballast Arm = ${ballastArm} mm

Ballast = Weight × (Target CG - Current CG) ÷ (Ballast Arm - Target CG)
Ballast = ${totals.totalWeight} × (${roundTo(targetCG, 0)} - ${roundTo(currentCG, 1)}) ÷ (${ballastArm} - ${roundTo(targetCG, 0)})
Ballast = ${roundTo(Math.abs(ballastRequired), 1)} kg

VERIFICATION:
New Weight = ${totals.totalWeight} + ${roundTo(Math.abs(ballastRequired), 0)} = ${totals.totalWeight + Math.abs(roundTo(ballastRequired, 0))} kg
Must be within MTOW (${ECHO_CONFIG.weights.maxTakeoffWeight} kg) ✓
    `.trim(),
    numericalAnswer: roundTo(Math.abs(ballastRequired), 1),
    unit: "kg",
  };
}

export function generateQuestion(type: QuestionType): Question {
  switch (type) {
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

export function generateQuestionSet(
  types: QuestionType[],
  questionsPerType: number = 1
): Question[] {
  const questions: Question[] = [];
  
  for (const type of types) {
    for (let i = 0; i < questionsPerType; i++) {
      questions.push(generateQuestion(type));
    }
  }
  
  return questions;
}
