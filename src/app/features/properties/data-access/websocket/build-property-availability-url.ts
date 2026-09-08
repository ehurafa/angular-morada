export function buildPropertyAvailabilityUrl(apiBaseUrl: string, pageOrigin: string): string {
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  const url = new URL(`${normalizedBaseUrl}/property-availability`, pageOrigin);

  if (url.protocol === 'http:') {
    url.protocol = 'ws:';
  } else if (url.protocol === 'https:') {
    url.protocol = 'wss:';
  } else {
    throw new Error(`Unsupported API protocol: ${url.protocol}`);
  }

  return url.toString();
}
