import type { Observable } from 'rxjs';

import type { LocationSuggestion } from '../../domain/models/location-suggestion';
import type {
  PropertySearchFilters,
  PropertySearchResult,
} from '../../domain/models/property-search';

export abstract class PropertySearchRepository {
  abstract search(filters: PropertySearchFilters): Observable<PropertySearchResult>;
  abstract listLocations(): Observable<readonly LocationSuggestion[]>;
}
