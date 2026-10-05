import { ComponentFixture, TestBed } from '@angular/core/testing';
import { filter, firstValueFrom, of, Subject } from 'rxjs';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';

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

const PROPERTY_TWO: Property = {
  ...PROPERTY,
  id: 'property-2',
  title: 'Casa em Perdizes',
  type: 'house',
  price: 1480000,
  location: {
    ...PROPERTY.location,
    neighborhood: 'Perdizes',
    latitude: -23.5379,
    longitude: -46.6807,
  },
};

const SEARCH_RESULT: PropertySearchResult = {
  properties: [PROPERTY],
  matchType: 'all',
  normalizedQuery: '',
};

const MAP_SEARCH_RESULT: PropertySearchResult = {
  ...SEARCH_RESULT,
  properties: [PROPERTY, PROPERTY_TWO],
};

function createRepositorySpy(): jasmine.SpyObj<PropertySearchRepository> {
  const repository = jasmine.createSpyObj<PropertySearchRepository>('PropertySearchRepository', [
    'search',
    'listLocations',
  ]);

  repository.listLocations.and.returnValue(of([{ label: 'Pinheiros', kind: 'bairro' as const }]));

  return repository;
}

describe('PropertySearchPage', () => {
  let fixture: ComponentFixture<PropertySearchPage>;
  let repository: jasmine.SpyObj<PropertySearchRepository>;
  let response: Subject<PropertySearchResult>;
  let router: Router;

  beforeEach(async () => {
    repository = createRepositorySpy();
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

  it('explains when the search shows nearby alternatives', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.nearby-feedback')).toBeNull();

    response.next({
      ...SEARCH_RESULT,
      matchType: 'nearby',
      normalizedQuery: 'xpto',
    });
    response.complete();
    fixture.detectChanges();

    const notice = element.querySelector<HTMLElement>('.nearby-feedback');

    expect(notice?.getAttribute('role')).toBe('status');
    expect(notice?.textContent).toContain('Não encontramos imóveis para essa localização.');
    expect(notice?.textContent).toContain('respeitam seus filtros.');
    expect(element.querySelector('article')).not.toBeNull();
  });

  it('does not show the alternative-results notice when no properties remain', () => {
    response.next({
      ...SEARCH_RESULT,
      properties: [],
      matchType: 'nearby',
      normalizedQuery: 'xpto',
    });
    response.complete();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.nearby-feedback')).toBeNull();
    expect(element.textContent).toContain('Nenhum imóvel com esses filtros');
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

    expect(navigate).toHaveBeenCalledOnceWith(['/imoveis', 'property-1'], {
      queryParamsHandling: 'preserve',
    });
  });

  it('opens the selected property on the map from its card', () => {
    response.next(SEARCH_RESULT);
    response.complete();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const cardButtons = element.querySelectorAll<HTMLButtonElement>('.property-actions button');

    cardButtons[1].click();
    fixture.detectChanges();

    const selectedMarker = element.querySelector('.morada-marker.selected');
    const preview = element.querySelector('morada-property-map-preview');

    expect(element.querySelector('.property-grid')).toBeNull();
    expect(element.querySelector('morada-property-map')).not.toBeNull();
    expect(selectedMarker).not.toBeNull();
    expect(preview?.textContent).toContain(PROPERTY.title);
  });

  it('updates the preview when another map marker is selected', () => {
    response.next(MAP_SEARCH_RESULT);
    response.complete();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const viewButtons = element.querySelectorAll<HTMLButtonElement>('.view-switch button');

    viewButtons[1].click();
    fixture.detectChanges();

    const markerIcons = element.querySelectorAll<HTMLElement>('.leaflet-marker-icon');

    markerIcons[1].click();
    fixture.detectChanges();

    const selectedMarker = element.querySelector<HTMLElement>('.morada-marker.selected');

    const preview = element.querySelector('morada-property-map-preview');

    expect(selectedMarker?.textContent?.trim()).toBe('2');
    expect(preview?.textContent).toContain(PROPERTY_TWO.title);
  });

  it('switches between the property list and map', () => {
    response.next(SEARCH_RESULT);
    response.complete();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const viewButtons = element.querySelectorAll<HTMLButtonElement>('.view-switch button');

    expect(element.querySelector('.property-grid')).not.toBeNull();
    expect(element.querySelector('morada-property-map')).toBeNull();
    expect(viewButtons[0].getAttribute('aria-pressed')).toBe('true');

    viewButtons[1].click();
    fixture.detectChanges();

    expect(element.querySelector('.property-grid')).toBeNull();
    expect(element.querySelector('morada-property-map')).not.toBeNull();
    expect(element.querySelector('morada-property-map-preview')).not.toBeNull();
    expect(element.querySelector('.map-preview-slot')?.textContent).toContain(PROPERTY.title);
    expect(viewButtons[1].getAttribute('aria-pressed')).toBe('true');

    viewButtons[0].click();
    fixture.detectChanges();

    expect(element.querySelector('.property-grid')).not.toBeNull();
    expect(element.querySelector('morada-property-map')).toBeNull();
  });

  it('loads and displays neighborhood suggestions when the page opens', () => {
    expect(repository.listLocations).toHaveBeenCalledTimes(1);

    const element = fixture.nativeElement as HTMLElement;
    const options = element.querySelectorAll<HTMLOptionElement>(
      '#property-location-options option',
    );

    expect(Array.from(options, (option) => option.value)).toEqual(['Pinheiros']);
  });
});

describe('PropertySearchPage URL filters', () => {
  it('restores all URL filters before the initial search', async () => {
    const repository = createRepositorySpy();
    repository.search.and.returnValue(of(SEARCH_RESULT));

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([{ path: '', component: PropertySearchPage }]),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    await RouterTestingHarness.create(
      '/?transactionType=rent&query=Pinheiros&propertyType=apartment&minimumBedrooms=2&maximumPrice=5000',
    );

    expect(repository.search).toHaveBeenCalledOnceWith({
      transactionType: 'rent',
      query: 'Pinheiros',
      propertyType: 'apartment',
      minimumBedrooms: 2,
      maximumPrice: 5000,
    });
  });

  it('updates the search when URL filters change on the same page', async () => {
    const repository = createRepositorySpy();
    repository.search.and.returnValue(of(SEARCH_RESULT));

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([{ path: '', component: PropertySearchPage }]),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const firstPage = await harness.navigateByUrl(
      '/?transactionType=rent&query=Pinheiros&propertyType=apartment&minimumBedrooms=2&maximumPrice=5000',
      PropertySearchPage,
    );

    repository.search.calls.reset();

    const secondPage = await harness.navigateByUrl('/?query=Perdizes', PropertySearchPage);

    expect(secondPage).toBe(firstPage);
    expect(repository.search).toHaveBeenCalledOnceWith({
      transactionType: 'sale',
      query: 'Perdizes',
      propertyType: null,
      minimumBedrooms: null,
      maximumPrice: null,
    });
  });

  it('updates the URL and searches once when the form is submitted', async () => {
    const repository = createRepositorySpy();
    repository.search.and.returnValue(of(SEARCH_RESULT));

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([{ path: '', component: PropertySearchPage }]),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create('/');
    const router = TestBed.inject(Router);
    const element = harness.routeNativeElement!;
    const input = element.querySelector<HTMLInputElement>('#property-location')!;
    const form = element.querySelector<HTMLFormElement>('form[role="search"]')!;

    repository.search.calls.reset();

    input.value = 'Pinheiros';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    harness.detectChanges();

    expect(repository.search).not.toHaveBeenCalled();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.parseUrl(router.url).queryParams).toEqual({
      query: 'Pinheiros',
    });
    expect(repository.search).toHaveBeenCalledOnceWith({
      ...INITIAL_FILTERS,
      query: 'Pinheiros',
    });
  });

  it('searches again when the submitted filters match the current URL', async () => {
    const repository = createRepositorySpy();
    repository.search.and.returnValue(of(SEARCH_RESULT));

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([{ path: '', component: PropertySearchPage }]),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create('/?query=Pinheiros');
    const router = TestBed.inject(Router);
    const originalUrl = router.url;
    const form = harness.routeNativeElement!.querySelector<HTMLFormElement>('form[role="search"]')!;

    repository.search.calls.reset();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe(originalUrl);
    expect(repository.search).toHaveBeenCalledOnceWith({
      ...INITIAL_FILTERS,
      query: 'Pinheiros',
    });
  });

  it('updates the URL when rent is selected in the header', async () => {
    const repository = createRepositorySpy();
    repository.search.and.returnValue(of(SEARCH_RESULT));

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([{ path: '', component: PropertySearchPage }]),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create('/?query=Pinheiros');
    const router = TestBed.inject(Router);
    const buttons = harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>(
      'morada-site-header nav button',
    );
    const rentButton = Array.from(buttons).find(
      (button) => button.textContent?.trim() === 'Alugar',
    )!;

    repository.search.calls.reset();

    rentButton.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.parseUrl(router.url).queryParams).toEqual({
      transactionType: 'rent',
      query: 'Pinheiros',
    });
    expect(repository.search).toHaveBeenCalledOnceWith({
      ...INITIAL_FILTERS,
      transactionType: 'rent',
      query: 'Pinheiros',
    });
  });

  it('restores filters when navigating back and forward', async () => {
    const repository = createRepositorySpy();
    repository.search.and.returnValue(of(SEARCH_RESULT));

    await TestBed.configureTestingModule({
      imports: [PropertySearchPage],
      providers: [
        provideRouter([{ path: '', component: PropertySearchPage }]),
        provideLocationMocks(),
        {
          provide: PropertySearchRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create('/?query=Pinheiros');
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    router.setUpLocationChangeListener();

    await harness.navigateByUrl('/?transactionType=rent&query=Perdizes');

    repository.search.calls.reset();

    const backNavigation = firstValueFrom(
      router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    );

    location.back();
    await backNavigation;
    harness.detectChanges();

    expect(repository.search).toHaveBeenCalledOnceWith({
      ...INITIAL_FILTERS,
      query: 'Pinheiros',
    });
    expect(
      harness.routeNativeElement!.querySelector<HTMLInputElement>('#property-location')!.value,
    ).toBe('Pinheiros');

    repository.search.calls.reset();

    const forwardNavigation = firstValueFrom(
      router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    );

    location.forward();
    await forwardNavigation;
    harness.detectChanges();

    expect(repository.search).toHaveBeenCalledOnceWith({
      ...INITIAL_FILTERS,
      transactionType: 'rent',
      query: 'Perdizes',
    });
    expect(
      harness.routeNativeElement!.querySelector<HTMLInputElement>('#property-location')!.value,
    ).toBe('Perdizes');
  });
});
