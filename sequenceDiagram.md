
---

# ✅ **3️⃣ sequenceDiagram.md**

```md
# Sequence Diagram – Reserve Slot Flow

```mermaid
sequenceDiagram

    actor Driver
    participant ReservationController
    participant ParkingService
    participant SlotRepository
    participant PricingStrategy
    participant ReservationRepository

    Driver->>ReservationController: Request reservation
    ReservationController->>ParkingService: Validate request
    ParkingService->>SlotRepository: Fetch available slots
    SlotRepository-->>ParkingService: Return slot list
    ParkingService->>PricingStrategy: Calculate price
    PricingStrategy-->>ParkingService: Price response
    ParkingService->>ReservationRepository: Create reservation
    ReservationRepository-->>ParkingService: Confirmation
    ParkingService-->>ReservationController: Success response
    ReservationController-->>Driver: Reservation details
