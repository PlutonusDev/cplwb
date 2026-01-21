// Echo Aircraft Loading System Configuration
// Based on CASA CPL examination data

export const ECHO_CONFIG = {
  name: "Echo",
  seats: 6,
  
  // Weight Limitations (KG)
  weights: {
    maxTakeoffWeight: 2950,
    maxLandingWeight: 2725,
    maxZeroFuelWeight: 2630,
  },
  
  // MAC (Mean Aerodynamic Chord) Data
  mac: {
    length: 1900, // mm
    leadingEdge: 2190, // mm aft of datum
  },
  
  // CG Range (mm aft of datum)
  cgRange: {
    // At 2360 KG or less
    lightWeight: {
      weight: 2360,
      forward: 2400,
      aft: 2680,
    },
    // At 2950 KG
    heavyWeight: {
      weight: 2950,
      forward: 2560,
      aft: 2680,
    },
  },
  
  // Loading Arms (mm aft of datum)
  arms: {
    row1: 2290, // Pilot + 1 Passenger
    row2: 3300, // 2 Passengers
    row3: 4300, // 2 Passengers
    forwardCompt: 500, // 55 KG max
    leftWingCompt: 3550, // 55 KG max
    rightWingCompt: 3550, // 55 KG max
    rearCompt: 5000, // 155 KG max
    mainTanks: 1780, // 50 gal each (left + right)
    auxTanks: 2800, // 40 gal each (left + right)
  },
  
  // Maximum loads (KG)
  maxLoads: {
    forwardCompt: 55,
    leftWingCompt: 55,
    rightWingCompt: 55,
    rearCompt: 155,
    seatArea: 82, // if seat removed
    mainTanks: 50, // each
    auxTanks: 40, // each
  },
  
  // Fuel capacity
  fuel: {
    mainTankGal: 50, // each
    auxTankGal: 40, // each
    density: 0.72, // kg/L (AVGAS)
    galToLitre: 2.72, // US gallon to litre
  },
  
  // Seat weights
  seatWeight: 5, // KG each
};

// Moment Index calculation (simplified - in real exams, use the chart)
export function calculateMomentIndex(weight: number, arm: number): number {
  // Moment = Weight × Arm / 1000 (to get index units)
  return (weight * arm) / 10000;
}

// Calculate CG position
export function calculateCG(totalWeight: number, totalMoment: number): number {
  // CG = Total Moment / Total Weight × 10000 (to convert from index)
  return (totalMoment * 10000) / totalWeight;
}

// Calculate %MAC
export function calculatePercentMAC(cgPosition: number): number {
  const { mac } = ECHO_CONFIG;
  // %MAC = (CG - Leading Edge) / MAC Length × 100
  return ((cgPosition - mac.leadingEdge) / mac.length) * 100;
}

// Get forward CG limit at a given weight
export function getForwardCGLimit(weight: number): number {
  const { cgRange } = ECHO_CONFIG;
  
  if (weight <= cgRange.lightWeight.weight) {
    return cgRange.lightWeight.forward;
  }
  
  if (weight >= cgRange.heavyWeight.weight) {
    return cgRange.heavyWeight.forward;
  }
  
  // Linear interpolation
  const ratio = (weight - cgRange.lightWeight.weight) / 
                (cgRange.heavyWeight.weight - cgRange.lightWeight.weight);
  return cgRange.lightWeight.forward + 
         ratio * (cgRange.heavyWeight.forward - cgRange.lightWeight.forward);
}

// Get aft CG limit (constant at 2680mm)
export function getAftCGLimit(): number {
  return ECHO_CONFIG.cgRange.lightWeight.aft;
}

// Check if CG is within limits
export function isCGWithinLimits(weight: number, cgPosition: number): boolean {
  const forwardLimit = getForwardCGLimit(weight);
  const aftLimit = getAftCGLimit();
  return cgPosition >= forwardLimit && cgPosition <= aftLimit;
}

// Calculate ballast required to move CG
export function calculateBallast(
  currentWeight: number,
  currentCG: number,
  targetCG: number,
  ballastArm: number
): number {
  // Ballast = Current Weight × (Target CG - Current CG) / (Ballast Arm - Target CG)
  return (currentWeight * (targetCG - currentCG)) / (ballastArm - targetCG);
}

// Convert fuel gallons to kg
export function fuelGalToKg(gallons: number): number {
  return gallons * ECHO_CONFIG.fuel.galToLitre * ECHO_CONFIG.fuel.density;
}

// Convert litres to kg
export function fuelLtToKg(litres: number): number {
  return litres * ECHO_CONFIG.fuel.density;
}

// Convert kg to lbs
export function kgToLbs(kg: number): number {
  return kg * 2.2;
}

// Convert lbs to kg
export function lbsToKg(lbs: number): number {
  return lbs / 2.2;
}

// Convert US gallons to litres
export function galToLt(gallons: number): number {
  return gallons * ECHO_CONFIG.fuel.galToLitre;
}

// Convert litres to US gallons
export function ltToGal(litres: number): number {
  return litres / ECHO_CONFIG.fuel.galToLitre;
}

// Random number generator with range
export function randomInRange(min: number, max: number, step: number = 1): number {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

// Round to specified decimal places
export function roundTo(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, 2);
  return Math.round(value * factor) / factor;
}
