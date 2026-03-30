import { ParkingService } from '../src/services/ParkingService';
import { SlotRepository } from '../src/repositories/SlotRepository';
import { ReservationRepository } from '../src/repositories/ReservationRepository';
import { HourlyPricing } from '../src/patterns/PricingStrategy';
import { ParkingSlot } from '../src/models/ParkingSlot';

describe('ParkingService', () => {
  let parkingService: ParkingService;
  let slotRepo: SlotRepository;
  let resRepo: ReservationRepository;
  let pricing: HourlyPricing;

  beforeEach(() => {
    slotRepo = new SlotRepository();
    resRepo = new ReservationRepository();
    pricing = new HourlyPricing(15);
    parkingService = new ParkingService(slotRepo, resRepo, pricing);

    const slot = new ParkingSlot('A-101', 'Zone-A');
    slotRepo.save(slot);
  });

  it('should successfully reserve an available slot', () => {
    const reservation = parkingService.reserveSlot('A-101', 'ABC-123', 'Car', 2);
    
    expect(reservation).toBeDefined();
    expect(reservation.vehicle.licensePlate).toBe('ABC-123');
    expect(reservation.price).toBe(30); // 15 * 2
    expect(slotRepo.findById('A-101')?.status).toBe('Reserved');
  });

  it('should fail when reserving an unavailable slot', () => {
    parkingService.reserveSlot('A-101', 'ABC-123', 'Car', 2);
    
    // Attempt second reservation
    expect(() => {
      parkingService.reserveSlot('A-101', 'XYZ-999', 'Car', 1);
    }).toThrow('Slot A-101 is no longer available.');
  });
  
  it('should fail when slot does not exist', () => {
    expect(() => {
      parkingService.reserveSlot('A-999', 'XYZ-999', 'Car', 1);
    }).toThrow('Slot A-999 not found');
  });
});
