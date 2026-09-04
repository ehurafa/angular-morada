import { Component, computed, input, output } from '@angular/core';

import type { Property } from '../../../domain/models/property';

@Component({
  selector: 'morada-property-map-preview',
  templateUrl: './property-map-preview.html',
  styleUrl: './property-map-preview.scss',
})
export class PropertyMapPreview {
  readonly property = input.required<Property>();

  readonly detailsRequested = output<string>();

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

  protected requestDetails(): void {
    this.detailsRequested.emit(this.property().id);
  }
}
