import { Children, isValidElement, type ReactNode } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import type { SiteContentItem } from '@/lib/content';
import { loadApprovedComments } from '@/lib/public-comments';
import { ContentDetail } from './ContentDetail';
import { LikeButton } from './LikeButton';
import { CommentForm } from './CommentForm';
import { InlineCommentLayer } from './InlineCommentLayer';
import { ContentCard } from './ContentCard';

vi.mock('next/headers', () => ({ cookies: async () => ({ toString: () => '' }) }));
vi.mock('@/lib/reader-auth', () => ({ loadReaderSession: async () => ({ authenticated: false }) }));
vi.mock('@/lib/public-comments', () => ({ loadApprovedComments: vi.fn(async () => []) }));

const item: SiteContentItem = { id: 'reader-test', title: '阅读测试', type: 'post', status: 'published', visibility: 'public', publishedAt: '2026-11-14', bodyMarkdown: '## 正文\n\n文章内容。' };
function contains(node: ReactNode, type: unknown): boolean {
  return Children.toArray(node).some(child => isValidElement<{ children?: ReactNode }>(child) && (child.type === type || contains(child.props.children, type)));
}
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

test.each([undefined, 0, 123])('does not present static viewCount=%s as a live readership count', async viewCount => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const content = { ...item, viewCount };
  const detail = renderToStaticMarkup(await ContentDetail({ item: content }));
  const card = renderToStaticMarkup(<ContentCard item={content} />);
  for (const html of [detail, card]) {
    expect(html).not.toContain('次浏览');
    expect(html).toContain(item.title);
    expect(html).toContain(item.publishedAt);
  }
});

test.each([undefined, '', '   '])('hides all interaction entry points without a browser endpoint (%s)', async value => {
  vi.stubEnv('NEXT_PUBLIC_INTERACTION_BASE_URL', value);
  // A server-only read endpoint cannot make browser submissions work.
  vi.stubEnv('INTERACTION_BASE_URL', 'https://server-only.example');
  const tree = await ContentDetail({ item });
  for (const component of [LikeButton, CommentForm, InlineCommentLayer]) expect(contains(tree, component)).toBe(false);
  expect(loadApprovedComments).not.toHaveBeenCalled();
  expect(contains(tree, 'h1')).toBe(true);
});

test('retains configured interactions and respects per-article comment settings', async () => {
  vi.stubEnv('NEXT_PUBLIC_INTERACTION_BASE_URL', 'https://interactions.example');
  const enabled = await ContentDetail({ item });
  for (const component of [LikeButton, CommentForm, InlineCommentLayer]) expect(contains(enabled, component)).toBe(true);
  expect(loadApprovedComments).toHaveBeenCalledWith('post', item.id);
  vi.clearAllMocks();
  const disabled = await ContentDetail({ item: { ...item, allowComments: false } });
  expect(contains(disabled, LikeButton)).toBe(true);
  expect(contains(disabled, CommentForm)).toBe(false);
  expect(contains(disabled, InlineCommentLayer)).toBe(false);
  expect(loadApprovedComments).not.toHaveBeenCalled();
});

test('displays the exact authored title including its series prefix and issue', async () => {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const title = 'Voice Agent 实践与落地（二）：从唤醒到多轮对话';
  const tree = await ContentDetail({ item: { ...item, title, series: ['Voice Agent 实践与落地'], categories: ['人工智能'], coverImageUrl: '/images/cover.png' } });
  const html = renderToStaticMarkup(tree);
  expect(html).toContain(`<h1>${title}</h1>`);
  expect(html).not.toContain('Voice Agent 实践与落地 · 02');
  expect(html).toContain('aria-label="所属系列"');
  expect(html).toContain('人工智能');
  expect(html).toContain('/images/cover.png');
  expect(html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0]).toContain('src="/images/cover.png"');
  expect(html.match(/<details class="reader-article-details">[\s\S]*?<\/details>/)?.[0]).not.toContain('src="/images/cover.png"');
  expect(html).toContain('文章目录');
  expect(html).toContain('Aster.H');
});
