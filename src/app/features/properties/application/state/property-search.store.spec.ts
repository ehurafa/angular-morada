import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';

import type { Property } from '../../domain/models/property';
import { PropertySearchRepository } from '../ports/property-search.repository';
import { PropertySearchStore } from './property-search.store';
import type {
  PropertySearchFilters,
  PropertySearchResult,
} from '../../domain/models/property-search';

const INITIAL_FILTERS: PropertySearchFilters = {
  transactionType: 'sale',
  query: '',
  propertyType: null,
  minimumBedrooms: null,
  maximumPrice: null,
};

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

const SEARCH_RESULT: PropertySearchResult = {
  properties: [PROPERTY],
  matchType: 'exact',
  normalizedQuery: 'pinheiros',
};

describe('PropertySearchStore', () => {
  let store: PropertySearchStore;
  let repository: jasmine.SpyObj<PropertySearchRepository>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<PropertySearchRepository>('PropertySearchRepository', [
      'search',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PropertySearchStore,
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    });

    store = TestBed.inject(PropertySearchStore);
  });

  it('starts with predictable state', () => {
    expect(store.filters()).toEqual(INITIAL_FILTERS);
    expect(store.properties()).toEqual([]);
    expect(store.matchType()).toBe('all');
    expect(store.normalizedQuery()).toBe('');
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.hasResults()).toBeFalse();
  });

  it('updates and resets filters', () => {
    store.updateFilters({
      query: 'Pinheiros',
      minimumBedrooms: 2,
    });

    expect(store.filters()).toEqual({
      ...INITIAL_FILTERS,
      query: 'Pinheiros',
      minimumBedrooms: 2,
    });

    store.resetFilters();

    expect(store.filters()).toEqual(INITIAL_FILTERS);
  });

  it('searches using the current filters and exposes the result', () => {
    const response = new Subject<PropertySearchResult>();

    repository.search.and.returnValue(response);
    store.updateFilters({ query: 'Pinheiros' });

    store.search();

    expect(repository.search).toHaveBeenCalledOnceWith({
      ...INITIAL_FILTERS,
      query: 'Pinheiros',
    });
    expect(store.loading()).toBeTrue();

    response.next(SEARCH_RESULT);
    response.complete();

    expect(store.properties()).toEqual([PROPERTY]);
    expect(store.matchType()).toBe('exact');
    expect(store.normalizedQuery()).toBe('pinheiros');
    expect(store.hasResults()).toBeTrue();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('exposes a controlled error when the search fails', () => {
    repository.search.and.returnValue(throwError(() => new Error('Network unavailable')));

    store.search();

    expect(store.error()).toBe('search-failed');
    expect(store.loading()).toBeFalse();
  });

  it('ignores the result of a previous search', () => {
    const firstResponse = new Subject<PropertySearchResult>();
    const secondResponse = new Subject<PropertySearchResult>();

    repository.search.and.returnValues(firstResponse, secondResponse);

    store.updateFilters({ query: 'Primeira busca' });
    store.search();

    store.updateFilters({ query: 'Segunda busca' });
    store.search();

    firstResponse.next({
      ...SEARCH_RESULT,
      normalizedQuery: 'primeira busca',
    });

    expect(store.normalizedQuery()).toBe('');

    secondResponse.next({
      ...SEARCH_RESULT,
      normalizedQuery: 'segunda busca',
    });
    secondResponse.complete();

    expect(store.normalizedQuery()).toBe('segunda busca');
    expect(store.loading()).toBeFalse();
  });
});
