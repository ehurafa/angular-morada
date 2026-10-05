export interface LocationSuggestion {
  readonly label: string;
  readonly kind: 'bairro' | 'rua' | 'metrô';
}
