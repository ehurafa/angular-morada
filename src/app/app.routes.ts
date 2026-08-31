import { Routes } from '@angular/router';

export const routes: Routes = [
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
