import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

function readSources(paths: string[]) {
  return paths.map((path) => readFileSync(join(process.cwd(), path), 'utf8')).join('\n');
}

describe('public accessibility copy', () => {
  test('keeps the public about note concise and labelled', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/about/page.tsx'), 'utf8');

    expect(source).toContain('aria-label="关于 Aster"');
    expect(source).toContain('aria-label="站点内容"');
    expect(source).toContain('className="about-note"');
    expect(source).not.toContain('className="about-list__item"');
  });

  test('uses Chinese labels for public reading and interaction landmarks', () => {
    const sources = readSources([
      'src/app/about/page.tsx',
      'src/app/archives/page.tsx',
      'src/app/search/page.tsx',
      'src/components/CodeCopyEnhancer.tsx',
      'src/components/ContentCard.tsx',
      'src/components/ContentDetail.tsx',
      'src/components/GuestbookForm.tsx',
      'src/components/PublicSubmissionBodyField.tsx',
      'src/components/SiteShell.tsx',
      'src/lib/content-taxonomy.ts',
    ]);

    expect(sources).toContain('aria-label="社交链接"');
    expect(sources).toContain('aria-label="内容归档"');
    expect(sources).toContain('aria-label="搜索关键词"');
    expect(sources).toContain('aria-label="站内搜索"');
    expect(sources).toContain('<form className="search-form" action="/search" role="search" aria-label="站内搜索">');
    expect(sources).toContain('enterKeyHint="search"');
    expect(sources).toContain('aria-label="所属系列"');
    expect(sources).toContain('aria-label="相邻内容"');
    expect(sources).toContain('ariaLabel="留言内容"');
    expect(sources).toContain('复制代码');
    expect(sources).toContain('已复制');
    expect(sources).toContain('复制失败');
    expect(sources).toContain('button.textContent = defaultCopyLabel;');
    expect(sources).toContain("button.setAttribute('aria-label', defaultCopyAriaLabel);");
    expect(sources).toContain("ariaLabel: '分类'");
    expect(sources).toContain("ariaLabel: '标签'");

    expect(sources).not.toContain('aria-label="Social links"');
    expect(sources).not.toContain('aria-label="Content archive"');
    expect(sources).not.toContain('aria-label="Search query"');
    expect(sources).not.toContain('aria-label="Series"');
    expect(sources).not.toContain('aria-label="Adjacent content"');
    expect(sources).not.toContain('aria-label="Message"');
    expect(sources).not.toContain("'Copy'");
    expect(sources).not.toContain("'Copied'");
    expect(sources).not.toContain("'Failed'");
    expect(sources).not.toContain("ariaLabel: 'Categories'");
    expect(sources).not.toContain("ariaLabel: 'Tags'");
    expect(sources).not.toContain(' home`}');
  });

  test('uses Chinese visible microcopy on public archive and content surfaces', () => {
    const sources = readSources([
      'src/app/about/page.tsx',
      'src/app/archives/page.tsx',
      'src/app/categories/page.tsx',
      'src/app/moments/page.tsx',
      'src/app/posts/page.tsx',
      'src/app/projects/page.tsx',
      'src/app/search/page.tsx',
      'src/app/series/page.tsx',
      'src/app/series/[slug]/page.tsx',
      'src/app/tags/page.tsx',
      'src/components/ContentCard.tsx',
      'src/lib/content-public.ts',
    ]);

    expect(sources).toContain('次喜欢');
    expect(sources).toContain('篇内容');
    expect(sources).toContain('关于');
    expect(sources).toContain('写作');
    expect(sources).toContain('笔记');
    expect(sources).toContain('项目');
    expect(sources).toContain('分类');
    expect(sources).toContain('系列');
    expect(sources).toContain('标签');
    expect(sources).toContain('分钟阅读');

    expect(sources).not.toContain(' views');
    expect(sources).not.toContain(' likes');
    expect(sources).not.toContain('} items</span>');
    expect(sources).not.toContain('category links in total');
    expect(sources).not.toContain('series links in total');
    expect(sources).not.toContain('tag links in total');
    expect(sources).not.toContain('items in total');
    expect(sources).not.toContain('>About<');
    expect(sources).not.toContain('>Writing<');
    expect(sources).not.toContain('>Notes<');
    expect(sources).not.toContain('>Projects<');
    expect(sources).not.toContain('>Archives<');
    expect(sources).not.toContain('>Search<');
    expect(sources).not.toContain('>Moments<');
    expect(sources).not.toContain('>Series<');
    expect(sources).not.toContain('>Categories<');
    expect(sources).not.toContain('>Tags<');
    expect(sources).not.toContain('min read');
  });
});
