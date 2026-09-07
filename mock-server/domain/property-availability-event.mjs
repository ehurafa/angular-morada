export function createPropertyAvailabilityEvent({
  propertyId,
  available = true,
  occurredAt = new Date(),
}) {
  return {
    type: 'property-availability.updated',
    propertyId,
    available,
    occurredAt: occurredAt.toISOString(),
    demonstration: true,
  };
}
