import { Suspense } from 'react';
import { formatArchiveDate } from '@/lib/archive-date';

import { ContentArchiveActions, ContentArchiveMarkup } from '@/components/ContentArchiveMarkup';
import { SiteShell } from '@/components/SiteShell';
import { WritingCollectionFeature } from '@/components/WritingCollectionFeature';
import { SortableContentArchive, type SortableArchiveGroup } from '@/components/SortableContentArchive';
import { getContentHref, getContentTaxonomyLinkGroups, type SiteContentItem } from '@/lib/content';
import { getContentCover } from '@/lib/content-cover';
import { loadPublicPageMetadata } from '@/lib/page-metadata';
import { loadSiteContent } from '@/lib/public-content';

export function generateMetadata() {
  return loadPublicPageMetadata({
    title: '笔记',
    description: '更短的记录、阶段性备忘和正在生长的想法。',
    path: '/notes',
  });
}

export default async function NotesPage() {
  const [latestNotes, popularNotes] = await Promise.all([
    loadSiteContent('note', 'latest'),
    loadSiteContent('note', 'popular'),
  ]);
  const latestGroups = groupNotesByYear(latestNotes);
  const popularGroups = groupNotesByYear(popularNotes);

  return (
    <SiteShell>
      <main className="page-main writing-collection writing-collection--notes">
        <header className="writing-intro">
          <div className="writing-intro__copy">
            <p className="writing-intro__edition">02 <span /> FIELD NOTES</p>
            <h1>笔记</h1>
            <p className="writing-intro__description">还没写成长文的发现，<br />和留给以后自己的线索。</p>
            <div className="writing-intro__links"><a href="#writing-list">翻阅笔记 <span aria-hidden="true">↓</span></a><a href="/posts">阅读文章 ↗</a></div>
          </div>
          <WritingCollectionFeature item={latestNotes[0]} kind="notes" />
        </header>
        <section id="writing-list" className="writing-index" aria-labelledby="writing-list-title">
        <div className="writing-index__heading"><h2 id="writing-list-title">全部笔记</h2><p>{latestNotes.length} 则公开笔记 <span>· 随时记录</span></p></div>
        {latestNotes.length > 0 ? (
        <Suspense
          fallback={
            <>
              <ContentArchiveActions
                sort="latest"
                sortAriaLabel="笔记排序"
                browseAriaLabel="笔记浏览"
                browseHref="/archives"
                browseLabel="归档"
                baseHref="/notes"
              />
              <ContentArchiveMarkup groups={latestGroups} contentLabel="笔记" />
            </>
          }
        >
          <SortableContentArchive
            latestGroups={latestGroups}
            popularGroups={popularGroups}
            contentLabel="笔记"
            sortAriaLabel="笔记排序"
            browseAriaLabel="笔记浏览"
            browseHref="/archives"
            browseLabel="归档"
            baseHref="/notes"
          />
        </Suspense>
        ) : <div className="writing-empty"><span className="writing-empty__mark" aria-hidden="true">＊</span><div><h3>笔记还在慢慢积累</h3><p>先看看已经整理好的文章吧。</p><a href="/posts">去读文章 ↗</a></div></div>}
        </section>
      </main>
    </SiteShell>
  );
}

function groupNotesByYear(notes: SiteContentItem[]): SortableArchiveGroup[] {
  const groups = new Map<string, SortableArchiveGroup['items']>();

  for (const note of notes) {
    const year = note.publishedAt.slice(0, 4) || '未知';
    groups.set(year, [...(groups.get(year) ?? []), toArchiveItem(note)]);
  }

  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
    .map(([year, items]) => ({ year, items }));
}

function toArchiveItem(item: SiteContentItem): SortableArchiveGroup['items'][number] {
  const cover = getContentCover(item);
  const taxonomyItems = getContentTaxonomyLinkGroups(item).flatMap((taxonomyGroup) => taxonomyGroup.items);

  return {
    id: item.id,
    href: getContentHref(item),
    dateLabel: formatArchiveDate(item.publishedAt),
    dateTime: item.publishedAt,
    title: item.title,
    excerpt: item.summary,
    pinned: Boolean(item.pinned),
    taxonomyItems,
    statsLabel: `${item.viewCount ?? 0} 浏览 · ${item.likeCount ?? 0} 喜欢`,
    ...(cover ? { cover: { imageUrl: cover.imageUrl } } : {}),
  };
}
