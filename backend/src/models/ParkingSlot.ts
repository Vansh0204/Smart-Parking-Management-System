import { Subject } from '../patterns/Observer';
import { SlotState, AvailableState } from '../patterns/SlotState';

export class ParkingSlot extends Subject {
  private state: SlotState;

  constructor(public readonly id: string, public readonly lotId: string) {
    super();
    this.state = new AvailableState();
  }

  public setState(newState: SlotState): void {
    this.state = newState;
    this.notify(this.id, this.status);
  }

  public get status(): string {
    return this.state.name;
  }

  public reserve(): boolean {
    return this.state.reserve(this);
  }

  public free(): boolean {
    return this.state.free(this);
  }
}
