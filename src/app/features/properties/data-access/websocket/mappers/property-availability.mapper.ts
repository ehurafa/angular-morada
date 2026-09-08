import type { PropertyAvailabilityUpdate } from '../../../domain/models/property-availability';
import { isPropertyAvailabilityEventDto } from '../dtos/property-availability-event.dto';

export function mapPropertyAvailabilityEventDto(value: unknown): PropertyAvailabilityUpdate | null {
  if (!isPropertyAvailabilityEventDto(value)) {
    return null;
  }

  const occurredAt = new Date(value.occurredAt);

  if (Number.isNaN(occurredAt.getTime())) {
    return null;
  }

  return {
    propertyId: value.propertyId,
    available: value.available,
    occurredAt,
    demonstration: value.demonstration,
  };
}
