export const PRICING_RULES = {
  BIKE: {
    baseFare: 15,       // Cheaper start price
    perKmRate: 6,       // Very affordable per km
    perMinuteRate: 0.5, // Low waiting charge
    minimumFare: 20,    // Minimum bill
  },
  SCOOTY: {
    baseFare: 15,
    perKmRate: 6,       // Same as bike usually
    perMinuteRate: 0.5,
    minimumFare: 20,
  }
};

// Helper type for your code
export type VehicleType = keyof typeof PRICING_RULES;