import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Property } from '../../../domain/models/property';
import { PropertyDetailsContent } from './property-details-content';

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
  description: 'Apartamento demonstrativo próximo ao metrô.',
  amenities: ['Varanda', 'Elevador'],
  images: [],
  location: {
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    stateCode: 'SP',
    latitude: -23.5614,
    longitude: -46.6857,
  },
  condominiumFee: 850,
  propertyTax: 120,
  featured: true,
};

describe('PropertyDetailsContent', () => {
  let fixture: ComponentFixture<PropertyDetailsContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetailsContent],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailsContent);
  });

  function renderProperty(overrides: Partial<Property> = {}): string {
    fixture.componentRef.setInput('property', {
      ...PROPERTY,
      ...overrides,
    });

    fixture.detectChanges();

    return ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  it('renders the property description, amenities and sale costs', () => {
    const content = renderProperty();

    expect(content).toContain('Apartamento demonstrativo próximo ao metrô.');
    expect(content).toContain('Varanda');
    expect(content).toContain('Elevador');
    expect(content).toContain('R$ 850');
    expect(content).toContain('R$ 120');
    expect(content).toContain('Financiamento estimado');
    expect(content).toContain('R$ 7.123');
    expect(content).toContain('Não é proposta de crédito');
  });

  it('renders the announced monthly price for a rental property', () => {
    const content = renderProperty({
      transactionType: 'rent',
      price: 4200,
    });

    expect(content).toContain('Aluguel anunciado');
    expect(content).toContain('R$ 4.200');
    expect(content).not.toContain('Financiamento estimado');
    expect(content).toContain('dependem da confirmação do anunciante');
  });

  it('renders fallback content when optional information is absent', () => {
    const content = renderProperty({
      description: null,
      amenities: [],
      condominiumFee: null,
      propertyTax: null,
    });

    const missingValues = fixture.nativeElement.querySelectorAll('.not-informed');

    expect(content).toContain('ainda não adicionou uma descrição');
    expect(content).toContain('características adicionais ainda não foram informadas');
    expect(missingValues.length).toBe(2);
  });
});
