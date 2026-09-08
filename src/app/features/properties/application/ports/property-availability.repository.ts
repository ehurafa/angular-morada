import type { Observable } from 'rxjs';

import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';

export abstract class PropertyAvailabilityRepository {
  abstract watch(): Observable<PropertyAvailabilityUpdate>;
}
