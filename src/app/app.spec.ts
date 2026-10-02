import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { PropertyAvailabilityStore } from './features/properties/application/state/property-availability.store';
import type { PropertyAvailabilityUpdate } from './features/properties/domain/models/property-availability';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let element: HTMLElement;

  const latestUpdate = signal<PropertyAvailabilityUpdate | null>(null);
  const connect = jasmine.createSpy('connect');

  beforeEach(async () => {
    latestUpdate.set(null);
    connect.calls.reset();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: PropertyAvailabilityStore,
          useValue: {
            latestUpdate: latestUpdate.asReadonly(),
            connect,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    element = fixture.nativeElement as HTMLElement;
  });

  it('should create the app shell', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet', () => {
    fixture.detectChanges();

    expect(element.querySelector('router-outlet')).not.toBeNull();
  });

  it('should connect to availability updates once on initialization', () => {
    fixture.detectChanges();
    fixture.detectChanges();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('should hide the notice before receiving an update', () => {
    fixture.detectChanges();

    expect(element.querySelector('morada-property-availability-notice')).toBeNull();
  });

  it('should move focus to the main content when the skip link is activated', () => {
    fixture.detectChanges();

    const main = document.createElement('main');
    main.tabIndex = -1;
    element.appendChild(main);

    const scrollIntoView = spyOn(main, 'scrollIntoView');
    const link = element.querySelector<HTMLAnchorElement>('.skip-link');

    expect(link).not.toBeNull();

    if (link === null) {
      return;
    }

    link.focus();
    expect(document.activeElement).toBe(link);

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(event);

    expect(document.activeElement).toBe(main);
    expect(event.defaultPrevented).toBeTrue();
    expect(scrollIntoView).toHaveBeenCalledOnceWith({ block: 'start' });
  });

  it('should display the notice when an update arrives', () => {
    fixture.detectChanges();

    latestUpdate.set({
      propertyId: 'property-1',
      propertyTitle: 'Apartamento com varanda',
      available: false,
      occurredAt: new Date('2026-09-08T12:00:00Z'),
      demonstration: true,
    });

    fixture.detectChanges();

    const notice = element.querySelector('morada-property-availability-notice');

    expect(notice).not.toBeNull();
    expect(notice?.textContent).toContain('property-1');
    expect(notice?.textContent).toContain('não está mais disponível.');
    expect(notice?.textContent).toContain('Atualização demonstrativa:');
  });

  it('should hide a dismissed notice and show the next update', () => {
    fixture.detectChanges();

    const main = document.createElement('main');
    main.tabIndex = -1;
    element.appendChild(main);

    const firstUpdate: PropertyAvailabilityUpdate = {
      propertyId: 'property-1',
      propertyTitle: 'Apartamento com varanda',
      available: true,
      occurredAt: new Date('2026-09-08T12:00:00Z'),
      demonstration: true,
    };

    latestUpdate.set(firstUpdate);
    fixture.detectChanges();

    const dismissButton = element.querySelector<HTMLButtonElement>(
      'morada-property-availability-notice button',
    );

    expect(dismissButton?.getAttribute('aria-label')).toBe('Dispensar aviso de disponibilidade');

    dismissButton?.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(main);
    expect(element.querySelector('morada-property-availability-notice')).toBeNull();
    expect(latestUpdate()).toBe(firstUpdate);

    latestUpdate.set({
      ...firstUpdate,
      propertyId: 'property-2',
      propertyTitle: 'Studio mobiliado',
    });
    fixture.detectChanges();

    const nextNotice = element.querySelector('morada-property-availability-notice');

    expect(nextNotice?.textContent).toContain('property-2');
  });
});
