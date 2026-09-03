import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import * as L from 'leaflet';

import type { Property } from '../../../domain/models/property';

@Component({
  selector: 'morada-property-map',
  templateUrl: './property-map.html',
  styleUrl: './property-map.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PropertyMap implements AfterViewInit, OnDestroy {
  readonly properties = input.required<readonly Property[]>();
  readonly selectedPropertyId = input<string | null>(null);

  readonly propertySelected = output<string>();

  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private readonly markerLayer = L.layerGroup();

  private map: L.Map | null = null;
  private renderedProperties: readonly Property[] | null = null;

  constructor() {
    effect(() => {
      const properties = this.properties();
      const selectedPropertyId = this.selectedPropertyId();

      this.renderMarkers(properties, selectedPropertyId);
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.container().nativeElement, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([-23.558, -46.675], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);
    this.renderMarkers(this.properties(), this.selectedPropertyId());
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private renderMarkers(properties: readonly Property[], selectedPropertyId: string | null): void {
    if (this.map === null) {
      return;
    }

    const propertiesChanged = properties !== this.renderedProperties;

    this.renderedProperties = properties;
    this.markerLayer.clearLayers();

    properties.forEach((property, index) => {
      const selected = property.id === selectedPropertyId;

      const icon = L.divIcon({
        className: 'morada-marker-shell',
        html: `
          <span class="morada-marker${selected ? ' selected' : ''}">
            <span>${index + 1}</span>
          </span>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([property.location.latitude, property.location.longitude], {
        icon,
        keyboard: true,
        title: property.title,
        zIndexOffset: selected ? 1000 : 0,
      })
        .on('click', () => {
          this.propertySelected.emit(property.id);
        })
        .addTo(this.markerLayer);
    });

    if (!propertiesChanged) {
      return;
    }

    this.fitMapToProperties(properties);
  }

  private fitMapToProperties(properties: readonly Property[]): void {
    if (this.map === null) {
      return;
    }

    if (properties.length === 0) {
      this.map.setView([-23.558, -46.675], 12);
      return;
    }

    const coordinates = properties.map((property) =>
      L.latLng(property.location.latitude, property.location.longitude),
    );

    if (coordinates.length === 1) {
      this.map.setView(coordinates[0], 14);
      return;
    }

    this.map.fitBounds(L.latLngBounds(coordinates).pad(0.25), {
      animate: false,
      maxZoom: 14,
    });
  }
}
