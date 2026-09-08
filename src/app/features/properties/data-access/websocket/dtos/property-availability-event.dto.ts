export interface PropertyAvailabilityEventDto {
  readonly type: 'property-availability.updated';
  readonly propertyId: string;
  readonly available: boolean;
  readonly occurredAt: string;
  readonly demonstration: boolean;
}

export function isPropertyAvailabilityEventDto(
  value: unknown,
): value is PropertyAvailabilityEventDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<PropertyAvailabilityEventDto>;

  return (
    candidate.type === 'property-availability.updated' &&
    typeof candidate.propertyId === 'string' &&
    typeof candidate.available === 'boolean' &&
    typeof candidate.occurredAt === 'string' &&
    typeof candidate.demonstration === 'boolean'
  );
}
