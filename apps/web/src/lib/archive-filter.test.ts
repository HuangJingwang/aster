import { expect, test } from 'vitest';
import { buildArchiveSortHref, filterArchive } from './archive-filter';
import type { SortableArchiveGroup } from '@/components/ContentArchiveMarkup';

const groups: SortableArchiveGroup[] = [{ year: '2026', items: Array.from({ length: 25 }, (_, i) => ({ id: String(i), title: `文章 ${i}`, href: `/posts/${i}`, pinned: false, dateLabel: '09-10', dateTime: '2026-09-10', statsLabel: '', taxonomyItems: [{ href: '/tags/java', label: i % 2 ? 'Java' : 'React' }] })) }];
test('filters the complete archive without dropping articles or changing their order', () => {
  expect(filterArchive(groups, {}).groups[0]?.items.map(i => i.id)).toEqual(groups[0]!.items.map(i => i.id));
  expect(filterArchive(groups, { tag: 'Java' }).total).toBe(12);
  expect(filterArchive(groups, { query: '文章 2' }).total).toBe(6);
  expect(filterArchive(groups, { query: 'missing' })).toEqual({ groups: [], total: 0 });
});
test('changing sort keeps query and taxonomy filters while resetting pagination', () => {
  expect(buildArchiveSortHref('/posts', 'popular', 'voice', 'Agent')).toBe('/posts?sort=popular&q=voice&tag=Agent');
  expect(buildArchiveSortHref('/posts', 'latest', '', '')).toBe('/posts');
});
