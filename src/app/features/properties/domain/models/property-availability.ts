export interface PropertyAvailabilityUpdate {
  readonly propertyId: string;
  readonly available: boolean;
  readonly occurredAt: Date;
  readonly demonstration: boolean;
}
