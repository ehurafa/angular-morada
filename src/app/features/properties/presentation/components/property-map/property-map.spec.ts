import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Property } from '../../../domain/models/property';
import { PropertyMap } from './property-map';

const PROPERTY_ONE: Property = {
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
  images: [],
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

const PROPERTY_TWO: Property = {
  ...PROPERTY_ONE,
  id: 'property-2',
  title: 'Casa em Perdizes',
  type: 'house',
  location: {
    ...PROPERTY_ONE.location,
    neighborhood: 'Perdizes',
    latitude: -23.5379,
    longitude: -46.6807,
  },
};

describe('PropertyMap', () => {
  let fixture: ComponentFixture<PropertyMap>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyMap],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyMap);
    fixture.componentRef.setInput('properties', [PROPERTY_ONE, PROPERTY_TWO]);

    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function markers(): NodeListOf<HTMLElement> {
    return element.querySelectorAll<HTMLElement>('.morada-marker');
  }

  it('renders an accessible map with one numbered marker per property', () => {
    const map = element.querySelector<HTMLElement>('.map-canvas');

    expect(map?.getAttribute('role')).toBe('region');
    expect(map?.getAttribute('aria-label')).toContain('Mapa interativo');
    expect(markers().length).toBe(2);
    expect(markers()[0].textContent?.trim()).toBe('1');
    expect(markers()[1].textContent?.trim()).toBe('2');
  });

  it('identifies the selected property marker', () => {
    fixture.componentRef.setInput('selectedPropertyId', 'property-2');
    fixture.detectChanges();

    const selectedMarker = element.querySelector<HTMLElement>('.morada-marker.selected');

    expect(selectedMarker?.textContent?.trim()).toBe('2');
  });

  it('emits the property id when its marker is clicked', () => {
    const selectedIds: string[] = [];

    fixture.componentInstance.propertySelected.subscribe((propertyId) => {
      selectedIds.push(propertyId);
    });

    const markerIcons = element.querySelectorAll<HTMLElement>('.leaflet-marker-icon');

    markerIcons[1].click();

    expect(selectedIds).toEqual(['property-2']);
  });

  it('updates the markers when the property collection changes', () => {
    fixture.componentRef.setInput('properties', [PROPERTY_ONE]);
    fixture.detectChanges();

    expect(markers().length).toBe(1);
    expect(markers()[0].textContent?.trim()).toBe('1');
  });
});
