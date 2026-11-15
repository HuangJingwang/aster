import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { WritingCollectionFeature } from './WritingCollectionFeature';

test('preserves the authored title, original cover and detail destination', () => {
  const title = 'Voice Agent 实践与落地（二）：从唤醒到多轮对话';
  const html = renderToStaticMarkup(<WritingCollectionFeature kind="posts" item={{
    id: 'voice', slug: 'voice-agent', title, type: 'post', status: 'published', visibility: 'public',
    publishedAt: '2026-11-14', series: ['Voice Agent 实践与落地'], coverImageUrl: '/images/voice.png',
  }} />);
  expect(html).toContain(`<h2>${title}</h2>`);
  expect(html).toContain('href="/posts/voice-agent"');
  expect(html).toContain('src="/images/voice.png"');
});

test('shows a noninteractive notebook illustration when no public note exists', () => {
  const html = renderToStaticMarkup(<WritingCollectionFeature kind="notes" />);
  expect(html).toContain('writing-paper--empty');
  expect(html).not.toContain('<a ');
  expect(html).not.toContain('<time');
});
