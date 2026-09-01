import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type ContactField = 'name' | 'email' | 'message';

@Component({
  selector: 'morada-property-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './property-contact-form.html',
  styleUrl: './property-contact-form.scss',
})
export class PropertyContactForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly feedback = viewChild<ElementRef<HTMLParagraphElement>>('feedback');

  protected readonly submitted = signal(false);

  protected readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    message: [
      'Olá, gostaria de agendar uma visita.',
      [Validators.required, Validators.maxLength(1000)],
    ],
  });

  protected isInvalid(field: ContactField): boolean {
    const control = this.contactForm.controls[field];

    return control.invalid && (control.touched || control.dirty);
  }

  protected submitContact(): void {
    this.submitted.set(false);

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitted.set(true);

    queueMicrotask(() => {
      this.feedback()?.nativeElement.focus();
    });
  }

  protected resetContact(): void {
    this.contactForm.reset();
    this.submitted.set(false);
  }
}
