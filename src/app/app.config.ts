import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from './core/config/api-base-url.token';
import { PropertySearchRepository } from './features/properties/application/ports/property-search.repository';
import { HttpPropertySearchRepository } from './features/properties/data-access/http/http-property-search.repository';
import { routes } from './app.routes';

export function createAppConfig(apiBaseUrl: string): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideHttpClient(),
      provideRouter(routes),
      {
        provide: API_BASE_URL,
        useValue: apiBaseUrl,
      },
      {
        provide: PropertySearchRepository,
        useClass: HttpPropertySearchRepository,
      },
    ],
  };
}
