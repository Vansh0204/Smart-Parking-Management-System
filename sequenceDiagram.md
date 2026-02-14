# Sequence Diagram – Reserve Parking Slot Flow

## Scenario: Driver Reserves a Parking Slot

Driver → ReservationController : Request slot reservation  
ReservationController → ParkingService : Validate request  
ParkingService → SlotRepository : Fetch available slots  
SlotRepository → ParkingService : Return slot data  
ParkingService → PricingStrategy : Calculate estimated price  
PricingStrategy → ParkingService : Return price  
ParkingService → ReservationRepository : Create reservation  
ReservationRepository → ParkingService : Confirm creation  
ParkingService → ReservationController : Reservation success  
ReservationController → Driver : Response with reservation details
