# Class Diagram – Smart Parking Management System

## Core Classes

User (abstract)
- userId
- name
- role

Driver extends User
Admin extends User

Vehicle (abstract)
- vehicleId
- vehicleNumber

Car extends Vehicle
Bike extends Vehicle
ElectricVehicle extends Vehicle

ParkingLot
- lotId
- name
- location
- slots

ParkingSlot
- slotId
- status

Reservation
- reservationId
- startTime
- endTime
- status

Payment
- paymentId
- amount
- status

---

## Relationships

- Driver "owns" Vehicle
- ParkingLot "contains" ParkingSlot
- Driver "creates" Reservation
- Reservation "maps to" ParkingSlot
- Reservation "generates" Payment
