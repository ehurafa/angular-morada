import { Component, inject, OnInit } from '@angular/core';

import { PropertySearchForm } from '../../components/property-search-form/property-search-form';
import { PropertySearchStore } from '../../../application/state/property-search.store';
import { PropertyCard } from '../../components/property-card/property-card';

@Component({
  selector: 'morada-property-search-page',
  imports: [PropertySearchForm, PropertyCard],
  providers: [PropertySearchStore],
  templateUrl: './property-search-page.html',
  styleUrl: './property-search-page.scss',
})
export class PropertySearchPage implements OnInit {
  protected readonly store = inject(PropertySearchStore);

  ngOnInit(): void {
    this.store.search();
  }
}
