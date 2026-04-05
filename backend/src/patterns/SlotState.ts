import { ParkingSlot } from '../models/ParkingSlot';

export interface SlotState {
  readonly name: string;
  reserve(slot: ParkingSlot): boolean;
  free(slot: ParkingSlot): boolean;
}

export class AvailableState implements SlotState {
  public readonly name = 'Available';

  public reserve(slot: ParkingSlot): boolean {
    slot.setState(new ReservedState());
    return true;
  }

  public free(slot: ParkingSlot): boolean {
    return false; // Already free
  }
}

export class ReservedState implements SlotState {
  public readonly name = 'Reserved';

  public reserve(slot: ParkingSlot): boolean {
    return false; // Already reserved
  }

  public free(slot: ParkingSlot): boolean {
    slot.setState(new AvailableState());
    return true;
  }
}

export class OccupiedState implements SlotState {
  public readonly name = 'Occupied';

  public reserve(slot: ParkingSlot): boolean {
    return false; // Already occupied
  }

  public free(slot: ParkingSlot): boolean {
    slot.setState(new AvailableState());
    return true;
  }
}
