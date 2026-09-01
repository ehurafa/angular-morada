import { Component, computed, input } from '@angular/core';

import type { Property } from '../../../domain/models/property';

@Component({
  selector: 'morada-property-details-content',
  templateUrl: './property-details-content.html',
  styleUrl: './property-details-content.scss',
})
export class PropertyDetailsContent {
  readonly property = input.required<Property>();

  protected readonly monthlyEstimate = computed(() => {
    const property = this.property();

    if (property.transactionType === 'rent') {
      return null;
    }

    const financedAmount = property.price * 0.8;
    const monthlyRate = 0.009;
    const months = 360;
    const rateFactor = Math.pow(1 + monthlyRate, months);

    return (financedAmount * monthlyRate * rateFactor) / (rateFactor - 1);
  });

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
