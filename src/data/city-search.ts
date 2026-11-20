export function normalizeCity(value: string) {
  const normalized = value.trim().replace(/^#/, "").toLowerCase().replace(/[\s-]+/g, "");
  return normalized === "алмата" || normalized === "алмаата" ? "алматы" : normalized;
}

export function matchesCitySearch(city: string, query: string, exact = false) {
  const normalized = normalizeCity(query);
  return normalized.length > 0 && (exact ? normalizeCity(city) === normalized : normalizeCity(city).includes(normalized));
}
