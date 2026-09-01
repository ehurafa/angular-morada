import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import type { Property } from '../../domain/models/property';
import { PropertyDetailsRepository } from '../ports/property-details.repository';
import { PropertyDetailsStore } from './property-details.store';

const PROPERTY: Property = {
  id: 'property-1',
  title: 'Apartamento em Pinheiros',
  type: 'apartment',
  transactionType: 'sale',
  price: 950000,
  bedrooms: 2,
  bathrooms: 2,
  area: 82,
  parkingSpaces: 1,
  description: 'Imóvel demonstrativo próximo ao metrô.',
  amenities: ['Varanda'],
  images: [
    {
      url: '/images/property-1.webp',
      alt: 'Sala do apartamento',
      credit: null,
    },
  ],
  location: {
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    stateCode: 'SP',
    latitude: -23.5614,
    longitude: -46.6857,
  },
  condominiumFee: 850,
  propertyTax: null,
  featured: true,
};

describe('PropertyDetailsStore', () => {
  let store: PropertyDetailsStore;
  let repository: jasmine.SpyObj<PropertyDetailsRepository>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<PropertyDetailsRepository>('PropertyDetailsRepository', [
      'findById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PropertyDetailsStore,
        {
          provide: PropertyDetailsRepository,
          useValue: repository,
        },
      ],
    });

    store = TestBed.inject(PropertyDetailsStore);
  });

  it('starts with predictable state', () => {
    expect(store.property()).toBeNull();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('loads and exposes a property by id', () => {
    const response = new Subject<Property>();

    repository.findById.and.returnValue(response);

    store.load('property-1');

    expect(repository.findById).toHaveBeenCalledOnceWith('property-1');
    expect(store.loading()).toBeTrue();
    expect(store.property()).toBeNull();
    expect(store.error()).toBeNull();

    response.next(PROPERTY);
    response.complete();

    expect(store.property()).toEqual(PROPERTY);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('exposes a controlled error when loading fails', () => {
    repository.findById.and.returnValue(throwError(() => new Error('Property unavailable')));

    store.load('property-1');

    expect(store.property()).toBeNull();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBe('load-failed');
  });

  it('ignores the result of a previous load', () => {
    const firstResponse = new Subject<Property>();
    const secondResponse = new Subject<Property>();

    repository.findById.and.returnValues(firstResponse, secondResponse);

    store.load('property-1');
    store.load('property-2');

    firstResponse.next(PROPERTY);

    expect(store.property()).toBeNull();

    secondResponse.next({
      ...PROPERTY,
      id: 'property-2',
    });
    secondResponse.complete();

    expect(store.property()?.id).toBe('property-2');
    expect(store.loading()).toBeFalse();
  });
});
