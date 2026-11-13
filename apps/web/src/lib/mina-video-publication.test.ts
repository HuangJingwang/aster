import { createHash } from 'node:crypto';
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
  expect(html).toContain('src="/videos/mina-false-ending-office-v8.mp4"');
  expect(getContentHref(selectEditorialHome(items).featuredVideo!.item)).toBe('/posts/mina-meeting-video');
});

test('the published moment URL permanently redirects to the article', async () => {
  const redirects = await config.redirects?.();
  expect(redirects).toContainEqual({ source: '/moments/mina-meeting-video', destination: '/posts/mina-meeting-video', permanent: true });
});


test('the published video matches the exact V8 file selected by the owner', () => {
  const video = readFileSync(new URL('../../public/videos/mina-false-ending-office-v8.mp4', import.meta.url));
  expect(createHash('sha256').update(video).digest('hex')).toBe('ea0f9a9bc66415eb82dec49565e292ead0cba8d3a81cab94ec2649b5db4afdd7');
  const assets = JSON.parse(readFileSync(new URL('../../content/assets.json', import.meta.url), 'utf8'));
  expect(assets.find((asset: { publicUrl: string }) => asset.publicUrl === '/videos/mina-false-ending-office-v8.mp4')?.byteSize).toBe(video.length);
});

test('old direct video links open the corrected V8 video', async () => {
  expect(await config.redirects?.()).toContainEqual({ source: '/videos/mina-animatic-v1.mp4', destination: '/videos/mina-false-ending-office-v8.mp4', permanent: true });
});
