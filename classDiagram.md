
---

# ✅ **4️⃣ classDiagram.md**

```md
# Class Diagram – Smart Parking Management System

```mermaid
classDiagram

    class User {
        +int id
        +string name
        +string role
    }

    class Driver
    class Admin

    User <|-- Driver
    User <|-- Admin

    class Vehicle {
        +int id
        +string vehicleNumber
        +string vehicleType
    }

    class Car
    class Bike
    class ElectricVehicle

    Vehicle <|-- Car
    Vehicle <|-- Bike
    Vehicle <|-- ElectricVehicle

    class ParkingLot {
        +int id
        +string name
        +string location
    }

    class ParkingSlot {
        +int id
        +string status
    }

    class Reservation {
        +int id
        +datetime startTime
        +datetime endTime
        +string status
    }

    class Payment {
        +int id
        +float amount
        +string status
    }

    Driver --> Vehicle : owns
    ParkingLot --> ParkingSlot : contains
    Driver --> Reservation : creates
    Reservation --> ParkingSlot : assigned_to
    Reservation --> Payment : generates
