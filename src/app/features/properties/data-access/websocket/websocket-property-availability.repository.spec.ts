import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import {
  WEBSOCKET_FACTORY,
  type WebSocketFactory,
} from '../../../../core/realtime/websocket-factory.token';
import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';
import { buildPropertyAvailabilityUrl } from './build-property-availability-url';
import { WebSocketPropertyAvailabilityRepository } from './websocket-property-availability.repository';

class FakeWebSocket extends EventTarget {
  readonly close = jasmine.createSpy('close');
  readyState: number = WebSocket.OPEN;

  emitMessage(data: unknown): void {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }

  emitError(): void {
    this.dispatchEvent(new Event('error'));
  }

  emitClose(): void {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent(new CloseEvent('close'));
  }
}

describe('WebSocketPropertyAvailabilityRepository', () => {
  let repository: WebSocketPropertyAvailabilityRepository;
  let socket: FakeWebSocket;
  let createWebSocket: jasmine.Spy<WebSocketFactory>;

  beforeEach(() => {
    socket = new FakeWebSocket();
    createWebSocket = jasmine.createSpy<WebSocketFactory>('createWebSocket');
    createWebSocket.and.returnValue(socket as unknown as WebSocket);

    TestBed.configureTestingModule({
      providers: [
        WebSocketPropertyAvailabilityRepository,
        {
          provide: API_BASE_URL,
          useValue: '/api',
        },
        {
          provide: WEBSOCKET_FACTORY,
          useValue: createWebSocket,
        },
      ],
    });

    repository = TestBed.inject(WebSocketPropertyAvailabilityRepository);
  });

  it('connects and maps valid availability updates', () => {
    const updates: PropertyAvailabilityUpdate[] = [];
    const subscription = repository.watch().subscribe((update) => {
      updates.push(update);
    });

    expect(createWebSocket).toHaveBeenCalledOnceWith(
      buildPropertyAvailabilityUrl('/api', window.location.origin),
    );

    socket.emitMessage(
      JSON.stringify({
        type: 'property-availability.updated',
        propertyId: 'property-1',
        available: true,
        occurredAt: '2026-09-08T12:00:00.000Z',
        demonstration: true,
      }),
    );

    expect(updates).toEqual([
      {
        propertyId: 'property-1',
        available: true,
        occurredAt: new Date('2026-09-08T12:00:00.000Z'),
        demonstration: true,
      },
    ]);

    subscription.unsubscribe();

    expect(socket.close).toHaveBeenCalledTimes(1);
  });

  it('ignores malformed and unknown messages', () => {
    const next = jasmine.createSpy('next');
    const subscription = repository.watch().subscribe(next);

    socket.emitMessage('invalid-json');
    socket.emitMessage(JSON.stringify({ type: 'unknown.event' }));

    expect(next).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('reports connection errors and closes the socket', () => {
    const error = jasmine.createSpy('error');

    repository.watch().subscribe({ error });

    socket.emitError();

    expect(error).toHaveBeenCalledOnceWith(jasmine.any(Error));
    expect((error.calls.mostRecent().args[0] as Error).message).toBe(
      'Property availability WebSocket connection failed.',
    );
    expect(socket.close).toHaveBeenCalledTimes(1);
  });

  it('completes when the server closes the connection', () => {
    const complete = jasmine.createSpy('complete');

    repository.watch().subscribe({ complete });

    socket.emitClose();

    expect(complete).toHaveBeenCalledTimes(1);
    expect(socket.close).not.toHaveBeenCalled();
  });
});
