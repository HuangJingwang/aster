// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { SortableContentArchive, type SortableArchiveGroup } from './SortableContentArchive';

const navigation = vi.hoisted(() => ({ search: 'sort=popular&q=old&tag=Java&page=3', push: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(navigation.search), useRouter: () => ({ push: navigation.push }) }));

let root: Root;
let host: HTMLDivElement;
afterEach(async () => { await act(async () => root?.unmount()); host?.remove(); vi.clearAllMocks(); vi.unstubAllGlobals(); navigation.search = 'sort=popular&q=old&tag=Java&page=3'; });

async function renderArchive(count = 1) {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const groups: SortableArchiveGroup[] = [{ year: '2026', items: [{ id: 'a', href: '/posts/a', dateLabel: '11-15', dateTime: '2026-11-15', title: 'old article', pinned: false, statsLabel: '0 浏览', taxonomyItems: [{ href: '/tags/java', label: 'Java' }, { href: '/tags/python', label: 'Python' }] }] }];
  if (count > 1) groups[0]!.items = Array.from({ length: count }, (_, i) => ({ ...groups[0]!.items[0]!, id: String(i), href: `/posts/${i}` }));
  const rerender = () => act(async () => root.render(<SortableContentArchive latestGroups={groups} popularGroups={groups} contentLabel="文章" sortAriaLabel="文章排序" browseAriaLabel="文章浏览" browseHref="/series" browseLabel="专题" baseHref="/posts" />));
  await rerender();
  return rerender;
}

test('search keeps the applied topic and sort, resets pagination, and uses client navigation', async () => {
  await renderArchive();
  const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
  expect(input.getAttribute('aria-label')).toBe('搜索文章');
  input.value = ' new ';
  await act(async () => input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(navigation.push).toHaveBeenCalledWith('/posts?sort=popular&q=new&tag=Java', { scroll: false });
});

test('topics switch directly while keeping search and sort, and reset keeps the sort', async () => {
  await renderArchive();
  const topic = [...host.querySelectorAll('.archive-topics a')].find(a => a.textContent === 'Python')!;
  expect(topic.getAttribute('href')).toBe('/posts?sort=popular&q=old&tag=Python');
  expect(host.querySelector('.archive-topics [aria-current]')?.textContent).toBe('Java');
  const more = host.querySelector<HTMLSelectElement>('select[aria-label="选择主题"]')!;
  more.value = 'Python';
  await act(async () => more.dispatchEvent(new Event('change', { bubbles: true })));
  expect(navigation.push).toHaveBeenCalledWith('/posts?sort=popular&q=old&tag=Python', { scroll: false });
  expect(host.querySelector('a[aria-label="清除搜索和主题筛选"]')?.getAttribute('href')).toBe('/posts?sort=popular');
});


test('scrolling appends articles without page links or duplicate rows and stops at the end', async () => {
  let intersect: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe() {}
    disconnect = disconnect;
  });
  await renderArchive(25);
  expect(host.querySelectorAll('.posts-archive-item')).toHaveLength(12);
  expect(host.querySelector('[aria-label="文章分页"]')).toBeNull();
  await act(async () => intersect!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(host.querySelectorAll('.posts-archive-item')).toHaveLength(24);
  await act(async () => intersect!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  const links = [...host.querySelectorAll('.posts-archive-item')].map(a => a.getAttribute('href'));
  expect(links).toHaveLength(25);
  expect(new Set(links).size).toBe(25);
  expect(host.textContent).toContain('已展示全部 25 篇文章');
  expect(host.querySelector('.archive-load-more button')).toBeNull();
  expect(disconnect).toHaveBeenCalled();
});

test('the next batch is accessible without an intersection observer', async () => {
  await renderArchive(25);
  await act(async () => host.querySelector<HTMLButtonElement>('.archive-load-more button')!.click());
  expect(host.querySelectorAll('.posts-archive-item')).toHaveLength(24);
});


test('changing search, topic, or sort restarts the continuous list', async () => {
  const rerender = await renderArchive(25);
  for (const search of ['q=old&tag=Java', 'q=old&tag=Python', 'tag=Python']) {
    await act(async () => host.querySelector<HTMLButtonElement>('.archive-load-more button')!.click());
    expect(host.querySelectorAll('.posts-archive-item')).toHaveLength(24);
    navigation.search = search;
    await rerender();
    expect(host.querySelectorAll('.posts-archive-item')).toHaveLength(12);
  }
});
