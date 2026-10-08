import type { Property, PropertyType, TransactionType } from './property';

export type SearchMatchType = 'exact' | 'nearby' | 'all';
export type SearchSort = 'relevance' | 'price-asc' | 'price-desc';

export interface PropertySearchFilters {
  readonly transactionType: TransactionType;
  readonly query: string;
  readonly propertyType: PropertyType | null;
  readonly minimumBedrooms: number | null;
  readonly maximumPrice: number | null;
  readonly sort?: SearchSort;
}

export interface PropertySearchResult {
  readonly properties: readonly Property[];
  readonly matchType: SearchMatchType;
  readonly normalizedQuery: string;
}
