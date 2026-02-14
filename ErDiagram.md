# ER Diagram – Smart Parking Management System

```mermaid
erDiagram

    USERS {
        int id PK
        string name
        string role
    }

    VEHICLES {
        int id PK
        int user_id FK
        string vehicle_number
        string vehicle_type
    }

    PARKING_LOTS {
        int id PK
        string name
        string location
    }

    PARKING_SLOTS {
        int id PK
        int lot_id FK
        string status
    }

    RESERVATIONS {
        int id PK
        int user_id FK
        int slot_id FK
        datetime start_time
        datetime end_time
        string status
    }

    PAYMENTS {
        int id PK
        int reservation_id FK
        float amount
        string status
    }

    USERS ||--o{ VEHICLES : owns
    USERS ||--o{ RESERVATIONS : makes
    PARKING_LOTS ||--o{ PARKING_SLOTS : contains
    PARKING_SLOTS ||--o{ RESERVATIONS : assigned_to
    RESERVATIONS ||--|| PAYMENTS : generates
