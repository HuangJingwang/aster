// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import TagsPage from '@/app/tags/page';
import SearchPage from '@/app/search/page';
import { PublicPersistentNav } from './PublicPersistentNav';

vi.mock('next/navigation', () => ({ usePathname: () => '/posts/example' }));
vi.mock('./SiteShell', () => ({ SiteShell: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('./ThemeToggle', () => ({ ThemeToggle: () => null }));
vi.mock('./EditorialDock', () => ({ EditorialDock: () => null }));
vi.mock('@/lib/public-content', () => ({ loadSiteContent: async () => [
  { id: 'one', slug: 'one', title: '第一篇文章', type: 'post', status: 'published', visibility: 'public', publishedAt: '2026-11-24', tags: ['Next.js', 'Java'] },
  { id: 'two', slug: 'two', title: '第二篇文章', type: 'post', status: 'published', visibility: 'public', publishedAt: '2026-11-23', tags: ['Java'] },
] }));

test('tag index links once to each detail route without duplicating article cards', async () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(await TagsPage()), 'text/html');
  const links = [...doc.querySelectorAll('.journal-taxonomy-index a')];
  expect(links).toHaveLength(2);
  expect(links.map(a => a.getAttribute('href'))).toEqual(['/tags/java', '/tags/next-js']);
  expect(links[0]?.textContent).toContain('2');
  expect(doc.querySelector('.content-card')).toBeNull();
});

test('search entrance offers real tags and recent articles before a query', async () => {
  const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({}) }));
  expect(html).toContain('href="/tags/java"');
  expect(html).toContain('href="/posts/one"');
  expect(html).toContain('最近发布');
});

test('desktop navigation exposes main destinations and the secondary directory', () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<PublicPersistentNav title="Aster" navItems={[]} />), 'text/html');
  for (const href of ['/posts', '/projects', '/moments', '/search', '/notes', '/series', '/tags', '/categories', '/archives', '/guestbook']) {
    expect(doc.querySelector(`header a[href="${href}"]`)).not.toBeNull();
  }
  expect(doc.querySelector('.editorial-primary-nav a[href="/posts"]')?.getAttribute('aria-current')).toBe('page');
});
