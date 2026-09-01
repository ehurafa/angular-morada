import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Property } from '../../../domain/models/property';

import { PropertyCard } from './property-card';

const SALE_PROPERTY: Property = {
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
      credit: 'Imagem demonstrativa',
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

const RENT_PROPERTY: Property = {
  ...SALE_PROPERTY,
  id: 'property-2',
  title: 'Studio na Consolação',
  transactionType: 'rent',
  price: 3900,
  bedrooms: 1,
  bathrooms: null,
  parkingSpaces: 0,
  description: null,
  images: [],
};

describe('PropertyCard', () => {
  let fixture: ComponentFixture<PropertyCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCard);
  });

  it('renders a sale property with its available information', () => {
    fixture.componentRef.setInput('property', SALE_PROPERTY);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector<HTMLImageElement>('img')!;

    expect(element.textContent).toContain('Apartamento em Pinheiros');
    expect(element.textContent).toContain('R$');
    expect(element.textContent).toContain('950.000');
    expect(element.textContent).toContain('2 quartos');
    expect(element.textContent).toContain('1 vaga');
    expect(image.getAttribute('src')).toBe('/images/property-1.webp');
    expect(image.alt).toBe('Sala do apartamento');
    expect(element.querySelector('figcaption')?.textContent).toContain('Imagem demonstrativa');
  });

  it('renders rent pricing and omits unavailable information', () => {
    fixture.componentRef.setInput('property', RENT_PROPERTY);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('3.900');
    expect(element.textContent).toContain('/mês');
    expect(element.textContent).toContain('1 quarto');
    expect(element.textContent).not.toContain('banheiro');
    expect(element.textContent).toContain('0 vagas');
    expect(element.querySelector('figure')).toBeNull();
  });
  it('emits the selected property for detail and map actions', () => {
    const details: string[] = [];
    const maps: string[] = [];

    fixture.componentInstance.detailsRequested.subscribe((id) => details.push(id));
    fixture.componentInstance.mapRequested.subscribe((id) => maps.push(id));

    fixture.componentRef.setInput('property', SALE_PROPERTY);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const actionButtons = element.querySelectorAll<HTMLButtonElement>('.property-actions button');

    actionButtons[0].click();
    actionButtons[1].click();

    expect(details).toEqual([SALE_PROPERTY.id]);
    expect(maps).toEqual([SALE_PROPERTY.id]);
  });
});
