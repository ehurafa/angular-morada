import { mapPropertyAvailabilityEventDto } from './property-availability.mapper';

describe('mapPropertyAvailabilityEventDto', () => {
  it('maps a WebSocket event to the domain contract', () => {
    const result = mapPropertyAvailabilityEventDto({
      type: 'property-availability.updated',
      propertyId: 'property-1',
      available: true,
      occurredAt: '2026-09-07T12:00:00.000Z',
      demonstration: true,
    });

    expect(result).toEqual({
      propertyId: 'property-1',
      available: true,
      occurredAt: new Date('2026-09-07T12:00:00.000Z'),
      demonstration: true,
    });
  });

  it('ignores messages from an unknown event type', () => {
    const result = mapPropertyAvailabilityEventDto({
      type: 'unknown.event',
      propertyId: 'property-1',
    });

    expect(result).toBeNull();
  });

  it('ignores events with an invalid date', () => {
    const result = mapPropertyAvailabilityEventDto({
      type: 'property-availability.updated',
      propertyId: 'property-1',
      available: true,
      occurredAt: 'invalid-date',
      demonstration: true,
    });

    expect(result).toBeNull();
  });
});
