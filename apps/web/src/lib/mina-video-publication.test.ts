import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import config from '../../next.config';
import { getContentHref } from './content-routing';
import { selectEditorialHome } from './editorial-home';
import type { SiteContentItem } from './content-types';
import { renderMarkdown } from '@starry-summer/markdown';

test('the Mina video is a public article with context, a playable video, and matching homepage destination', async () => {
  const items = JSON.parse(readFileSync(new URL('../../content/public-content.json', import.meta.url), 'utf8')) as SiteContentItem[];
  const matches = items.filter(item => item.slug === 'mina-meeting-video');
  expect(matches).toHaveLength(1);
  const article = matches[0]!;
  expect(article.type).toBe('post');
  expect(article.status).toBe('published');
  expect(article.visibility).toBe('public');
  expect(article.bodyMarkdown?.split(/\s+/).join('').length).toBeGreaterThan(300);
  const html = await renderMarkdown(article.bodyMarkdown!);
  expect(html.match(/<video /g)).toHaveLength(1);
  expect(html).toContain('src="/videos/mina-animatic-v1.mp4"');
  expect(getContentHref(selectEditorialHome(items).featuredVideo!.item)).toBe('/posts/mina-meeting-video');
});

test('the published moment URL permanently redirects to the article', async () => {
  const redirects = await config.redirects?.();
  expect(redirects).toContainEqual({ source: '/moments/mina-meeting-video', destination: '/posts/mina-meeting-video', permanent: true });
});
