export type TransactionType = 'sale' | 'rent';

export type PropertyType = 'apartment' | 'house' | 'studio' | 'penthouse';

export interface PropertyLocation {
  readonly neighborhood: string;
  readonly city: string;
  readonly stateCode: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface PropertyImage {
  readonly url: string;
  readonly alt: string;
  readonly credit: string | null;
}

export interface Property {
  readonly id: string;
  readonly title: string;
  readonly type: PropertyType;
  readonly transactionType: TransactionType;
  readonly price: number;
  readonly bedrooms: number;
  readonly bathrooms: number | null;
  readonly area: number;
  readonly parkingSpaces: number;
  readonly description: string | null;
  readonly amenities: readonly string[];
  readonly images: readonly PropertyImage[];
  readonly location: PropertyLocation;
  readonly condominiumFee: number | null;
  readonly propertyTax: number | null;
  readonly featured: boolean;
}
