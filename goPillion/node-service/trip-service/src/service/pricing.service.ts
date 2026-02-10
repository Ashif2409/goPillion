import { PRICING_RULES, VehicleType } from "../config/price.config";

export const calculateRidePrice = (
  distanceKm: number,
  durationMins: number,
  vehicleType: string = "BIKE", // Default to BIKE
  isSurge: boolean = false
) => {
  // 1. Validate Vehicle Type
  // If the type isn't BIKE or SCOOTY, default to BIKE to prevent crashes
  const type = (PRICING_RULES[vehicleType as VehicleType] ? vehicleType : "BIKE") as VehicleType;
  const rules = PRICING_RULES[type];

  // 2. Calculate Costs
  const distanceCost = distanceKm * rules.perKmRate;
  const timeCost = durationMins * rules.perMinuteRate;

  let total = rules.baseFare + distanceCost + timeCost;

  // 3. Surge Pricing (Optional: e.g. Rain or Rush Hour)
  if (isSurge) {
    total = total * 1.2; // 20% extra for bikes is standard
  }

  // 4. Minimum Fare Check
  const finalPrice = Math.max(total, rules.minimumFare);

  return {
    price: Math.ceil(finalPrice),
    breakdown: {
      baseFare: rules.baseFare,
      distanceCost: parseFloat(distanceCost.toFixed(2)),
      timeCost: parseFloat(timeCost.toFixed(2)),
      surgeApplied: isSurge
    }
  };
};