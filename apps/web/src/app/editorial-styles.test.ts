import { readFileSync, statSync } from 'node:fs';
import { expect, test } from 'vitest';
const css = readFileSync(new URL('./styles/editorial.css', import.meta.url), 'utf8');
test('the new home and resource system keeps theme, accessibility and responsive contracts', () => {
  expect(css).toContain(":root[data-theme='summer-day'] .journal-shell");
  expect(css).toContain('--journal-bg: #0c0e10');
  expect(css).toContain('--journal-bg: #f2f4f5');
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  expect(css).toContain('@media (prefers-reduced-transparency: reduce)');
  expect(css).toContain('env(safe-area-inset-bottom)');
  expect(css).toContain('.editorial-project-slot { position: static;');
  expect(css).toContain('.resource-card .sr-only { position: absolute;');
  expect(css).toContain('.share-page__search > span { position: static;');
  expect(css).toContain('.editorial-archive-filter input::placeholder { color: var(--journal-muted);');
  expect(css).not.toMatch(/(?:^|\n)\s*(?:body|input|button)\s*\{/);
});

test('the editorial theme toggle keeps its hit area aligned with the visible control', () => {
  expect(css).toMatch(/\.editorial-header \.theme-toggle\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/);
  expect(css).toMatch(/\.editorial-header \.theme-toggle button\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/);
});

test('the shortcut navigation is hidden on desktop and sticks below the mobile header', () => {
  expect(css).toMatch(/\.editorial-dock\s*\{[^}]*display:\s*none;/);
  const mobileDock = css.match(/@media \(max-width: 767px\)\s*\{[\s\S]*?\.editorial-dock\s*\{([^}]*)\}/)?.[1];
  expect(mobileDock).toContain('display: flex;');
  expect(mobileDock).toContain('position: sticky;');
  expect(mobileDock).toContain('top: 0;');
  expect(css).toMatch(/@media \(max-width: 767px\)\s*\{[\s\S]*?\.journal-chrome\s*\{\s*height:\s*64px;/);
});

test('art lettering stays self-hosted, lightweight and limited to display headings', () => {
  const face = css.match(/@font-face\s*\{[^}]*Aster Display[^}]*\}/)?.[0];
  expect(face).toContain("url('/fonts/aster-display.woff2')");
  expect(face).toContain('font-display: swap');
  expect(css).toContain('.editorial-section__heading h2 {');
  expect(css).toContain('.projects-page .page-title h1,');
  expect(css).toContain('.share-page__heading h1 { font-family: var(--journal-art)');
  expect(css).not.toMatch(/(?:body|\.editorial-lead h3|\.editorial-reading__list h3)\s*\{[^}]*var\(--journal-art\)/);
  const font = new URL('../../public/fonts/aster-display.woff2', import.meta.url);
  expect(readFileSync(font).subarray(0, 4).toString()).toBe('wOF2');
  expect(statSync(font).size).toBeLessThan(30_000);
  expect(readFileSync(new URL('../../public/fonts/SmileySans-OFL.txt', import.meta.url), 'utf8')).toContain('SIL OPEN FONT LICENSE');
});
