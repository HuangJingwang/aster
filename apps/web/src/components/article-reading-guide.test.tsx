// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { ArticleReadingGuide } from './ArticleReadingGuide';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test('viewport progress tracks only the article, updates after layout changes, and cleans up', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('innerHeight', 800);
  let nextFrame: FrameRequestCallback | undefined;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { nextFrame = callback; return 1; });
  const cancelFrame = vi.fn();
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  let resize: () => void = () => {};
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe = observe;
    disconnect = disconnect;
  });
  const host = document.createElement('main');
  document.body.append(host);
  const root = createRoot(host);
  let top = -580;
  let height = 2000;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return { top, height, bottom: top + height, left: 0, right: 800, width: 800, x: 0, y: top, toJSON() {} };
  });
  await act(async () => root.render(<><ArticleReadingGuide headings={[]} /><div className="detail__body">正文</div><section style={{ height: 3000 }}>评论和页脚</section></>));
  const bar = document.querySelector<HTMLElement>('.journal-reading-progress')!;
  // Escape animated/stacking article ancestors while retaining the theme tokens.
  expect(bar.parentElement).toBe(document.body);
  expect(bar.classList.contains('journal-chrome')).toBe(true);
  expect(bar.style.transform).toBe('scaleX(0.5)');
  expect(host.querySelector('.journal-reading-label')?.textContent).toContain('50%');
  expect(observe).toHaveBeenCalledWith(host.querySelector('.detail__body'));
  async function flush(action: () => void) {
    await act(async () => { action(); nextFrame?.(0); nextFrame = undefined; });
  }
  height = 3400;
  await flush(() => resize());
  expect(bar.style.transform).toBe('scaleX(0.25)');
  top = -3000;
  await flush(() => window.dispatchEvent(new Event('scroll')));
  expect(bar.style.transform).toBe('scaleX(1)');
  top = 500;
  await flush(() => window.dispatchEvent(new Event('scroll')));
  expect(bar.style.transform).toBe('scaleX(0)');
  expect(host.querySelector('.journal-reading-label')?.textContent).toContain('0%');
  top = 100;
  height = 100;
  await flush(() => window.dispatchEvent(new Event('resize')));
  expect(bar.style.transform).toBe('scaleX(1)');
  window.dispatchEvent(new Event('scroll'));
  await act(async () => root.unmount());
  expect(document.querySelector('.journal-reading-progress')).toBeNull();
  expect(disconnect).toHaveBeenCalled();
  expect(cancelFrame).toHaveBeenCalledWith(1);
  host.remove();
});

test('guide follows actual headings and collapses mobile navigation after selection', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const headings = [{ slug: 'opening', text: '开篇', depth: 2 }, { slug: 'details', text: '细节', depth: 3 }];
  await act(async () => root.render(<><ArticleReadingGuide headings={headings} /><div className="detail__body"><h2 id="opening">开篇</h2><h3 id="details">细节</h3></div></>));
  // Both desktop and mobile links reference real article IDs, not a separate route.
  for (const link of host.querySelectorAll('.detail-toc a')) expect(document.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
  expect(host.querySelector('.detail-toc [aria-current="location"]')?.getAttribute('href')).toBe('#details');
  const mobile = host.querySelector('details')!;
  mobile.open = true;
  await act(async () => mobile.querySelector<HTMLAnchorElement>('a')!.click());
  expect(mobile.open).toBe(false);
  await act(async () => root.unmount());
  host.remove(); vi.unstubAllGlobals();
});
