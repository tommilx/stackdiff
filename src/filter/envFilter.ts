export type FilterOptions = {
  keys?: string[];
  pattern?: string | RegExp;
  excludeKeys?: string[];
  excludePattern?: string | RegExp;
};

export type EnvMap = Record<string, string | undefined>;

/**
 * Filter an env map by specific keys or a regex pattern.
 */
export function filterByKeys(env: EnvMap, keys: string[]): EnvMap {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => keys.includes(k))
  );
}

export function filterByPattern(env: EnvMap, pattern: string | RegExp): EnvMap {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => regex.test(k))
  );
}

export function excludeByKeys(env: EnvMap, keys: string[]): EnvMap {
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => !keys.includes(k))
  );
}

export function excludeByPattern(env: EnvMap, pattern: string | RegExp): EnvMap {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => !regex.test(k))
  );
}

/**
 * Apply a full set of filter options to an env map.
 */
export function applyFilters(env: EnvMap, options: FilterOptions): EnvMap {
  let result = { ...env };

  if (options.keys && options.keys.length > 0) {
    result = filterByKeys(result, options.keys);
  }

  if (options.pattern) {
    result = filterByPattern(result, options.pattern);
  }

  if (options.excludeKeys && options.excludeKeys.length > 0) {
    result = excludeByKeys(result, options.excludeKeys);
  }

  if (options.excludePattern) {
    result = excludeByPattern(result, options.excludePattern);
  }

  return result;
}
