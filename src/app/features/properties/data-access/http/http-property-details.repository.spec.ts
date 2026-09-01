import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import type { PropertyDto } from './dtos/property-search-response.dto';
import { HttpPropertyDetailsRepository } from './http-property-details.repository';

const API_RESPONSE: PropertyDto = {
  id: 'property-1',
  title: 'Apartamento em Pinheiros',
  propertyType: 'apartamento',
  businessType: 'comprar',
  price: 950000,
  bedrooms: 2,
  bathrooms: 2,
  area: 82,
  parkingSpaces: 1,
  description: 'Apartamento demonstrativo.',
  amenities: ['Varanda'],
  imageUrls: ['/images/property-1.webp'],
  neighborhood: 'Pinheiros',
  latitude: -23.5614,
  longitude: -46.6857,
};

describe('HttpPropertyDetailsRepository', () => {
  let repository: HttpPropertyDetailsRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpPropertyDetailsRepository,
        {
          provide: API_BASE_URL,
          useValue: 'https://api.example.test/',
        },
      ],
    });

    repository = TestBed.inject(HttpPropertyDetailsRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads and maps a property by id', async () => {
    const resultPromise = firstValueFrom(repository.findById('property-1'));

    const request = httpTesting.expectOne('https://api.example.test/properties/property-1');

    expect(request.request.method).toBe('GET');

    request.flush(API_RESPONSE);

    const result = await resultPromise;

    expect(result.id).toBe('property-1');
    expect(result.type).toBe('apartment');
    expect(result.transactionType).toBe('sale');
    expect(result.description).toBe('Apartamento demonstrativo.');
  });
});
