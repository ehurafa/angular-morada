import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyContactForm } from './property-contact-form';

describe('PropertyContactForm', () => {
  let fixture: ComponentFixture<PropertyContactForm>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyContactForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyContactForm);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function fillField(selector: string, value: string): void {
    const field = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);

    if (field === null) {
      throw new Error(`Campo não encontrado: ${selector}`);
    }

    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function submitForm(): void {
    const submitButton = element.querySelector<HTMLButtonElement>('.primary-action');

    submitButton?.click();
    fixture.detectChanges();
  }

  function normalizedContent(): string {
    return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  it('starts with the default visit message', () => {
    const message = element.querySelector<HTMLTextAreaElement>('#contact-message');

    expect(message?.value).toBe('Olá, gostaria de agendar uma visita.');
  });

  it('shows errors when required fields are absent', () => {
    submitForm();

    const name = element.querySelector<HTMLInputElement>('#contact-name');
    const email = element.querySelector<HTMLInputElement>('#contact-email');

    expect(name?.getAttribute('aria-invalid')).toBe('true');
    expect(email?.getAttribute('aria-invalid')).toBe('true');
    expect(normalizedContent()).toContain('Informe seu nome.');
    expect(normalizedContent()).toContain('Informe seu e-mail.');
    expect(element.querySelectorAll('.field-error').length).toBe(2);
  });

  it('shows a specific error for an invalid email', () => {
    fillField('#contact-name', 'Rafael');
    fillField('#contact-email', 'email-invalido');

    submitForm();

    expect(normalizedContent()).toContain('Digite um e-mail válido.');
    expect(normalizedContent()).not.toContain('Informe seu nome.');
  });

  it('shows local feedback after a valid submission', async () => {
    fillField('#contact-name', 'Rafael');
    fillField('#contact-email', 'rafael@example.com');

    submitForm();

    await fixture.whenStable();
    fixture.detectChanges();

    const feedback = element.querySelector<HTMLElement>('.success-message');

    expect(feedback).not.toBeNull();
    expect(normalizedContent()).toContain('Nenhuma mensagem foi enviada.');
    expect(element.querySelector('form')).toBeNull();
    expect(document.activeElement).toBe(feedback);
  });

  it('allows the form to be filled again', () => {
    fillField('#contact-name', 'Rafael');
    fillField('#contact-email', 'rafael@example.com');

    submitForm();

    const resetButton = element.querySelector<HTMLButtonElement>('.secondary-action');

    resetButton?.click();
    fixture.detectChanges();

    const name = element.querySelector<HTMLInputElement>('#contact-name');
    const email = element.querySelector<HTMLInputElement>('#contact-email');
    const message = element.querySelector<HTMLTextAreaElement>('#contact-message');

    expect(name?.value).toBe('');
    expect(email?.value).toBe('');
    expect(message?.value).toBe('Olá, gostaria de agendar uma visita.');
    expect(element.querySelector('form')).not.toBeNull();
  });
});
