import type { PropertyDto, PropertySearchResponseDto } from '../dtos/property-search-response.dto';

import { mapPropertyDto, mapPropertySearchResponseDto } from './property.mapper';

const COMPLETE_PROPERTY_DTO: PropertyDto = {
  id: 'property-1',
  title: 'Apartamento em Pinheiros',
  propertyType: 'apartamento',
  businessType: 'comprar',
  price: 950000,
  bedrooms: 2,
  bathrooms: 2,
  area: 82,
  parkingSpaces: 1,
  description: '  Imóvel demonstrativo próximo ao metrô.  ',
  amenities: ['Varanda'],
  imageUrls: ['/images/property-1.webp', '/images/property-2.webp'],
  imageCredits: ['Fotógrafo demonstrativo', null],
  neighborhood: 'Pinheiros',
  city: 'São Paulo',
  stateCode: 'SP',
  latitude: -23.5614,
  longitude: -46.6857,
  condominiumFee: 850,
  propertyTax: 240,
  featured: true,
};

const MINIMAL_PROPERTY_DTO: PropertyDto = {
  id: 'property-2',
  title: 'Studio na Consolação',
  propertyType: 'studio',
  businessType: 'alugar',
  price: 4200,
  bedrooms: 1,
  area: 42,
  parkingSpaces: 0,
  imageUrls: ['/images/property-2.webp'],
  neighborhood: 'Consolação',
  latitude: -23.5535,
  longitude: -46.6603,
};

describe('property mapper', () => {
  it('maps the API contract to the domain model', () => {
    const property = mapPropertyDto(COMPLETE_PROPERTY_DTO);

    expect(property).toEqual({
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
          alt: 'Apartamento em Pinheiros',
          credit: 'Fotógrafo demonstrativo',
        },
        {
          url: '/images/property-2.webp',
          alt: 'Apartamento em Pinheiros',
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
      propertyTax: 240,
      featured: true,
    });
  });

  it('normalizes fields omitted by the API', () => {
    const property = mapPropertyDto(MINIMAL_PROPERTY_DTO);

    expect(property.bathrooms).toBeNull();
    expect(property.description).toBeNull();
    expect(property.amenities).toEqual([]);
    expect(property.images[0].credit).toBeNull();
    expect(property.location.city).toBe('São Paulo');
    expect(property.location.stateCode).toBe('SP');
    expect(property.condominiumFee).toBeNull();
    expect(property.propertyTax).toBeNull();
    expect(property.featured).toBeFalse();
  });

  it('maps a search response without exposing the API message', () => {
    const response: PropertySearchResponseDto = {
      items: [MINIMAL_PROPERTY_DTO],
      matchType: 'nearby',
      normalizedQuery: 'bairro inexistente',
      message: 'Texto controlado pelo servidor',
    };

    const result = mapPropertySearchResponseDto(response);

    expect(result).toEqual({
      properties: [mapPropertyDto(MINIMAL_PROPERTY_DTO)],
      matchType: 'nearby',
      normalizedQuery: 'bairro inexistente',
    });
  });
});
