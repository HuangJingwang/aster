import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const css = readFileSync(new URL('./styles/reader.css', import.meta.url), 'utf8');

test('desktop reading outline stays inside the article instead of covering the footer', () => {
  const desktop = css.slice(css.indexOf('@media (min-width: 1024px)'));
  const sidebar = desktop.match(/\.reader-page\.detail-shell--with-toc \.detail-sidebar \{([^}]+)\}/)?.[1] ?? '';
  const grid = desktop.match(/\.reader-page\.detail-shell--with-toc \.journal-article-grid \{([^}]+)\}/)?.[1] ?? '';

  // A non-stretched sticky grid item is constrained by the article row's end.
  expect(sidebar).toContain('position: sticky;');
  expect(sidebar).toContain('align-self: start;');
  expect(sidebar).not.toContain('position: fixed;');
  expect(sidebar).toContain('max-height: calc(100svh - 152px);');
  expect(grid).toContain('display: grid;');
  expect(grid).toContain('grid-template-columns: minmax(0, 1fr) 220px;');
  expect(grid).toContain('width: calc(100% + 268px);');
});
