import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { PropertyDetailsRepository } from '../../application/ports/property-details.repository';
import type { Property } from '../../domain/models/property';
import type { PropertyDto } from './dtos/property-search-response.dto';
import { mapPropertyDto } from './mappers/property.mapper';

@Injectable()
export class HttpPropertyDetailsRepository extends PropertyDetailsRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly propertiesUrl = `${this.apiBaseUrl}/properties`;

  override findById(id: string): Observable<Property> {
    const propertyUrl = `${this.propertiesUrl}/${encodeURIComponent(id)}`;

    return this.http.get<PropertyDto>(propertyUrl).pipe(map(mapPropertyDto));
  }
}
