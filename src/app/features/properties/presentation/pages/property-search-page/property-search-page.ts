import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  createPropertySearchQueryParams,
  readPropertySearchFilters,
} from './property-search-query-params';

import { PropertyMap } from '../../components/property-map/property-map';
import type { TransactionType } from '../../../domain/models/property';
import { PropertySearchStore } from '../../../application/state/property-search.store';
import { PropertyCard } from '../../components/property-card/property-card';
import { PropertySearchForm } from '../../components/property-search-form/property-search-form';
import { SiteHeader } from '../../../../../shared/components/site-header/site-header';
import { PropertyMapPreview } from '../../components/property-map-preview/property-map-preview';

@Component({
  selector: 'morada-property-search-page',
  imports: [PropertyMapPreview, PropertyMap, PropertyCard, PropertySearchForm, SiteHeader],
  providers: [PropertySearchStore],
  templateUrl: './property-search-page.html',
  styleUrl: './property-search-page.scss',
})
export class PropertySearchPage implements OnInit {
  protected readonly store = inject(PropertySearchStore);
  protected readonly demoNotice = signal<string | null>(null);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly activeView = signal<'list' | 'map'>('list');
  protected readonly selectedPropertyId = signal<string | null>(null);

  protected readonly selectedProperty = computed(() => {
    const selectedPropertyId = this.selectedPropertyId();

    if (selectedPropertyId === null) {
      return null;
    }

    return this.store.properties().find((property) => property.id === selectedPropertyId) ?? null;
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.store.updateFilters(readPropertySearchFilters(params));
      this.store.search();
    });
  }

  protected search(): void {
    const filters = this.store.filters();
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: createPropertySearchQueryParams(filters),
      preserveFragment: true,
    });

    if (this.router.serializeUrl(urlTree) === this.router.url) {
      this.store.updateFilters({ query: filters.query.trim() });
      this.store.search();
      return;
    }

    void this.router.navigateByUrl(urlTree);
  }

  protected selectTransactionType(transactionType: TransactionType): void {
    this.store.updateFilters({ transactionType });
    this.search();
  }

  protected showDemoFeature(feature: string): void {
    this.demoNotice.set(`${feature} fará parte de uma próxima etapa demonstrativa da Morada.`);
  }

  protected openPropertyDetails(propertyId: string): void {
    void this.router.navigate(['/imoveis', propertyId], {
      queryParamsHandling: 'preserve',
    });
  }

  protected showMap(): void {
    const selectedProperty = this.selectedProperty() ?? this.store.properties()[0] ?? null;

    if (selectedProperty !== null) {
      this.selectedPropertyId.set(selectedProperty.id);
    }

    this.activeView.set('map');
  }

  protected showPropertyOnMap(propertyId: string): void {
    this.selectedPropertyId.set(propertyId);
    this.activeView.set('map');
  }

  protected selectProperty(propertyId: string): void {
    this.selectedPropertyId.set(propertyId);
  }
}
