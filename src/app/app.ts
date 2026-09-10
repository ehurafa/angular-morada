import { Component, inject, OnInit } from '@angular/core';
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
  protected readonly availabilityStore = inject(PropertyAvailabilityStore);

  ngOnInit(): void {
    this.availabilityStore.connect();
  }
}
