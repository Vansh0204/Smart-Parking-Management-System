import express from 'express';
import cors from 'cors';
import { SlotRepository } from './repositories/SlotRepository';
import { ReservationRepository } from './repositories/ReservationRepository';
import { ParkingService } from './services/ParkingService';
import { ParkingController } from './controllers/ParkingController';
import { HourlyPricing } from './patterns/PricingStrategy';
import { ParkingSlot } from './models/ParkingSlot';
import { Observer } from './patterns/Observer';

import { AuthController } from './controllers/AuthController';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Dependencies
const slotRepo = new SlotRepository();
const resRepo = new ReservationRepository();
const pricingStrategy = new HourlyPricing(15.0); // Dependency Injection
const parkingService = new ParkingService(slotRepo, resRepo, pricingStrategy);
const parkingController = new ParkingController(parkingService);
const authController = new AuthController();

// Observer for logging
class DashboardNotifier implements Observer {
  update(slotId: string, status: string): void {
    console.log(`[Dashboard Push Event]: Slot ${slotId} changed status to ${status}`);
  }
}
const notifier = new DashboardNotifier();

// Seed In-Memory Database
for (let i = 1; i <= 10; i++) {
  const slot = new ParkingSlot(`A-10${i}`, 'Zone-A');
  slot.attach(notifier);
  slotRepo.save(slot);
}

// Routes
app.post('/api/login', authController.login);
app.get('/api/slots', parkingController.getAllSlots);
app.post('/api/reserve', parkingController.reserveSlot);
app.get('/api/reservations', parkingController.getReservations);
app.post('/api/release', parkingController.releaseSlot);

// Server Init
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend Server running smoothly on port ${PORT}`);
});
