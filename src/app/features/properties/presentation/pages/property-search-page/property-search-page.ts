import { Component, inject, OnInit, signal } from '@angular/core';

import type { TransactionType } from '../../../domain/models/property';
import { PropertySearchStore } from '../../../application/state/property-search.store';
import { PropertyCard } from '../../components/property-card/property-card';
import { PropertySearchForm } from '../../components/property-search-form/property-search-form';

@Component({
  selector: 'morada-property-search-page',
  imports: [PropertyCard, PropertySearchForm],
  providers: [PropertySearchStore],
  templateUrl: './property-search-page.html',
  styleUrl: './property-search-page.scss',
})
export class PropertySearchPage implements OnInit {
  protected readonly store = inject(PropertySearchStore);
  protected readonly demoNotice = signal<string | null>(null);

  ngOnInit(): void {
    this.store.search();
  }

  protected selectTransactionType(transactionType: TransactionType): void {
    this.store.updateFilters({ transactionType });
    this.store.search();
  }

  protected showDemoFeature(feature: string): void {
    this.demoNotice.set(`${feature} fará parte de uma próxima etapa demonstrativa da Morada.`);
  }
}
