import cors from 'cors';
import express from 'express';
import { normalizeText } from './domain/normalize-text.mjs';

import { searchProperties } from './domain/search-properties.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:4202',
  'http://localhost:5173',
];

function readQueryString(value) {
  return typeof value === 'string' ? value : '';
}

function readOptionalNumber(value) {
  const text = readQueryString(value);

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) && number >= 0 ? number : null;
}

function toResponseItem(property) {
  return Object.fromEntries(Object.entries(property).filter(([key]) => key !== 'searchTerms'));
}

export function createApp({ allowedOrigins = DEFAULT_ALLOWED_ORIGINS, properties = [] } = {}) {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: allowedOrigins,
    }),
  );

  app.use(
    express.json({
      limit: '100kb',
    }),
  );

  app.get('/api/locations', (_request, response) => {
    const neighborhoods = new Map();

    for (const { neighborhood } of properties) {
      if (typeof neighborhood !== 'string') {
        continue;
      }

      const label = neighborhood.trim();
      const key = normalizeText(label);

      if (key && !neighborhoods.has(key)) {
        neighborhoods.set(key, label);
      }
    }

    const locations = [...neighborhoods.values()]
      .sort((left, right) => left.localeCompare(right, 'pt-BR'))
      .map((label) => ({ label, kind: 'bairro' }));

    response.json(locations);
  });

  app.get('/api/properties', (request, response) => {
    const result = searchProperties(properties, {
      businessType: readQueryString(request.query.businessType) || 'comprar',
      query: readQueryString(request.query.query),
      propertyType: readQueryString(request.query.propertyType) || null,
      bedrooms: readOptionalNumber(request.query.bedrooms),
      maxPrice: readOptionalNumber(request.query.maxPrice),
    });

    response.json({
      ...result,
      items: result.items.map(toResponseItem),
    });
  });

  app.get('/api/properties/:id', (request, response) => {
    const property = properties.find(({ id }) => id === request.params.id);

    if (!property) {
      response.status(404).json({
        message: 'Imóvel não encontrado.',
      });
      return;
    }

    response.json(toResponseItem(property));
  });

  return app;
}
