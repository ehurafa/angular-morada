import { Component, input } from '@angular/core';

import type { PropertyAvailabilityUpdate } from '../../../domain/models/property-availability';

@Component({
  selector: 'morada-property-availability-notice',
  templateUrl: './property-availability-notice.html',
  styleUrl: './property-availability-notice.scss',
})
export class PropertyAvailabilityNotice {
  readonly update = input.required<PropertyAvailabilityUpdate>();
}
