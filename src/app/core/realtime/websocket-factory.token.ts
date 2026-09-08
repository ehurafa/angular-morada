import { InjectionToken } from '@angular/core';

export type WebSocketFactory = (url: string) => WebSocket;

export const WEBSOCKET_FACTORY = new InjectionToken<WebSocketFactory>('WEBSOCKET_FACTORY', {
  providedIn: 'root',
  factory: () => (url: string) => new WebSocket(url),
});
