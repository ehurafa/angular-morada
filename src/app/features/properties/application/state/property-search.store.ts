import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap, tap } from 'rxjs';

import { PropertySearchRepository } from '../ports/property-search.repository';
import type { Property } from '../../domain/models/property';
import type { PropertySearchFilters, SearchMatchType } from '../../domain/models/property-search';

export type PropertySearchError = 'search-failed';

const INITIAL_FILTERS: PropertySearchFilters = {
  transactionType: 'sale',
  query: '',
  propertyType: null,
  minimumBedrooms: null,
  maximumPrice: null,
};

@Injectable()
export class PropertySearchStore {
  private readonly repository = inject(PropertySearchRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchRequests = new Subject<PropertySearchFilters>();

  private readonly filtersState = signal<PropertySearchFilters>(INITIAL_FILTERS);
  private readonly propertiesState = signal<readonly Property[]>([]);
  private readonly matchTypeState = signal<SearchMatchType>('all');
  private readonly normalizedQueryState = signal('');
  private readonly loadingState = signal(false);
  private readonly errorState = signal<PropertySearchError | null>(null);

  readonly filters = this.filtersState.asReadonly();
  readonly properties = this.propertiesState.asReadonly();
  readonly matchType = this.matchTypeState.asReadonly();
  readonly normalizedQuery = this.normalizedQueryState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  readonly hasResults = computed(() => this.properties().length > 0);

  constructor() {
    this.searchRequests
      .pipe(
        switchMap((filters) => {
          this.loadingState.set(true);
          this.errorState.set(null);

          return this.repository.search(filters).pipe(
            tap((result) => {
              this.propertiesState.set(result.properties);
              this.matchTypeState.set(result.matchType);
              this.normalizedQueryState.set(result.normalizedQuery);
            }),
            catchError(() => {
              this.errorState.set('search-failed');

              return EMPTY;
            }),
            finalize(() => this.loadingState.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  updateFilters(patch: Partial<PropertySearchFilters>): void {
    this.filtersState.update((current) => ({ ...current, ...patch }));
  }

  resetFilters(): void {
    this.filtersState.set(INITIAL_FILTERS);
  }

  search(): void {
    this.searchRequests.next(this.filters());
  }
}
