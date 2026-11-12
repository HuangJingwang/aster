import { describe, expect, test } from 'vitest';

import { extractMarkdownHeadings, renderMarkdown } from './render';

describe('Markdown rendering', () => {
  test('renders standalone video links with native controls and a visible fallback link', async () => {
    const html = await renderMarkdown('[Mina 会议视频](/videos/mina-animatic-v1.mp4)');

    expect(html).toContain('<figure class="markdown-video">');
    expect(html).toContain('<video src="/videos/mina-animatic-v1.mp4"');
    expect(html).toContain('controls');
    expect(html).toContain('playsinline');
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('aria-label="Mina 会议视频"');
    expect(html).toMatch(/<figcaption>.*href="\/videos\/mina-animatic-v1.mp4"/);
    expect(html).not.toMatch(/autoplay|loop|muted/);
  });

  test.each([
    '/videos/clip.MP4?download=1#t=5',
    'https://media.example.com/clip.webm?signature=abc&expires=123',
    '/videos/clip.ogv',
  ])('recognizes video URL path extensions: %s', async (url) => {
    expect(await renderMarkdown(`[视频](${url})`)).toContain('<video ');
  });

  test.each([
    '请看 [视频](/videos/clip.mp4)。',
    '[视频](/videos/clip.mp4) [说明](/posts/intro)',
    '`[视频](/videos/clip.mp4)`',
    '![图片](/images/photo.png)',
    '[附件](/files/notes.pdf)',
    '[网页](https://example.com/watch?file=clip.mp4)',
    '[视频](javascript:clip.mp4)',
    '[视频](data:video/mp4;base64,AAAA)',
    '[视频](file:///private/clip.mp4)',
    '[视频](//example.com/clip.mp4)',
    '<video src="/videos/clip.mp4" autoplay onerror="alert(1)"></video>',
  ])('preserves non-embed content and rejects unsafe video sources: %s', async (markdown) => {
    const html = await renderMarkdown(markdown);
    expect(html).not.toContain('<video');
    expect(html).not.toMatch(/onerror|javascript:|<script/);
  });

  test('keeps inline video links clickable and escapes video labels', async () => {
    expect(await renderMarkdown('下载 [视频](/videos/clip.mp4)。')).toContain('href="/videos/clip.mp4"');
    const html = await renderMarkdown('[A & B "会议"](/videos/clip.mp4)');
    expect(html).toContain('aria-label="A &amp; B &quot;会议&quot;"');
    expect(html).toContain('A &amp; B "会议"');
  });

  test('renders comparison tables with links and emphasis', async () => {
    const html = await renderMarkdown('| 方案 | 说明 |\n| --- | --- |\n| **RAG** | [原文](https://example.com) |');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>方案</th>');
    expect(html).toContain('<td><strong>RAG</strong></td>');
    expect(html).toContain('href="https://example.com"');
  });

  test('renders headings and paragraphs', async () => {
    const html = await renderMarkdown('# Hello\n\nWorld');

    expect(html).toContain('<h1 id="hello"');
    expect(html).toContain('Hello');
    expect(html).toContain('<p>World</p>');
  });

  test('removes script tags from rendered html', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>\n\nSafe');

    expect(html).not.toContain('<script');
    expect(html).toContain('Safe');
  });

  test('extracts article table of contents entries with matching heading anchors', async () => {
    const markdown = [
      '# Page title',
      '',
      '## 开始',
      '',
      '### Why this matters?',
      '',
      '## 开始',
      '',
      '#### Deep detail',
    ].join('\n');

    expect(extractMarkdownHeadings(markdown)).toEqual([
      { depth: 2, text: '开始', slug: '开始' },
      { depth: 3, text: 'Why this matters?', slug: 'why-this-matters' },
      { depth: 2, text: '开始', slug: '开始-2' },
    ]);

    const html = await renderMarkdown(markdown);

    expect(html).toContain('<h2 id="开始">开始</h2>');
    expect(html).toContain('<h3 id="why-this-matters">Why this matters?</h3>');
    expect(html).toContain('<h2 id="开始-2">开始</h2>');
    expect(html).toContain('<h4 id="deep-detail">Deep detail</h4>');
  });

  test('renders code blocks with language labels copy buttons and highlighted tokens', async () => {
    const html = await renderMarkdown(['```ts', 'const answer = "42";', '```'].join('\n'));

    expect(html).toContain('class="markdown-code-block"');
    expect(html).toContain('class="markdown-code-block__language">ts</span>');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-copy-code="true"');
    expect(html).toContain('aria-label="复制代码块"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('>复制代码</button>');
    expect(html).not.toContain('Copy');
    expect(html).toContain('class="token keyword">const</span>');
    expect(html).toContain('class="token string">"42"</span>');
  });

  test('marks xmind links for progressive mind map previews', async () => {
    const html = await renderMarkdown('[产品脑图](/files/product-plan.xmind)');

    expect(html).toContain('href="/files/product-plan.xmind"');
    expect(html).toContain('class="xmind-preview-link"');
    expect(html).toContain('data-xmind-src="/files/product-plan.xmind"');
    expect(html).toContain('data-xmind-title="产品脑图"');
    expect(html).toContain('>产品脑图</a>');
  });
});
