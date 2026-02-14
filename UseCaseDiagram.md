# Use Case Diagram – Smart Parking Management System

```mermaid
flowchart LR

    Driver[Driver]
    Admin[Admin]

    UC1(View Parking Availability)
    UC2(Reserve Parking Slot)
    UC3(Cancel Reservation)
    UC4(Vehicle Entry)
    UC5(Vehicle Exit)
    UC6(View Booking History)

    UA1(Manage Parking Lots)
    UA2(Manage Parking Slots)
    UA3(Configure Pricing Strategy)
    UA4(Monitor Occupancy)
    UA5(View Reports)

    Driver --> UC1
    Driver --> UC2
    Driver --> UC3
    Driver --> UC4
    Driver --> UC5
    Driver --> UC6

    Admin --> UA1
    Admin --> UA2
    Admin --> UA3
    Admin --> UA4
    Admin --> UA5
