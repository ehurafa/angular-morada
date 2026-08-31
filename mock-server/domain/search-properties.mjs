import { normalizeText } from './normalize-text.mjs';

const RESULT_LIMIT = 12;

const GENERIC_SEARCH_TERMS = new Set([
  'imovel',
  'imoveis',
  'comprar',
  'alugar',
  'perto',
  'proximo',
  'metro',
]);

function calculateScore(property, normalizedQuery, queryTokens) {
  if (!normalizedQuery) {
    return 1;
  }

  const searchableText = normalizeText(
    [property.title, property.neighborhood, property.city, ...(property.searchTerms ?? [])]
      .filter(Boolean)
      .join(' '),
  );

  if (searchableText.includes(normalizedQuery)) {
    return 100;
  }

  return queryTokens.reduce((score, token) => score + (searchableText.includes(token) ? 10 : 0), 0);
}

export function searchProperties(
  properties,
  {
    businessType = 'comprar',
    query = '',
    propertyType = null,
    bedrooms = null,
    maxPrice = null,
  } = {},
) {
  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery
    .split(' ')
    .filter((token) => token.length >= 3 && !GENERIC_SEARCH_TERMS.has(token));

  const eligibleProperties = properties
    .filter((property) => property.businessType === businessType)
    .filter((property) => propertyType === null || property.propertyType === propertyType)
    .filter((property) => bedrooms === null || property.bedrooms >= bedrooms)
    .filter((property) => maxPrice === null || property.price <= maxPrice);

  const rankedProperties = eligibleProperties
    .map((property) => ({
      property,
      score: calculateScore(property, normalizedQuery, queryTokens),
    }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score);

  const hasTextMatch = normalizedQuery === '' || rankedProperties.length > 0;

  const items = (
    hasTextMatch ? rankedProperties.map(({ property }) => property) : eligibleProperties
  ).slice(0, RESULT_LIMIT);

  const matchType = normalizedQuery === '' ? 'all' : hasTextMatch ? 'exact' : 'nearby';

  return {
    items,
    matchType,
    normalizedQuery,
  };
}
