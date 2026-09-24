// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PublicPersistentNav } from './PublicPersistentNav';

const location = vi.hoisted(() => ({ pathname: '/posts/a-story' }));
vi.mock('next/navigation', () => ({ usePathname: () => location.pathname }));
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('matchMedia', () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  location.pathname = '/posts/a-story';
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
const render = () => act(async () => root.render(<PublicPersistentNav title="Starry Summer" navItems={[]} />));

test('reader navigation keeps a real homepage return and a shared, current-location Dock', async () => {
  await render();
  const dock = host.querySelector('nav[aria-label="快捷导航"]');
  expect(dock).not.toBeNull();
  expect(dock!.querySelector('a[aria-label="首页"]')?.getAttribute('href')).toBe('/');
  expect(dock!.querySelector('a[aria-current="page"]')?.getAttribute('href')).toBe('/posts');
  expect(host.querySelector('a[aria-label="Starry Summer · Aster.H · 返回首页"]')?.getAttribute('href')).toBe('/');
});

test('home and reader routes share five link destinations and keyboard navigation', async () => {
  location.pathname = '/';
  await render();
  const dock = host.querySelector('nav[aria-label="快捷导航"]')!;
  const links = [...dock.querySelectorAll<HTMLAnchorElement>('a')];
  expect(links.map(link => link.getAttribute('href'))).toEqual(['/', '/posts', '/projects', '/moments', '/search']);
  expect(links[0]!.getAttribute('aria-current')).toBe('page');
  links[0]!.focus();
  await act(async () => links[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
  expect(document.activeElement).toBe(links[1]);
  expect(host.querySelector('.editorial-header .theme-toggle')).not.toBeNull();
});

test('admin routes never receive the public redesign controls', async () => {
  location.pathname = '/admin/content';
  await render();
  expect(host.querySelector('header')).toBeNull();
  expect(host.querySelector('nav')).toBeNull();
});

test('all public routes retain the mobile-only shortcut navigation', async () => {
  for (const pathname of ['/', '/posts', '/posts/story', '/notes/note', '/projects', '/projects/project', '/moments', '/moments/moment', '/about', '/tags/example']) {
    location.pathname = pathname;
    await render();
    expect(host.querySelectorAll('.editorial-dock a')).toHaveLength(5);
  }
});
