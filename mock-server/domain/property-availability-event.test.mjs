import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createPropertyAvailabilityEvent } from './property-availability-event.mjs';

describe('createPropertyAvailabilityEvent', () => {
  it('creates a demonstrative availability event with a stable contract', () => {
    const occurredAt = new Date('2026-09-07T12:00:00.000Z');

    const event = createPropertyAvailabilityEvent({
      propertyId: 'property-1',
      occurredAt,
    });

    assert.deepEqual(event, {
      type: 'property-availability.updated',
      propertyId: 'property-1',
      available: true,
      occurredAt: '2026-09-07T12:00:00.000Z',
      demonstration: true,
    });
  });

  it('represents an unavailable property when requested', () => {
    const event = createPropertyAvailabilityEvent({
      propertyId: 'property-2',
      available: false,
      occurredAt: new Date('2026-09-07T12:05:00.000Z'),
    });

    assert.equal(event.available, false);
    assert.equal(event.propertyId, 'property-2');
  });
});
