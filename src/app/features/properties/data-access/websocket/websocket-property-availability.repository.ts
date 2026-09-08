import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { WEBSOCKET_FACTORY } from '../../../../core/realtime/websocket-factory.token';
import { PropertyAvailabilityRepository } from '../../application/ports/property-availability.repository';
import type { PropertyAvailabilityUpdate } from '../../domain/models/property-availability';
import { buildPropertyAvailabilityUrl } from './build-property-availability-url';
import { mapPropertyAvailabilityEventDto } from './mappers/property-availability.mapper';

@Injectable()
export class WebSocketPropertyAvailabilityRepository extends PropertyAvailabilityRepository {
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly document = inject(DOCUMENT);
  private readonly createWebSocket = inject(WEBSOCKET_FACTORY);

  override watch(): Observable<PropertyAvailabilityUpdate> {
    return new Observable((subscriber) => {
      const url = buildPropertyAvailabilityUrl(this.apiBaseUrl, this.document.location.origin);

      const socket = this.createWebSocket(url);

      const handleMessage = (event: MessageEvent<unknown>) => {
        if (typeof event.data !== 'string') {
          return;
        }

        try {
          const update = mapPropertyAvailabilityEventDto(JSON.parse(event.data) as unknown);

          if (update !== null) {
            subscriber.next(update);
          }
        } catch {
          // Mensagens que não contêm JSON válido são ignoradas.
        }
      };

      const handleError = () => {
        subscriber.error(new Error('Property availability WebSocket connection failed.'));
      };

      const handleClose = () => {
        subscriber.complete();
      };

      socket.addEventListener('message', handleMessage);
      socket.addEventListener('error', handleError);
      socket.addEventListener('close', handleClose);

      return () => {
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('error', handleError);
        socket.removeEventListener('close', handleClose);

        if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    });
  }
}
