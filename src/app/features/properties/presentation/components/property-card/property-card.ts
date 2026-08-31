import { Component, computed, input } from '@angular/core';

import type { Property } from '../../../domain/models/property';

@Component({
  selector: 'morada-property-card',
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss',
})
export class PropertyCard {
  readonly property = input.required<Property>();

  protected readonly firstImage = computed(() => this.property().images[0] ?? null);

  protected readonly transactionLabel = computed(() =>
    this.property().transactionType === 'sale' ? 'À venda' : 'Para alugar',
  );

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
}
