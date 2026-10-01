import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Subscription, tap, timer } from 'rxjs';

import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';
import { PropertyAvailabilityRepository } from '../ports/property-availability.repository';

export type PropertyAvailabilityStatus =
  'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

@Injectable({
  providedIn: 'root',
})
export class PropertyAvailabilityStore {
  private readonly repository = inject(PropertyAvailabilityRepository);
  private readonly destroyRef = inject(DestroyRef);

  private readonly latestUpdateState = signal<PropertyAvailabilityUpdate | null>(null);
  private readonly statusState = signal<PropertyAvailabilityStatus>('idle');
  private reconnectSubscription: Subscription | null = null;

  readonly latestUpdate = this.latestUpdateState.asReadonly();
  readonly status = this.statusState.asReadonly();

  connect(): void {
    const currentStatus = this.status();

    if (currentStatus === 'connecting' || currentStatus === 'connected') {
      return;
    }

    this.reconnectSubscription?.unsubscribe();
    this.reconnectSubscription = null;
    this.statusState.set('connecting');

    this.repository
      .watch()
      .pipe(
        tap({
          next: (update) => {
            this.latestUpdateState.set(update);
            this.statusState.set('connected');
          },
          complete: () => {
            this.statusState.set('disconnected');
            this.scheduleReconnect();
          },
        }),
        catchError(() => {
          this.statusState.set('error');
          this.scheduleReconnect();

          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private scheduleReconnect(): void {
    this.reconnectSubscription?.unsubscribe();

    this.reconnectSubscription = timer(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.reconnectSubscription = null;
        this.connect();
      });
  }
}
