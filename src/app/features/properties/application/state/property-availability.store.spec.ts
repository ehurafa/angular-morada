import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';
import { PropertyAvailabilityRepository } from '../ports/property-availability.repository';
import { PropertyAvailabilityStore } from './property-availability.store';

const UPDATE: PropertyAvailabilityUpdate = {
  propertyId: 'property-1',
  propertyTitle: 'Apartamento com varanda',
  available: true,
  occurredAt: new Date('2026-09-08T12:00:00.000Z'),
  demonstration: true,
};

describe('PropertyAvailabilityStore', () => {
  let store: PropertyAvailabilityStore;
  let repository: jasmine.SpyObj<PropertyAvailabilityRepository>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<PropertyAvailabilityRepository>(
      'PropertyAvailabilityRepository',
      ['watch'],
    );

    TestBed.configureTestingModule({
      providers: [
        PropertyAvailabilityStore,
        {
          provide: PropertyAvailabilityRepository,
          useValue: repository,
        },
      ],
    });

    store = TestBed.inject(PropertyAvailabilityStore);
  });

  it('starts with predictable state', () => {
    expect(store.latestUpdate()).toBeNull();
    expect(store.status()).toBe('idle');
  });

  it('connects once and exposes received updates', () => {
    const updates = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValue(updates);

    store.connect();

    expect(repository.watch).toHaveBeenCalledTimes(1);
    expect(store.status()).toBe('connecting');
    expect(store.latestUpdate()).toBeNull();

    store.connect();

    expect(repository.watch).toHaveBeenCalledTimes(1);

    updates.next(UPDATE);

    expect(store.latestUpdate()).toEqual(UPDATE);
    expect(store.status()).toBe('connected');

    store.connect();

    expect(repository.watch).toHaveBeenCalledTimes(1);
  });

  it('exposes a controlled error when the connection fails', () => {
    repository.watch.and.returnValue(throwError(() => new Error('Connection unavailable')));

    store.connect();

    expect(store.latestUpdate()).toBeNull();
    expect(store.status()).toBe('error');
  });

  it('allows reconnection after the stream completes', () => {
    const firstConnection = new Subject<PropertyAvailabilityUpdate>();
    const secondConnection = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValues(firstConnection, secondConnection);

    store.connect();
    firstConnection.complete();

    expect(store.status()).toBe('disconnected');

    store.connect();

    expect(repository.watch).toHaveBeenCalledTimes(2);
    expect(store.status()).toBe('connecting');
  });

  it('reconnects automatically one second after the stream completes', fakeAsync(() => {
    const firstConnection = new Subject<PropertyAvailabilityUpdate>();
    const secondConnection = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValues(firstConnection, secondConnection);

    store.connect();
    firstConnection.complete();

    expect(store.status()).toBe('disconnected');

    tick(999);
    expect(repository.watch).toHaveBeenCalledTimes(1);

    tick(1);
    expect(repository.watch).toHaveBeenCalledTimes(2);
    expect(store.status()).toBe('connecting');
  }));

  it('reconnects automatically after a connection error', fakeAsync(() => {
    const secondConnection = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValues(
      throwError(() => new Error('Connection unavailable')),
      secondConnection,
    );

    store.connect();

    expect(store.status()).toBe('error');

    tick(1000);

    expect(repository.watch).toHaveBeenCalledTimes(2);
    expect(store.status()).toBe('connecting');
  }));

  it('waits longer after consecutive connection errors', fakeAsync(() => {
    const thirdConnection = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValues(
      throwError(() => new Error('First failure')),
      throwError(() => new Error('Second failure')),
      thirdConnection,
    );

    store.connect();

    tick(1000);
    expect(repository.watch).toHaveBeenCalledTimes(2);

    tick(1999);
    expect(repository.watch).toHaveBeenCalledTimes(2);

    tick(1);
    expect(repository.watch).toHaveBeenCalledTimes(3);
    expect(store.status()).toBe('connecting');
  }));

  it('returns to the initial delay after receiving an update', fakeAsync(() => {
    const recoveredConnection = new Subject<PropertyAvailabilityUpdate>();
    const nextConnection = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValues(
      throwError(() => new Error('Connection unavailable')),
      recoveredConnection,
      nextConnection,
    );

    store.connect();
    tick(1000);

    recoveredConnection.next(UPDATE);
    recoveredConnection.complete();

    tick(999);
    expect(repository.watch).toHaveBeenCalledTimes(2);

    tick(1);
    expect(repository.watch).toHaveBeenCalledTimes(3);
    expect(store.status()).toBe('connecting');
  }));

  it('caps the reconnection delay at 30 seconds', fakeAsync(() => {
    const finalConnection = new Subject<PropertyAvailabilityUpdate>();

    repository.watch.and.returnValues(
      throwError(() => new Error('Failure 1')),
      throwError(() => new Error('Failure 2')),
      throwError(() => new Error('Failure 3')),
      throwError(() => new Error('Failure 4')),
      throwError(() => new Error('Failure 5')),
      throwError(() => new Error('Failure 6')),
      finalConnection,
    );

    store.connect();

    for (const delayMs of [1000, 2000, 4000, 8000, 16000]) {
      tick(delayMs);
    }

    expect(repository.watch).toHaveBeenCalledTimes(6);

    tick(29_999);
    expect(repository.watch).toHaveBeenCalledTimes(6);

    tick(1);
    expect(repository.watch).toHaveBeenCalledTimes(7);
    expect(store.status()).toBe('connecting');
  }));
});
