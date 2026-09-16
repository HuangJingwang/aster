// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { RecommendedShareGrid } from './RecommendedShareGrid';
import { recommendedShares } from '@/lib/recommended-shares';

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('matchMedia', () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  window.history.replaceState(null, '', '/moments');
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
test('resource type filters update real links and the shareable URL, and popstate restores them', async () => {
  await act(async () => root.render(<RecommendedShareGrid resources={recommendedShares} />));
  expect(host.querySelectorAll('.resource-card')).toHaveLength(21);
  const website = [...host.querySelectorAll<HTMLButtonElement>('.resource-kind-filter button')].find(button => button.textContent === '网站')!;
  await act(async () => website.click());
  expect(host.querySelectorAll('.resource-card')).toHaveLength(6);
  expect(window.location.search).toBe('?kind=website');
  expect(host.querySelector('[role="status"]')?.textContent).toContain('6 项');
  await act(async () => {
    window.history.replaceState(null, '', '/moments?kind=opensource&q=pipecat');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(host.querySelectorAll('.resource-card')).toHaveLength(1);
  expect(host.querySelector('.resource-card')?.getAttribute('href')).toBe('https://github.com/pipecat-ai/pipecat');

  await act(async () => {
    window.history.replaceState(null, '', '/moments');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  const article = [...host.querySelectorAll<HTMLButtonElement>('.resource-kind-filter button')].find(button => button.textContent === '转载文章')!;
  await act(async () => article.click());
  expect(host.querySelectorAll('.resource-card')).toHaveLength(1);
  expect(host.querySelector('.resource-card')?.getAttribute('href')).toBe('https://www.douyin.com/article/7679728760388311921');
  expect(window.location.search).toBe('?kind=article');
});
test('an empty search can be cleared to restore all recommendations', async () => {
  window.history.replaceState(null, '', '/moments?q=nonexistent-resource');
  await act(async () => root.render(<RecommendedShareGrid resources={recommendedShares} />));
  expect(host.querySelectorAll('.resource-card')).toHaveLength(0);
  await act(async () => host.querySelector<HTMLButtonElement>('.editorial-empty button')!.click());
  expect(host.querySelectorAll('.resource-card')).toHaveLength(21);
  expect(window.location.search).toBe('');
});
