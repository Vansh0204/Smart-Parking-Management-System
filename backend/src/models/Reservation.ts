import { Vehicle } from "../patterns/CarFactory";

export class Reservation {
  public status: 'Scheduled' | 'Active' | 'Completed' = 'Active';

  constructor(
    public readonly id: string,
    public readonly slotId: string,
    public readonly vehicle: Vehicle,
    public readonly durationHours: number,
    public readonly price: number,
    public readonly timestamp: Date = new Date(),
    public readonly startTime: Date = new Date(),
    public readonly username: string = 'unknown'
  ) {
    if (this.startTime > new Date()) {
      this.status = 'Scheduled';
    }
  }

  public complete(): void {
    this.status = 'Completed';
  }

  public activate(): void {
    this.status = 'Active';
  }
}
