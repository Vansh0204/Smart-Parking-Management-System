import { Reservation } from '../models/Reservation';

export class ReservationRepository {
  private reservations: Map<string, Reservation> = new Map();

  public save(reservation: Reservation): void {
    this.reservations.set(reservation.id, reservation);
  }

  public findAll(): Reservation[] {
    return Array.from(this.reservations.values());
  }
}
