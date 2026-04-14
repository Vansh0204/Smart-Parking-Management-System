import { Request, Response } from 'express';
import { ParkingService } from '../services/ParkingService';

export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  public getAllSlots = (req: Request, res: Response): void => {
    try {
      const slots = this.parkingService.getAllSlots();
      res.json(slots.map(s => ({ id: s.id, status: s.status })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public reserveSlot = (req: Request, res: Response): void => {
    try {
      const { slotId, licensePlate, vehicleType, durationHours, startTime, username } = req.body;
      
      if (!slotId || !licensePlate || !vehicleType || !durationHours) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const reservation = this.parkingService.reserveSlot(slotId, licensePlate, vehicleType, durationHours, startTime ? new Date(startTime) : undefined, username);
      res.status(201).json({ message: 'Reservation created', reservation });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  public getReservations = (req: Request, res: Response): void => {
    try {
      const reservations = this.parkingService.getAllReservations();
      res.json(reservations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public releaseSlot = (req: Request, res: Response): void => {
    try {
      const { slotId } = req.body;
      if (!slotId) {
        res.status(400).json({ error: 'Missing slotId' });
        return;
      }
      this.parkingService.releaseSlot(slotId);
      res.status(200).json({ message: `Slot ${slotId} released successfully.` });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
