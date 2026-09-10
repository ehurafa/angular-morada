import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { PropertyAvailabilityUpdate } from '../../../domain/models/property-availability';
import { PropertyAvailabilityNotice } from './property-availability-notice';

describe('PropertyAvailabilityNotice', () => {
  let fixture: ComponentFixture<PropertyAvailabilityNotice>;
  let element: HTMLElement;

  const update: PropertyAvailabilityUpdate = {
    propertyId: 'property-1',
    available: true,
    occurredAt: new Date('2026-09-08T12:00:00Z'),
    demonstration: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyAvailabilityNotice],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyAvailabilityNotice);
    element = fixture.nativeElement as HTMLElement;
  });

  function renderUpdate(overrides: Partial<PropertyAvailabilityUpdate> = {}): void {
    fixture.componentRef.setInput('update', { ...update, ...overrides });
    fixture.detectChanges();
  }

  it('should display an available property', () => {
    renderUpdate();

    expect(element.textContent).toContain('property-1');
    expect(element.textContent).toContain('está disponível.');
    expect(element.querySelector('.availability-notice--unavailable')).toBeNull();
  });

  it('should display an unavailable property', () => {
    renderUpdate({ available: false });

    expect(element.textContent).toContain('não está mais disponível.');
    expect(element.querySelector('.availability-notice--unavailable')).not.toBeNull();
  });

  it('should identify demonstration updates', () => {
    renderUpdate();

    expect(element.textContent).toContain('Atualização demonstrativa:');
  });

  it('should label non-demonstration updates', () => {
    renderUpdate({ demonstration: false });

    expect(element.textContent).toContain('Atualização de disponibilidade:');
    expect(element.textContent).not.toContain('Atualização demonstrativa:');
  });

  it('should expose a polite status announcement', () => {
    renderUpdate();

    const notice = element.querySelector('[role="status"]');

    expect(notice).not.toBeNull();
    expect(notice?.getAttribute('aria-live')).toBe('polite');
    expect(notice?.getAttribute('aria-atomic')).toBe('true');
  });

  it('should reflect changes to the input', () => {
    renderUpdate();
    renderUpdate({ available: false });

    expect(element.textContent).toContain('não está mais disponível.');
    expect(element.querySelector('.availability-notice--unavailable')).not.toBeNull();
  });
});
