import cors from 'cors';
import express from 'express';

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

  return app;
}
