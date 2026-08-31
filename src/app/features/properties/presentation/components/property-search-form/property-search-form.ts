import { Component, input, output } from '@angular/core';

import type { PropertyType, TransactionType } from '../../../domain/models/property';
import type { PropertySearchFilters } from '../../../domain/models/property-search';

@Component({
  selector: 'morada-property-search-form',
  templateUrl: './property-search-form.html',
  styleUrl: './property-search-form.scss',
})
export class PropertySearchForm {
  readonly filters = input.required<PropertySearchFilters>();

  readonly filtersChanged = output<Partial<PropertySearchFilters>>();
  readonly searchRequested = output<void>();

  protected selectTransactionType(transactionType: TransactionType): void {
    this.filtersChanged.emit({ transactionType });
  }

  protected updateQuery(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.filtersChanged.emit({
      query: input.value,
    });
  }

  protected updatePropertyType(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as PropertyType | '';

    this.filtersChanged.emit({
      propertyType: value || null,
    });
  }

  protected updateMinimumBedrooms(event: Event): void {
    this.filtersChanged.emit({
      minimumBedrooms: this.readOptionalNumber(event),
    });
  }

  protected updateMaximumPrice(event: Event): void {
    this.filtersChanged.emit({
      maximumPrice: this.readOptionalNumber(event),
    });
  }

  protected submitSearch(event: Event): void {
    event.preventDefault();
    this.searchRequested.emit();
  }

  private readOptionalNumber(event: Event): number | null {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;

    if (value === '') {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }
}
