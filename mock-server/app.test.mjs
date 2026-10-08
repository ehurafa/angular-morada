import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import request from 'supertest';

import { createApp } from './app.mjs';

import { PROPERTIES } from './data/properties.mjs';
import { LOCATION_CATALOG } from './data/location-catalog.mjs';

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

  it('orders search results by the requested price direction', async () => {
    const app = createApp({ properties: CATALOG });

    const response = await request(app)
      .get('/api/properties')
      .query({ businessType: 'comprar', sort: 'price-desc' })
      .expect(200);

    assert.deepEqual(
      response.body.items.map(({ id }) => id),
      ['property-2', 'property-1'],
    );
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

describe('GET /api/locations', () => {
  it('lists each catalog neighborhood once in alphabetical order', async () => {
    const app = createApp({
      properties: [...CATALOG, { ...CATALOG[0], id: 'property-4' }],
    });

    const response = await request(app).get('/api/locations').expect(200);

    assert.deepEqual(response.body, [
      { label: 'Consolação', kind: 'bairro' },
      { label: 'Pinheiros', kind: 'bairro' },
      { label: 'Vila Madalena', kind: 'bairro' },
    ]);
  });

  it('lists neighborhoods, streets and metro stations from the real catalog', async () => {
    const app = createApp({ properties: PROPERTIES });

    const response = await request(app).get('/api/locations').expect(200);

    assert.deepEqual(response.body, [
      { label: 'Avenida Paulista', kind: 'rua' },
      { label: 'Consolação', kind: 'bairro' },
      { label: 'Metrô Faria Lima', kind: 'metrô' },
      { label: 'Metrô Sumaré', kind: 'metrô' },
      { label: 'Perdizes', kind: 'bairro' },
      { label: 'Pinheiros', kind: 'bairro' },
      { label: 'Rua Augusta', kind: 'rua' },
      { label: 'Vila Madalena', kind: 'bairro' },
    ]);
  });

  it('finds the associated property for every suggested street and metro station', async () => {
    const app = createApp({ properties: PROPERTIES });

    for (const { label, propertyId } of LOCATION_CATALOG) {
      const property = PROPERTIES.find(({ id }) => id === propertyId);
      assert.ok(property, `Imóvel ausente para ${label}`);

      const response = await request(app)
        .get('/api/properties')
        .query({ businessType: property.businessType, query: label })
        .expect(200);

      assert.equal(response.body.matchType, 'exact', label);
      assert.ok(
        response.body.items.some(({ id }) => id === propertyId),
        label,
      );
    }
  });
});
