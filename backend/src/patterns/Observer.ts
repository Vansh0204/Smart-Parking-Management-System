export interface Observer {
  update(slotId: string, status: string): void;
}

export class Subject {
  private observers: Observer[] = [];

  public attach(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
        this.observers.push(observer);
    }
  }

  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
        this.observers.splice(observerIndex, 1);
    }
  }

  public notify(slotId: string, status: string): void {
    for (const observer of this.observers) {
        observer.update(slotId, status);
    }
  }
}
