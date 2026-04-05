export interface PricingStrategy {
  calculatePrice(durationHours: number): number;
}

export class HourlyPricing implements PricingStrategy {
  constructor(private readonly ratePerHour: number = 10.0) {}

  public calculatePrice(durationHours: number): number {
    return this.ratePerHour * Math.max(1, durationHours);
  }
}

export class FixedPricing implements PricingStrategy {
  constructor(private readonly fixedRate: number = 50.0) {}

  public calculatePrice(durationHours: number): number {
    return this.fixedRate;
  }
}
