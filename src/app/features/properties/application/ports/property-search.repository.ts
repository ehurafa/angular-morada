import type { Observable } from 'rxjs';

import type {
  PropertySearchFilters,
  PropertySearchResult,
} from '../../domain/models/property-search';

export abstract class PropertySearchRepository {
  abstract search(filters: PropertySearchFilters): Observable<PropertySearchResult>;
}
