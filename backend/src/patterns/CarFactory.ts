export abstract class Vehicle {
  constructor(
    public readonly id: number, 
    public readonly licensePlate: string, 
    public readonly type: string
  ) {}
}

export class Car extends Vehicle {
  constructor(id: number, licensePlate: string) {
    super(id, licensePlate, 'Car');
  }
}

export class Bike extends Vehicle {
  constructor(id: number, licensePlate: string) {
    super(id, licensePlate, 'Bike');
  }
}

export class ElectricVehicle extends Vehicle {
  constructor(id: number, licensePlate: string) {
    super(id, licensePlate, 'ElectricVehicle');
  }
}

export class VehicleFactory {
  public static createVehicle(id: number, licensePlate: string, type: string): Vehicle {
    switch (type.toLowerCase()) {
      case 'car':
        return new Car(id, licensePlate);
      case 'bike':
        return new Bike(id, licensePlate);
      case 'electricvehicle':
      case 'ev':
        return new ElectricVehicle(id, licensePlate);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}
