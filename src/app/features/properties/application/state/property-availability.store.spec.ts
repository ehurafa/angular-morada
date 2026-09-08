import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';
import { PropertyAvailabilityRepository } from '../ports/property-availability.repository';
import { PropertyAvailabilityStore } from './property-availability.store';

const UPDATE: PropertyAvailabilityUpdate = {
  propertyId: 'property-1',
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
});
