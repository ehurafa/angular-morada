import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { PropertySearchFilters } from '../../../domain/models/property-search';

import { PropertySearchForm } from './property-search-form';

const FILTERS: PropertySearchFilters = {
  transactionType: 'sale',
  query: '',
  propertyType: null,
  minimumBedrooms: null,
  maximumPrice: null,
};

describe('PropertySearchForm', () => {
  let fixture: ComponentFixture<PropertySearchForm>;
  let component: PropertySearchForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertySearchForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertySearchForm);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filters', FILTERS);
    fixture.detectChanges();
  });

  it('emits changes to transaction type and query', () => {
    const changes: Partial<PropertySearchFilters>[] = [];

    component.filtersChanged.subscribe((change) => changes.push(change));

    const element = fixture.nativeElement as HTMLElement;

    const transactionButtons = element.querySelectorAll<HTMLButtonElement>('fieldset button');

    transactionButtons[1].click();

    const queryInput = element.querySelector<HTMLInputElement>('#property-location')!;

    queryInput.value = 'Vila Madalena';
    queryInput.dispatchEvent(new Event('input'));

    expect(changes).toEqual([{ transactionType: 'rent' }, { query: 'Vila Madalena' }]);
  });

  it('emits a search request when the form is submitted', () => {
    let searchRequests = 0;

    component.searchRequested.subscribe(() => searchRequests++);

    const element = fixture.nativeElement as HTMLElement;

    const form = element.querySelector<HTMLFormElement>('form')!;
    const submitEvent = new Event('submit', {
      cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBeTrue();
    expect(searchRequests).toBe(1);
  });

  it('emits the optional filters with converted values', () => {
    const changes: Partial<PropertySearchFilters>[] = [];

    component.filtersChanged.subscribe((change) => changes.push(change));

    const element = fixture.nativeElement as HTMLElement;

    const propertyType = element.querySelector<HTMLSelectElement>('#property-type')!;
    const minimumBedrooms = element.querySelector<HTMLSelectElement>('#minimum-bedrooms')!;
    const maximumPrice = element.querySelector<HTMLInputElement>('#maximum-price')!;

    propertyType.value = 'house';
    propertyType.dispatchEvent(new Event('change'));

    minimumBedrooms.value = '3';
    minimumBedrooms.dispatchEvent(new Event('change'));

    maximumPrice.value = '1500000';
    maximumPrice.dispatchEvent(new Event('input'));

    expect(changes).toEqual([
      { propertyType: 'house' },
      { minimumBedrooms: 3 },
      { maximumPrice: 1500000 },
    ]);
  });

  it('emits null when optional filters are cleared', () => {
    const changes: Partial<PropertySearchFilters>[] = [];

    component.filtersChanged.subscribe((change) => changes.push(change));

    const element = fixture.nativeElement as HTMLElement;

    const propertyType = element.querySelector<HTMLSelectElement>('#property-type')!;
    const minimumBedrooms = element.querySelector<HTMLSelectElement>('#minimum-bedrooms')!;
    const maximumPrice = element.querySelector<HTMLInputElement>('#maximum-price')!;

    propertyType.value = '';
    propertyType.dispatchEvent(new Event('change'));

    minimumBedrooms.value = '';
    minimumBedrooms.dispatchEvent(new Event('change'));

    maximumPrice.value = '';
    maximumPrice.dispatchEvent(new Event('input'));

    expect(changes).toEqual([
      { propertyType: null },
      { minimumBedrooms: null },
      { maximumPrice: null },
    ]);
  });
});
