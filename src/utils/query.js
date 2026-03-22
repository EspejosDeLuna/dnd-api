/**
 * query.js — Helpers de paginación, filtrado y búsqueda
 */

/**
 * Filtra y pagina un array según los query params estándar:
 * ?search=fireball   — búsqueda por nombre (parcial, case-insensitive)
 * ?source=PHB,XGE    — filtrar por source (comma-separated)
 * ?page=1            — página (default 1)
 * ?limit=20          — resultados por página (default 20, max 100)
 */
export function paginate(arr, query) {
  let results = [...arr];

  // Búsqueda por nombre
  if (query.search) {
    const q = query.search.toLowerCase();
    results = results.filter(item =>
      item.name?.toLowerCase().includes(q)
    );
  }

  // Filtro por source
  if (query.source) {
    const sources = query.source.toUpperCase().split(',').map(s => s.trim());
    results = results.filter(item =>
      sources.includes(item.source?.toUpperCase())
    );
  }

  const total = results.length;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const page  = Math.max(parseInt(query.page)  || 1,  1);
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    total,
    page,
    pages,
    limit,
    results: results.slice(start, start + limit),
  };
}

/**
 * Busca un item por nombre exacto o slug (case-insensitive)
 */
export function findByName(arr, name) {
  const q = name.toLowerCase().replace(/-/g, ' ');
  return arr.find(item =>
    item.name?.toLowerCase() === q ||
    item.name?.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
}
