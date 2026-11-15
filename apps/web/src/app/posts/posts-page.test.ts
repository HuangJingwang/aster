import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

describe('posts page', () => {
  test('offers the series index from the article list instead of the global navigation', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/posts/page.tsx'), 'utf8');
    const archiveSource = readFileSync(join(process.cwd(), 'src/components/ContentArchiveMarkup.tsx'), 'utf8');

    expect(source).toContain('browseAriaLabel="文章浏览"');
    expect(source).toContain('browseHref="/series"');
    expect(source).toContain('browseLabel="专题"');
    expect(archiveSource).toContain('export function ContentArchiveActions');
    expect(archiveSource).toContain('aria-label={browseAriaLabel}');
    expect(archiveSource).toContain('href={browseHref}');
    expect(archiveSource).toContain('{browseLabel}');
  });

  test('keeps the article list title from repeating the writing eyebrow', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/posts/page.tsx'), 'utf8');

    expect(source).toContain('<h1>文章</h1>');
    expect(source).not.toContain('<p className="eyebrow">写作</p>');
  });

  test('renders posts as a YYsuni-style grouped archive instead of shared cards', () => {
    const source = readFileSync(join(process.cwd(), 'src/app/posts/page.tsx'), 'utf8');
    const archiveSource = readFileSync(join(process.cwd(), 'src/components/ContentArchiveMarkup.tsx'), 'utf8');

    expect(source).toContain('groupPostsByYear(latestPosts)');
    expect(source).toContain('<SortableContentArchive');
    expect(archiveSource).toContain('className="posts-archive"');
    expect(archiveSource).toContain('className="posts-archive-group"');
    expect(archiveSource).toContain('className="posts-archive-group__heading"');
    expect(archiveSource).toContain('className="posts-archive-item"');
    expect(archiveSource).toContain('className="posts-archive-item__date"');
    expect(archiveSource).toContain('className="posts-archive-item__dot"');
    expect(archiveSource).toContain('className="posts-archive-item__cover-preview"');
    expect(source).toContain('getContentCover(item)');
    expect(source).toContain('getContentTaxonomyLinkGroups(item)');
    expect(source).not.toContain('<ContentCard key={item.id} item={item} />');
  });

  test('keeps posts and notes list routes static by moving query sorting out of the server page', () => {
    const postsSource = readFileSync(join(process.cwd(), 'src/app/posts/page.tsx'), 'utf8');
    const notesSource = readFileSync(join(process.cwd(), 'src/app/notes/page.tsx'), 'utf8');
    const archiveSource = readFileSync(join(process.cwd(), 'src/components/SortableContentArchive.tsx'), 'utf8');

    expect(postsSource).not.toContain('searchParams');
    expect(notesSource).not.toContain('searchParams');
    expect(postsSource).toContain('<ContentArchiveActions');
    expect(postsSource).toContain('<ContentArchiveMarkup groups={latestGroups} contentLabel="文章" />');
    expect(notesSource).toContain('<ContentArchiveActions');
    expect(notesSource).toContain('<ContentArchiveMarkup groups={latestGroups} contentLabel="笔记" />');
    expect(postsSource).toContain("loadSiteContent('article', 'latest')");
    expect(postsSource).toContain("loadSiteContent('article', 'popular')");
    expect(notesSource).toContain("loadSiteContent('note', 'latest')");
    expect(notesSource).toContain("loadSiteContent('note', 'popular')");
    expect(archiveSource).toContain("'use client';");
    expect(archiveSource).toContain("import { useRouter, useSearchParams } from 'next/navigation';");
    expect(archiveSource).toContain("searchParams.get('sort') === 'popular' ? 'popular' : 'latest'");
  });

  test('renders archive taxonomy labels without social hashtag prefixes', () => {
    const postsSource = readFileSync(join(process.cwd(), 'src/app/posts/page.tsx'), 'utf8');
    const notesSource = readFileSync(join(process.cwd(), 'src/app/notes/page.tsx'), 'utf8');
    const archiveSource = readFileSync(join(process.cwd(), 'src/components/ContentArchiveMarkup.tsx'), 'utf8');

    expect(archiveSource).toContain('<span key={taxonomyItem.href}>{taxonomyItem.label}</span>');
    expect(postsSource).not.toContain('<span key={taxonomyItem.href}>#{taxonomyItem.label}</span>');
    expect(notesSource).not.toContain('<span key={taxonomyItem.href}>#{taxonomyItem.label}</span>');
    expect(archiveSource).not.toContain('<span key={taxonomyItem.href}>#{taxonomyItem.label}</span>');
  });
});
