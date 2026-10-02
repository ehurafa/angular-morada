export function createPropertyAvailabilityEvent({
  propertyId,
  propertyTitle,
  available = true,
  occurredAt = new Date(),
}) {
  return {
    type: 'property-availability.updated',
    propertyId,
    propertyTitle,
    available,
    occurredAt: occurredAt.toISOString(),
    demonstration: true,
  };
}
