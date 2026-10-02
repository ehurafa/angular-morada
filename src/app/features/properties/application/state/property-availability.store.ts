import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Subscription, tap, timer } from 'rxjs';

import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';
import { PropertyAvailabilityRepository } from '../ports/property-availability.repository';

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;

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
  private reconnectAttempts = 0;

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
            this.reconnectAttempts = 0;
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

    const delayMs = Math.min(
      INITIAL_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempts,
      MAX_RECONNECT_DELAY_MS,
    );

    this.reconnectAttempts = Math.min(this.reconnectAttempts + 1, 5);

    this.reconnectSubscription = timer(delayMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.reconnectSubscription = null;
        this.connect();
      });
  }
}
