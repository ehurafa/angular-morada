import { Component, computed, input, output } from '@angular/core';

import type { Property } from '../../../domain/models/property';

@Component({
  selector: 'morada-property-card',
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss',
})
export class PropertyCard {
  readonly property = input.required<Property>();
  readonly isFavorite = input(false);

  readonly detailsRequested = output<string>();
  readonly mapRequested = output<string>();
  readonly favoriteToggled = output<string>();

  protected readonly firstImage = computed(() => this.property().images[0] ?? null);

  protected readonly formattedPrice = computed(() =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(this.property().price),
  );

  protected readonly priceSuffix = computed(() =>
    this.property().transactionType === 'rent' ? '/mês' : '',
  );

  protected requestFavoriteToggle(): void {
    this.favoriteToggled.emit(this.property().id);
  }

  protected requestDetails(): void {
    this.detailsRequested.emit(this.property().id);
  }

  protected requestMap(): void {
    this.mapRequested.emit(this.property().id);
  }
}
