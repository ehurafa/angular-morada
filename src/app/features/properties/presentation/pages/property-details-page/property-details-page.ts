import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { TransactionType } from '../../../domain/models/property';
import { SiteHeader } from '../../../../../shared/components/site-header/site-header';
import { PropertyDetailsContent } from '../../components/property-details-content/property-details-content';
import { PropertyContactForm } from '../../components/property-contact-form/property-contact-form';

import { PropertyDetailsStore } from '../../../application/state/property-details.store';

@Component({
  selector: 'morada-property-details-page',
  imports: [PropertyContactForm, PropertyDetailsContent, RouterLink, SiteHeader],
  providers: [PropertyDetailsStore],
  templateUrl: './property-details-page.html',
  styleUrl: './property-details-page.scss',
})
export class PropertyDetailsPage implements OnInit {
  protected readonly store = inject(PropertyDetailsStore);

  protected readonly selectedImageIndex = signal(0);

  protected readonly galleryImages = computed(() => this.store.property()?.images ?? []);

  protected readonly activeImage = computed(
    () => this.galleryImages()[this.selectedImageIndex()] ?? null,
  );

  protected readonly demoNotice = signal<string | null>(null);

  protected readonly formattedPrice = computed(() => {
    const property = this.store.property();

    if (property === null) {
      return '';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(property.price);
  });

  private readonly propertyId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadProperty();
  }

  protected retryLoad(): void {
    this.loadProperty();
  }

  protected showDemoFeature(feature: string): void {
    this.demoNotice.set(`${feature} fará parte de uma próxima etapa demonstrativa da Morada.`);
  }

  protected openSearch(transactionType: TransactionType): void {
    void this.router.navigate(['/'], {
      queryParams: {
        transactionType,
      },
    });
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected moveGallery(direction: -1 | 1): void {
    const totalImages = this.galleryImages().length;

    if (totalImages === 0) {
      return;
    }

    this.selectedImageIndex.update(
      (currentIndex) => (currentIndex + direction + totalImages) % totalImages,
    );
  }

  private loadProperty(): void {
    if (this.propertyId !== null) {
      this.store.load(this.propertyId);
    }
  }
}
