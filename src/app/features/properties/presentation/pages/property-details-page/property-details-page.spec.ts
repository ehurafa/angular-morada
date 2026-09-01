import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';

import { PropertyDetailsRepository } from '../../../application/ports/property-details.repository';
import type { Property } from '../../../domain/models/property';
import { PropertyDetailsPage } from './property-details-page';

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

describe('PropertyDetailsPage', () => {
  let fixture: ComponentFixture<PropertyDetailsPage>;
  let repository: jasmine.SpyObj<PropertyDetailsRepository>;
  let response: Subject<Property>;

  beforeEach(async () => {
    repository = jasmine.createSpyObj<PropertyDetailsRepository>('PropertyDetailsRepository', [
      'findById',
    ]);
    response = new Subject<Property>();
    repository.findById.and.returnValue(response);

    await TestBed.configureTestingModule({
      imports: [PropertyDetailsPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                id: 'property-1',
              }),
            },
          },
        },
        {
          provide: PropertyDetailsRepository,
          useValue: repository,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailsPage);
    fixture.detectChanges();
  });

  it('loads the route property and renders its details', () => {
    expect(repository.findById).toHaveBeenCalledOnceWith('property-1');
    expect(fixture.nativeElement.textContent).toContain('Carregando detalhes do imóvel...');

    response.next(PROPERTY);
    response.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('morada-property-contact-form')).not.toBeNull();

    const heading = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;

    expect(heading.textContent).toContain(PROPERTY.title);
    expect(fixture.nativeElement.textContent).toContain('Pinheiros · São Paulo');
    expect(fixture.nativeElement.textContent).toContain('2 quartos · 82 m² · 1 vaga');
  });

  it('allows another attempt after a loading error', () => {
    response.error(new Error('Property unavailable'));
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    const retryButton = alert.querySelector('button') as HTMLButtonElement;

    expect(alert.textContent).toContain('Não foi possível carregar este imóvel');

    repository.findById.and.returnValue(of(PROPERTY));

    retryButton.click();
    fixture.detectChanges();

    expect(repository.findById).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(PROPERTY.title);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
