/**
 * In-memory store for rifles (admin dashboard).
 * Matches admin console type: { id, name?, createdAt? }.
 */
export interface Rifle {
  id: number;
  name?: string;
  createdAt?: string;
  [key: string]: unknown;
}

const rifles: Rifle[] = [];
let nextId = 1;

/** Seed a few rifles so the dashboard chart has sample data */
function seed() {
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    rifles.push({
      id: nextId++,
      name: `Rifle ${nextId - 1}`,
      createdAt: d.toISOString(),
    });
  }
}
seed();

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export function getRifles(options: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}): PageResponse<Rifle> {
  const page = Math.max(1, options.page ?? 1);
  const size = Math.max(1, Math.min(500, options.size ?? 20));
  const sortBy = options.sortBy ?? 'createdAt';
  const sortDir = options.sortDir ?? 'desc';

  const sorted = [...rifles].sort((a, b) => {
    const aVal = a[sortBy as keyof Rifle];
    const bVal = b[sortBy as keyof Rifle];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDir === "asc" ? -1 : 1;
    if (bVal == null) return sortDir === "asc" ? 1 : -1;
    if (sortBy === "createdAt") {
      const tA = new Date(String(aVal)).getTime();
      const tB = new Date(String(bVal)).getTime();
      const cmp = tA - tB;
      return sortDir === "asc" ? cmp : -cmp;
    }
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const start = (page - 1) * size;
  const items = sorted.slice(start, start + size);

  return { items, page, size, totalItems, totalPages };
}
