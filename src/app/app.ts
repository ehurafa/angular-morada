import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PropertyAvailabilityStore } from './features/properties/application/state/property-availability.store';
import { PropertyAvailabilityNotice } from './features/properties/presentation/components/property-availability-notice/property-availability-notice';

@Component({
  selector: 'morada-root',
  imports: [RouterOutlet, PropertyAvailabilityNotice],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly availabilityStore = inject(PropertyAvailabilityStore);

  ngOnInit(): void {
    this.availabilityStore.connect();
  }

  protected skipToContent(event: MouseEvent): void {
    event.preventDefault();

    const main = this.host.nativeElement.querySelector<HTMLElement>('main');

    main?.focus();
    main?.scrollIntoView({ block: 'start' });
  }
}
