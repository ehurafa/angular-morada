import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import type { PropertySearchFilters } from '../../domain/models/property-search';
import type { PropertySearchResponseDto } from './dtos/property-search-response.dto';
import { HttpPropertySearchRepository } from './http-property-search.repository';

const FILTERS: PropertySearchFilters = {
  transactionType: 'sale',
  query: '  Pinheiros  ',
  propertyType: 'apartment',
  minimumBedrooms: 2,
  maximumPrice: 1000000,
};

const API_RESPONSE: PropertySearchResponseDto = {
  items: [
    {
      id: 'property-1',
      title: 'Apartamento em Pinheiros',
      propertyType: 'apartamento',
      businessType: 'comprar',
      price: 950000,
      bedrooms: 2,
      area: 82,
      parkingSpaces: 1,
      imageUrls: ['/images/property-1.webp'],
      neighborhood: 'Pinheiros',
      latitude: -23.5614,
      longitude: -46.6857,
    },
  ],
  matchType: 'exact',
  normalizedQuery: 'pinheiros',
};

describe('HttpPropertySearchRepository', () => {
  let repository: HttpPropertySearchRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpPropertySearchRepository,
        {
          provide: API_BASE_URL,
          useValue: 'https://api.example.test/',
        },
      ],
    });

    repository = TestBed.inject(HttpPropertySearchRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('sends translated filters and maps the response', async () => {
    const resultPromise = firstValueFrom(repository.search(FILTERS));

    const request = httpTesting.expectOne(
      (candidate) => candidate.url === 'https://api.example.test/properties',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('businessType')).toBe('comprar');
    expect(request.request.params.get('query')).toBe('Pinheiros');
    expect(request.request.params.get('propertyType')).toBe('apartamento');
    expect(request.request.params.get('bedrooms')).toBe('2');
    expect(request.request.params.get('maxPrice')).toBe('1000000');

    request.flush(API_RESPONSE);

    const result = await resultPromise;

    expect(result.matchType).toBe('exact');
    expect(result.normalizedQuery).toBe('pinheiros');
    expect(result.properties[0].type).toBe('apartment');
    expect(result.properties[0].transactionType).toBe('sale');
  });

  it('omits filters without a value', async () => {
    const resultPromise = firstValueFrom(
      repository.search({
        ...FILTERS,
        propertyType: null,
        minimumBedrooms: null,
        maximumPrice: null,
      }),
    );

    const request = httpTesting.expectOne(
      'https://api.example.test/properties?businessType=comprar&query=Pinheiros',
    );

    expect(request.request.params.has('propertyType')).toBeFalse();
    expect(request.request.params.has('bedrooms')).toBeFalse();
    expect(request.request.params.has('maxPrice')).toBeFalse();

    request.flush(API_RESPONSE);

    await resultPromise;
  });
});
