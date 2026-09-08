import { buildPropertyAvailabilityUrl } from './build-property-availability-url';

describe('buildPropertyAvailabilityUrl', () => {
  it('creates a local WebSocket URL from a relative API base URL', () => {
    const result = buildPropertyAvailabilityUrl('/api', 'http://localhost:4200');

    expect(result).toBe('ws://localhost:4200/api/property-availability');
  });

  it('creates a secure WebSocket URL from an HTTPS API base URL', () => {
    const result = buildPropertyAvailabilityUrl(
      'https://api.morada.test/api/',
      'https://portfolio.test',
    );

    expect(result).toBe('wss://api.morada.test/api/property-availability');
  });

  it('rejects unsupported API protocols', () => {
    expect(() =>
      buildPropertyAvailabilityUrl('ftp://api.morada.test/api', 'https://portfolio.test'),
    ).toThrowError('Unsupported API protocol: ftp:');
  });
});
