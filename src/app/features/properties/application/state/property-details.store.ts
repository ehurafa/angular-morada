import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap, tap } from 'rxjs';

import type { Property } from '../../domain/models/property';
import { PropertyDetailsRepository } from '../ports/property-details.repository';

export type PropertyDetailsError = 'load-failed';

@Injectable()
export class PropertyDetailsStore {
  private readonly repository = inject(PropertyDetailsRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequests = new Subject<string>();

  private readonly propertyState = signal<Property | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<PropertyDetailsError | null>(null);

  readonly property = this.propertyState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  constructor() {
    this.loadRequests
      .pipe(
        switchMap((id) => {
          this.propertyState.set(null);
          this.loadingState.set(true);
          this.errorState.set(null);

          return this.repository.findById(id).pipe(
            tap((property) => this.propertyState.set(property)),
            catchError(() => {
              this.errorState.set('load-failed');

              return EMPTY;
            }),
            finalize(() => this.loadingState.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  load(id: string): void {
    this.loadRequests.next(id);
  }
}
