import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type SiteHeaderTransactionType = 'sale' | 'rent';

@Component({
  selector: 'morada-site-header',
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  readonly statusMessage = input<string | null>(null);
  readonly transactionTypeRequested = output<SiteHeaderTransactionType>();
  readonly featureRequested = output<string>();

  protected requestTransactionType(transactionType: SiteHeaderTransactionType): void {
    this.transactionTypeRequested.emit(transactionType);
  }

  protected requestFeature(feature: string): void {
    this.featureRequested.emit(feature);
  }
}
