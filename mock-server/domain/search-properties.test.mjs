import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { searchProperties } from './search-properties.mjs';

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
  {
    id: 'property-4',
    title: 'Casa com jardim',
    neighborhood: 'Perdizes',
    city: 'São Paulo',
    searchTerms: [],
    businessType: 'comprar',
    propertyType: 'casa',
    bedrooms: 3,
    price: 1400000,
  },
];

describe('searchProperties', () => {
  it('returns sale properties by default', () => {
    const result = searchProperties(CATALOG);

    assert.equal(result.matchType, 'all');
    assert.deepEqual(
      result.items.map(({ id }) => id),
      ['property-1', 'property-2', 'property-4'],
    );
  });

  it('matches text regardless of accents and letter case', () => {
    const result = searchProperties(CATALOG, {
      query: 'VILA MADALÉNA',
    });

    assert.equal(result.matchType, 'exact');
    assert.equal(result.normalizedQuery, 'vila madalena');
    assert.deepEqual(
      result.items.map(({ id }) => id),
      ['property-1'],
    );
  });

  it('matches additional search terms', () => {
    const result = searchProperties(CATALOG, {
      query: 'metrô Faria Lima',
    });

    assert.equal(result.matchType, 'exact');
    assert.deepEqual(
      result.items.map(({ id }) => id),
      ['property-2'],
    );
  });

  it('preserves objective filters when using fallback results', () => {
    const result = searchProperties(CATALOG, {
      query: 'bairro inexistente',
      propertyType: 'apartamento',
      bedrooms: 3,
      maxPrice: 1300000,
    });

    assert.equal(result.matchType, 'nearby');
    assert.deepEqual(
      result.items.map(({ id }) => id),
      ['property-2'],
    );
  });

  it('keeps rental properties separate from sale properties', () => {
    const result = searchProperties(CATALOG, {
      businessType: 'alugar',
    });

    assert.deepEqual(
      result.items.map(({ id }) => id),
      ['property-3'],
    );
  });
});
