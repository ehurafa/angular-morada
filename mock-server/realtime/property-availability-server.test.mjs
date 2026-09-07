import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { describe, it } from 'node:test';

import WebSocket from 'ws';

import { createPropertyAvailabilityServer } from './property-availability-server.mjs';

const PROPERTIES = [{ id: 'property-1' }, { id: 'property-2' }];
const FIXED_DATE = new Date('2026-09-07T12:00:00.000Z');

async function startFixture() {
  const server = createServer();

  const availabilityServer = createPropertyAvailabilityServer({
    server,
    properties: PROPERTIES,
    intervalMs: 60_000,
    now: () => FIXED_DATE,
  });

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();

  assert.ok(address !== null && typeof address !== 'string');

  const client = new WebSocket(`ws://127.0.0.1:${address.port}/api/property-availability`);

  const firstMessage = once(client, 'message', {
    signal: AbortSignal.timeout(2_000),
  });

  return {
    availabilityServer,
    client,
    firstMessage,
    server,
  };
}

async function closeFixture({ availabilityServer, client, server }) {
  if (client.readyState !== WebSocket.CLOSED) {
    const clientClosed = once(client, 'close');

    client.close();
    await clientClosed;
  }

  await availabilityServer.close();

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

describe('property availability WebSocket server', () => {
  it('sends an availability event when a client connects', async () => {
    const fixture = await startFixture();

    try {
      const [message] = await fixture.firstMessage;

      assert.deepEqual(JSON.parse(message.toString()), {
        type: 'property-availability.updated',
        propertyId: 'property-1',
        available: true,
        occurredAt: '2026-09-07T12:00:00.000Z',
        demonstration: true,
      });
    } finally {
      await closeFixture(fixture);
    }
  });

  it('broadcasts the next property update to connected clients', async () => {
    const fixture = await startFixture();

    try {
      await fixture.firstMessage;

      const nextMessage = once(fixture.client, 'message', {
        signal: AbortSignal.timeout(2_000),
      });

      fixture.availabilityServer.broadcastNextAvailability();

      const [message] = await nextMessage;
      const event = JSON.parse(message.toString());

      assert.equal(event.propertyId, 'property-2');
      assert.equal(event.available, true);
    } finally {
      await closeFixture(fixture);
    }
  });
});
