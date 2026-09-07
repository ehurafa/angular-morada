import { WebSocket, WebSocketServer } from 'ws';

import { createPropertyAvailabilityEvent } from '../domain/property-availability-event.mjs';

const DEFAULT_INTERVAL_MS = 10_000;
const DEFAULT_PATH = '/api/property-availability';

export function createPropertyAvailabilityServer({
  server,
  properties = [],
  intervalMs = DEFAULT_INTERVAL_MS,
  now = () => new Date(),
}) {
  const webSocketServer = new WebSocketServer({
    server,
    path: DEFAULT_PATH,
  });

  let nextPropertyIndex = 0;

  function createNextEvent() {
    const property = properties[nextPropertyIndex];

    if (property === undefined) {
      return null;
    }

    nextPropertyIndex = (nextPropertyIndex + 1) % properties.length;

    return createPropertyAvailabilityEvent({
      propertyId: property.id,
      occurredAt: now(),
    });
  }

  function sendEvent(client, event) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  }

  function broadcastNextAvailability() {
    const event = createNextEvent();

    if (event === null) {
      return;
    }

    for (const client of webSocketServer.clients) {
      sendEvent(client, event);
    }
  }

  webSocketServer.on('connection', (client) => {
    const event = createNextEvent();

    if (event !== null) {
      sendEvent(client, event);
    }
  });

  const interval = setInterval(broadcastNextAvailability, intervalMs);
  interval.unref();

  return {
    broadcastNextAvailability,

    close() {
      clearInterval(interval);

      for (const client of webSocketServer.clients) {
        client.close(1001, 'Servidor encerrado.');
      }

      return new Promise((resolve, reject) => {
        webSocketServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}
