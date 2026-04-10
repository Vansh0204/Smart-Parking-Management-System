import { ParkingSlot } from '../models/ParkingSlot';

export class SlotRepository {
  private slots: Map<string, ParkingSlot> = new Map();

  public save(slot: ParkingSlot): void {
    this.slots.set(slot.id, slot);
  }

  public findById(slotId: string): ParkingSlot | undefined {
    return this.slots.get(slotId);
  }

  public findAllAvailable(): ParkingSlot[] {
    return Array.from(this.slots.values()).filter(slot => slot.status === 'Available');
  }

  public findAll(): ParkingSlot[] {
    return Array.from(this.slots.values());
  }
}
