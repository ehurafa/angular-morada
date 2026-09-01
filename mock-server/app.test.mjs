import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import request from 'supertest';

import { createApp } from './app.mjs';

const CATALOG = [
  {
    id: 'property-1',
    title: 'Apartamento com varanda',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    searchTerms: ['Sumaré', 'Linha Verde'],
    businessType: 'comprar',
    propertyType: 'apartamento',
    bedrooms: 2,
    price: 900000,
  },
  {
    id: 'property-2',
    title: 'Apartamento reformado',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    searchTerms: ['Faria Lima', 'Linha Amarela'],
    businessType: 'comprar',
    propertyType: 'apartamento',
    bedrooms: 3,
    price: 1200000,
  },
  {
    id: 'property-3',
    title: 'Studio mobiliado',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    searchTerms: ['Rua Augusta'],
    businessType: 'alugar',
    propertyType: 'studio',
    bedrooms: 1,
    price: 4200,
  },
];

describe('GET /api/properties', () => {
  it('returns filtered properties and the CORS header', async () => {
    const app = createApp({
      properties: CATALOG,
    });

    const response = await request(app)
      .get('/api/properties')
      .set('Origin', 'http://localhost:4200')
      .query({
        businessType: 'comprar',
        query: 'bairro inexistente',
        propertyType: 'apartamento',
        bedrooms: 3,
        maxPrice: 1300000,
      })
      .expect(200);

    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:4200');
    assert.equal(response.headers['x-powered-by'], undefined);
    assert.equal(response.body.matchType, 'nearby');
    assert.equal(response.body.normalizedQuery, 'bairro inexistente');
    assert.deepEqual(
      response.body.items.map(({ id }) => id),
      ['property-2'],
    );
    assert.equal('searchTerms' in response.body.items[0], false);
  });

  it('does not authorize an unknown origin through CORS', async () => {
    const app = createApp({
      properties: CATALOG,
    });

    const response = await request(app)
      .get('/api/properties')
      .set('Origin', 'https://example.com')
      .expect(200);

    assert.equal(response.headers['access-control-allow-origin'], undefined);
  });
});

describe('GET /api/properties/:id', () => {
  it('returns a property by id without internal search terms', async () => {
    const app = createApp({
      properties: CATALOG,
    });

    const response = await request(app).get('/api/properties/property-2').expect(200);

    assert.equal(response.body.id, 'property-2');
    assert.equal(response.body.title, 'Apartamento reformado');
    assert.equal('searchTerms' in response.body, false);
  });

  it('returns 404 when the property does not exist', async () => {
    const app = createApp({
      properties: CATALOG,
    });

    const response = await request(app).get('/api/properties/property-999').expect(404);

    assert.deepEqual(response.body, {
      message: 'Imóvel não encontrado.',
    });
  });
});
