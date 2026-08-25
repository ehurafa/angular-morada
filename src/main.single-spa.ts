import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { getSingleSpaExtraProviders, singleSpaAngular } from 'single-spa-angular';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';

const lifecycles = singleSpaAngular({
  bootstrapFunction: (singleSpaProps) => {
    singleSpaPropsSubject.next(singleSpaProps);

    const platformRef = platformBrowser(getSingleSpaExtraProviders());

    return bootstrapApplication(App, appConfig, { platformRef });
  },
  template: '<morada-root />',
  Router,
  NavigationStart,
  NgZone: 'noop',
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
