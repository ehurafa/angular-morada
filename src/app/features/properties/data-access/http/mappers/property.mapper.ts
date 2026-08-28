import type {
  ApiPropertyType,
  ApiTransactionType,
  PropertyDto,
  PropertySearchResponseDto,
} from '../dtos/property-search-response.dto';

import type { Property, PropertyType, TransactionType } from '../../../domain/models/property';

import type { PropertySearchResult } from '../../../domain/models/property-search';

const TRANSACTION_TYPE_MAP = {
  comprar: 'sale',
  alugar: 'rent',
} as const satisfies Record<ApiTransactionType, TransactionType>;

const PROPERTY_TYPE_MAP = {
  apartamento: 'apartment',
  casa: 'house',
  studio: 'studio',
  cobertura: 'penthouse',
} as const satisfies Record<ApiPropertyType, PropertyType>;

export function mapPropertyDto(dto: PropertyDto): Property {
  return {
    id: dto.id,
    title: dto.title,
    type: PROPERTY_TYPE_MAP[dto.propertyType],
    transactionType: TRANSACTION_TYPE_MAP[dto.businessType],
    price: dto.price,
    bedrooms: dto.bedrooms,
    bathrooms: dto.bathrooms ?? null,
    area: dto.area,
    parkingSpaces: dto.parkingSpaces,
    description: dto.description?.trim() || null,
    amenities: dto.amenities ?? [],
    images: dto.imageUrls.map((url, index) => ({
      url,
      alt: dto.title,
      credit: dto.imageCredits?.[index] ?? null,
    })),
    location: {
      neighborhood: dto.neighborhood,
      city: dto.city ?? 'São Paulo',
      stateCode: dto.stateCode ?? 'SP',
      latitude: dto.latitude,
      longitude: dto.longitude,
    },
    condominiumFee: dto.condominiumFee ?? null,
    propertyTax: dto.propertyTax ?? null,
    featured: dto.featured ?? false,
  };
}

export function mapPropertySearchResponseDto(dto: PropertySearchResponseDto): PropertySearchResult {
  return {
    properties: dto.items.map(mapPropertyDto),
    matchType: dto.matchType,
    normalizedQuery: dto.normalizedQuery,
  };
}
