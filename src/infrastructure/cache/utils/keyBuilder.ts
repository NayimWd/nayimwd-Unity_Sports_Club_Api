/**
 * Normalizes query params so key is always consistent
 * Empty queries → clean key   (e.g. "TOURNAMENT_LIST")
 * Queries → encoded key       (e.g. "TOURNAMENT_LIST:limit=10&page=2")
 */

export function buildCacheKey(baseKey: string, query: any = {}): string | any {
  const cleanQuery: Record<string, unknown> = {};

  // sort keys
  const keys = Object.keys(query).sort();

  // filter ampty query
  for (const q of keys) {
    if (query[q] !== undefined && query[q] !== "" && query[q] !== null) {
      cleanQuery[q] = query[q];
    }
  }

  // queries with keys
  const queryString = Object.keys(cleanQuery)
    .map((k) => `${k}=${cleanQuery[k]}`)
    .join("&");

  return queryString ? `${baseKey}:${queryString}` : baseKey;
}
