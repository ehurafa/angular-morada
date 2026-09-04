import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Property } from '../../../domain/models/property';
import { PropertyMapPreview } from './property-map-preview';

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
  description: 'Apartamento demonstrativo.',
  amenities: [],
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
  condominiumFee: null,
  propertyTax: null,
  featured: true,
};

describe('PropertyMapPreview', () => {
  let fixture: ComponentFixture<PropertyMapPreview>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyMapPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyMapPreview);
    fixture.componentRef.setInput('property', PROPERTY);

    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function normalizedContent(): string {
    return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  it('renders the selected property summary', () => {
    const image = element.querySelector<HTMLImageElement>('img');

    expect(image?.getAttribute('src')).toBe('/images/property-1.webp');
    expect(image?.alt).toBe('Sala do apartamento');
    expect(normalizedContent()).toContain('Pinheiros · São Paulo');
    expect(normalizedContent()).toContain('Apartamento em Pinheiros');
    expect(normalizedContent()).toContain('82 m² · 2 quartos');
    expect(normalizedContent()).toContain('R$ 950.000');
  });

  it('emits the property id when details are requested', () => {
    const requestedIds: string[] = [];

    fixture.componentInstance.detailsRequested.subscribe((propertyId) => {
      requestedIds.push(propertyId);
    });

    element.querySelector<HTMLButtonElement>('button')?.click();

    expect(requestedIds).toEqual(['property-1']);
  });

  it('renders rental price and singular bedroom correctly', () => {
    fixture.componentRef.setInput('property', {
      ...PROPERTY,
      transactionType: 'rent',
      price: 4200,
      bedrooms: 1,
    });
    fixture.detectChanges();

    expect(normalizedContent()).toContain('1 quarto');
    expect(normalizedContent()).toContain('R$ 4.200 /mês');
  });

  it('renders a placeholder when the property has no image', () => {
    fixture.componentRef.setInput('property', {
      ...PROPERTY,
      images: [],
    });
    fixture.detectChanges();

    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.image-placeholder')).not.toBeNull();
  });
});
