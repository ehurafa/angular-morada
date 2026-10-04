import type { ParamMap, Params } from '@angular/router';

import type { PropertyType } from '../../../domain/models/property';
import type { PropertySearchFilters } from '../../../domain/models/property-search';

function readPropertyType(value: string | null): PropertyType | null {
  if (value === 'apartment' || value === 'house' || value === 'studio' || value === 'penthouse') {
    return value;
  }

  return null;
}

function readOptionalInteger(value: string | null, minimum: number): number | null {
  if (value === null || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number >= minimum ? number : null;
}

export function readPropertySearchFilters(params: ParamMap): PropertySearchFilters {
  return {
    transactionType: params.get('transactionType') === 'rent' ? 'rent' : 'sale',
    query: params.get('query') ?? '',
    propertyType: readPropertyType(params.get('propertyType')),
    minimumBedrooms: readOptionalInteger(params.get('minimumBedrooms'), 1),
    maximumPrice: readOptionalInteger(params.get('maximumPrice'), 0),
  };
}

export function createPropertySearchQueryParams(filters: PropertySearchFilters): Params {
  const params: Params = {};
  const query = filters.query.trim();

  if (filters.transactionType !== 'sale') {
    params['transactionType'] = filters.transactionType;
  }

  if (query !== '') {
    params['query'] = query;
  }

  if (filters.propertyType !== null) {
    params['propertyType'] = filters.propertyType;
  }

  if (filters.minimumBedrooms !== null) {
    params['minimumBedrooms'] = filters.minimumBedrooms;
  }

  if (filters.maximumPrice !== null) {
    params['maximumPrice'] = filters.maximumPrice;
  }

  return params;
}
