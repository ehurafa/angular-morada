import type { Observable } from 'rxjs';

import type { Property } from '../../domain/models/property';

export abstract class PropertyDetailsRepository {
  abstract findById(id: string): Observable<Property>;
}
