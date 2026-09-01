import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { PropertySearchRepository } from '../../../application/ports/property-search.repository';
import type { Property } from '../../../domain/models/property';
import type {
  PropertySearchFilters,
  PropertySearchResult,
} from '../../../domain/models/property-search';

import { PropertySearchPage } from './property-search-page';

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
  images: [],
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
  matchType: 'all',
  normalizedQuery: '',
};

describe('PropertySearchPage', () => {
  let fixture: ComponentFixture<PropertySearchPage>;
  let repository: jasmine.SpyObj<PropertySearchRepository>;
  let response: Subject<PropertySearchResult>;
  let router: Router;

  beforeEach(async () => {
    repository = jasmine.createSpyObj<PropertySearchRepository>('PropertySearchRepository', [
      'search',
    ]);
    response = new Subject<PropertySearchResult>();
    repository.search.and.returnValue(response);

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([]),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertySearchPage);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('searches on initialization and renders the result', () => {
    expect(repository.search).toHaveBeenCalledOnceWith(INITIAL_FILTERS);
    expect(fixture.nativeElement.textContent).toContain('Buscando imóveis...');

    response.next(SEARCH_RESULT);
    response.complete();
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article') as HTMLElement;

    expect(article).not.toBeNull();
    expect(article.querySelector('h2')?.textContent).toContain(PROPERTY.title);
    expect(article.textContent).toContain('Pinheiros · São Paulo');
    expect(article.textContent).toContain('2 quartos');
    expect(article.textContent).toContain('82 m²');
  });

  it('allows another attempt after a search error', () => {
    response.error(new Error('Network unavailable'));
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    const retryButton = alert.querySelector('button') as HTMLButtonElement;

    expect(alert.textContent).toContain('Não foi possível carregar os imóveis');

    repository.search.and.returnValue(of(SEARCH_RESULT));

    retryButton.click();
    fixture.detectChanges();

    expect(repository.search).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('article')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('navigates to the selected property details', () => {
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);

    response.next(SEARCH_RESULT);
    response.complete();
    fixture.detectChanges();

    const detailsButton = fixture.nativeElement.querySelector(
      '.property-actions button',
    ) as HTMLButtonElement;

    detailsButton.click();

    expect(navigate).toHaveBeenCalledOnceWith(['/imoveis', 'property-1']);
  });
});
