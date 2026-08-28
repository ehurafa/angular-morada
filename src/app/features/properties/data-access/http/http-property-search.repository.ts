import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { PropertySearchRepository } from '../../application/ports/property-search.repository';
import type { PropertyType, TransactionType } from '../../domain/models/property';
import type {
  PropertySearchFilters,
  PropertySearchResult,
} from '../../domain/models/property-search';
import type {
  ApiPropertyType,
  ApiTransactionType,
  PropertySearchResponseDto,
} from './dtos/property-search-response.dto';
import { mapPropertySearchResponseDto } from './mappers/property.mapper';

const API_TRANSACTION_TYPE_MAP = {
  sale: 'comprar',
  rent: 'alugar',
} as const satisfies Record<TransactionType, ApiTransactionType>;

const API_PROPERTY_TYPE_MAP = {
  apartment: 'apartamento',
  house: 'casa',
  studio: 'studio',
  penthouse: 'cobertura',
} as const satisfies Record<PropertyType, ApiPropertyType>;

@Injectable()
export class HttpPropertySearchRepository extends PropertySearchRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly propertiesUrl = `${this.apiBaseUrl}/properties`;

  override search(filters: PropertySearchFilters): Observable<PropertySearchResult> {
    return this.http
      .get<PropertySearchResponseDto>(this.propertiesUrl, {
        params: this.buildParams(filters),
      })
      .pipe(map(mapPropertySearchResponseDto));
  }

  private buildParams(filters: PropertySearchFilters): HttpParams {
    let params = new HttpParams()
      .set('businessType', API_TRANSACTION_TYPE_MAP[filters.transactionType])
      .set('query', filters.query.trim());

    if (filters.propertyType !== null) {
      params = params.set('propertyType', API_PROPERTY_TYPE_MAP[filters.propertyType]);
    }

    if (filters.minimumBedrooms !== null) {
      params = params.set('bedrooms', filters.minimumBedrooms);
    }

    if (filters.maximumPrice !== null) {
      params = params.set('maxPrice', filters.maximumPrice);
    }

    return params;
  }
}
