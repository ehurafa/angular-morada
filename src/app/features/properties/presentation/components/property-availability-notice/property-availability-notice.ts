import { Component, ElementRef, inject, input, output } from '@angular/core';

import type { PropertyAvailabilityUpdate } from '../../../domain/models/property-availability';

@Component({
  selector: 'morada-property-availability-notice',
  templateUrl: './property-availability-notice.html',
  styleUrl: './property-availability-notice.scss',
})
export class PropertyAvailabilityNotice {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly update = input.required<PropertyAvailabilityUpdate>();
  readonly dismissed = output<void>();

  protected dismiss(event: MouseEvent): void {
    if (event.detail === 0) {
      this.host.nativeElement.ownerDocument.querySelector<HTMLElement>('main')?.focus();
    }

    this.dismissed.emit();
  }
}
