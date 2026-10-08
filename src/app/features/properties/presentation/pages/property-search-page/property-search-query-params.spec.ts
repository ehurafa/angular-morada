import { convertToParamMap } from '@angular/router';

import {
  createPropertySearchQueryParams,
  readPropertySearchFilters,
} from './property-search-query-params';

describe('readPropertySearchFilters', () => {
  it('restores valid search filters from the URL', () => {
    const params = convertToParamMap({
      transactionType: 'rent',
      query: 'Pinheiros',
      propertyType: 'apartment',
      minimumBedrooms: '2',
      maximumPrice: '5000',
    });

    expect(readPropertySearchFilters(params)).toEqual({
      transactionType: 'rent',
      query: 'Pinheiros',
      propertyType: 'apartment',
      minimumBedrooms: 2,
      maximumPrice: 5000,
      sort: 'relevance',
    });
  });

  it('ignores invalid values and uses the default filters', () => {
    const params = convertToParamMap({
      transactionType: 'lease',
      propertyType: 'building',
      minimumBedrooms: '-1',
      maximumPrice: '1.5',
    });

    expect(readPropertySearchFilters(params)).toEqual({
      transactionType: 'sale',
      query: '',
      propertyType: null,
      minimumBedrooms: null,
      maximumPrice: null,
      sort: 'relevance',
    });
  });

  it('restores price sorting and defaults an invalid value to relevance', () => {
    const selected = readPropertySearchFilters(convertToParamMap({ sort: 'price-desc' }));
    const invalid = readPropertySearchFilters(convertToParamMap({ sort: 'unknown' }));

    expect(selected.sort).toBe('price-desc');
    expect(invalid.sort).toBe('relevance');
    expect(createPropertySearchQueryParams(selected)).toEqual({ sort: 'price-desc' });
  });
});

describe('createPropertySearchQueryParams', () => {
  it('creates URL parameters from all search filters', () => {
    const params = createPropertySearchQueryParams({
      transactionType: 'rent',
      query: '  Pinheiros  ',
      propertyType: 'apartment',
      minimumBedrooms: 2,
      maximumPrice: 5000,
    });

    expect(params).toEqual({
      transactionType: 'rent',
      query: 'Pinheiros',
      propertyType: 'apartment',
      minimumBedrooms: 2,
      maximumPrice: 5000,
    });
  });

  it('omits default and empty filters from the URL', () => {
    const params = createPropertySearchQueryParams({
      transactionType: 'sale',
      query: '   ',
      propertyType: null,
      minimumBedrooms: null,
      maximumPrice: null,
    });

    expect(params).toEqual({});
  });

  it('preserves a maximum price of zero in the URL', () => {
    const params = createPropertySearchQueryParams({
      transactionType: 'sale',
      query: '',
      propertyType: null,
      minimumBedrooms: null,
      maximumPrice: 0,
    });

    expect(params).toEqual({ maximumPrice: 0 });
    expect(readPropertySearchFilters(convertToParamMap(params)).maximumPrice).toBe(0);
  });
});
