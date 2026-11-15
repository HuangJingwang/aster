import type { SortableArchiveGroup } from '@/components/ContentArchiveMarkup';

export function buildArchiveSortHref(baseHref: string, sort: 'latest' | 'popular', query = '', tag = '') {
  const params = new URLSearchParams();
  if (sort === 'popular') params.set('sort', sort);
  if (query) params.set('q', query);
  if (tag) params.set('tag', tag);
  return params.size ? `${baseHref}?${params}` : baseHref;
}

export function filterArchive(groups: SortableArchiveGroup[], { query = '', tag = '' }: { query?: string; tag?: string }) {
  const normalized = query.trim().toLocaleLowerCase();
  const filtered = groups.flatMap(group => group.items.map(item => ({ year: group.year, item }))).filter(({ item }) =>
    (!normalized || [item.title, item.excerpt ?? '', ...item.taxonomyItems.map(t => t.label)].some(value => value.toLocaleLowerCase().includes(normalized))) &&
    (!tag || item.taxonomyItems.some(t => t.label === tag)),
  );
  const selected: SortableArchiveGroup[] = [];
  for (const { year, item } of filtered) {
    const group = selected.find(group => group.year === year);
    if (group) group.items.push(item); else selected.push({ year, items: [item] });
  }
  return { groups: selected, total: filtered.length };
}
