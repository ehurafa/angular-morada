import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'imoveis/:id',
    loadComponent: () =>
      import('./features/properties/presentation/pages/property-details-page/property-details-page').then(
        ({ PropertyDetailsPage }) => PropertyDetailsPage,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/properties/presentation/pages/property-search-page/property-search-page').then(
        ({ PropertySearchPage }) => PropertySearchPage,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
