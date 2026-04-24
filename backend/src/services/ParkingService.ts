import { SlotRepository } from '../repositories/SlotRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { VehicleFactory } from '../patterns/CarFactory';
import { PricingStrategy } from '../patterns/PricingStrategy';
import { Reservation } from '../models/Reservation';
import { ParkingSlot } from '../models/ParkingSlot';

export class ParkingService {
  constructor(
    private readonly slotRepo: SlotRepository,
    private readonly resRepo: ReservationRepository,
    private readonly pricingStrategy: PricingStrategy
  ) {}

  public getAvailableSlots(): ParkingSlot[] {
    return this.slotRepo.findAllAvailable();
  }

  public getAllSlots(): ParkingSlot[] {
    return this.slotRepo.findAll();
  }

  public addSlot(slotId: string, lane: string = 'Lane 1'): ParkingSlot {
    if (this.slotRepo.findById(slotId)) {
      throw new Error(`Slot ${slotId} already exists`);
    }
    const slot = new ParkingSlot(slotId, lane);
    this.slotRepo.save(slot);
    return slot;
  }

  public reserveSlot(slotId: string, licensePlate: string, vehicleType: string, durationHours: number, startTime?: Date, username?: string): Reservation {
    const slot = this.slotRepo.findById(slotId);
    if (!slot) {
      throw new Error(`Slot ${slotId} not found`);
    }

    if (!slot.reserve()) {
      throw new Error(`Slot ${slotId} is no longer available.`);
    }

    const vehicle = VehicleFactory.createVehicle(Date.now(), licensePlate, vehicleType);
    const price = this.pricingStrategy.calculatePrice(durationHours);

    const reservation = new Reservation(
      Date.now().toString(),
      slot.id,
      vehicle,
      durationHours,
      price,
      new Date(),
      startTime || new Date(),
      username || 'unknown'
    );

    this.resRepo.save(reservation);
    return reservation;
  }

  public getAllReservations(): Reservation[] {
    return this.resRepo.findAll();
  }

  public releaseSlot(slotId: string): void {
    const slot = this.slotRepo.findById(slotId);
    if (!slot) throw new Error(`Slot ${slotId} not found`);

    if (!slot.free()) {
      throw new Error(`Slot ${slotId} is already available or cannot be freed.`);
    }
    
    // Find active reservation for this slot and complete it
    const activeRes = this.resRepo.findAll().find(r => r.slotId === slotId && r.status === 'Active');
    if (activeRes) {
      activeRes.complete();
    }
  }
}
