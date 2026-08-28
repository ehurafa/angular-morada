import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { getSingleSpaExtraProviders, singleSpaAngular } from 'single-spa-angular';

import { App } from './app/app';
import { createAppConfig } from './app/app.config';
import { singleSpaPropsSubject, type MoradaCustomProps } from './single-spa/single-spa-props';

const lifecycles = singleSpaAngular<MoradaCustomProps>({
  bootstrapFunction: (singleSpaProps) => {
    const apiBaseUrl = singleSpaProps.apiBaseUrl?.trim();

    if (!apiBaseUrl) {
      throw new Error('Morada requires the "apiBaseUrl" single-spa prop.');
    }

    singleSpaPropsSubject.next(singleSpaProps);

    const platformRef = platformBrowser(getSingleSpaExtraProviders());

    return bootstrapApplication(App, createAppConfig(apiBaseUrl), {
      platformRef,
    });
  },
  template: '<morada-root />',
  Router,
  NavigationStart,
  NgZone: 'noop',
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
