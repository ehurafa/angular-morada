export type ApiTransactionType = 'comprar' | 'alugar';

export type ApiPropertyType = 'apartamento' | 'casa' | 'studio' | 'cobertura';

export interface PropertyDto {
  readonly id: string;
  readonly title: string;
  readonly propertyType: ApiPropertyType;
  readonly businessType: ApiTransactionType;
  readonly price: number;
  readonly bedrooms: number;
  readonly bathrooms?: number;
  readonly area: number;
  readonly parkingSpaces: number;
  readonly description?: string;
  readonly amenities?: readonly string[];
  readonly imageUrls: readonly string[];
  readonly imageCredits?: readonly (string | null)[];
  readonly neighborhood: string;
  readonly city?: string;
  readonly stateCode?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly condominiumFee?: number | null;
  readonly propertyTax?: number | null;
  readonly featured?: boolean;
}

export interface PropertySearchResponseDto {
  readonly items: readonly PropertyDto[];
  readonly matchType: 'exact' | 'nearby' | 'all';
  readonly normalizedQuery: string;
  readonly message?: string | null;
}
