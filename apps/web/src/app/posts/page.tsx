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
    title: '文章',
    description: '长文、教程、观点和阶段性复盘。',
    path: '/posts',
  });
}

export default async function PostsPage() {
  const [latestPosts, popularPosts] = await Promise.all([
    loadSiteContent('article', 'latest'),
    loadSiteContent('article', 'popular'),
  ]);
  const latestGroups = groupPostsByYear(latestPosts);
  const popularGroups = groupPostsByYear(popularPosts);

  return (
    <SiteShell>
      <main className="page-main writing-collection writing-collection--posts">
        <header className="writing-intro">
          <div className="writing-intro__copy">
            <p className="writing-intro__edition">01 <span /> JOURNAL</p>
            <h1>文章</h1>
            <p className="writing-intro__description">技术实践、原理探索，<br />以及那些值得认真聊聊的事。</p>
            <div className="writing-intro__links"><a href="#writing-list">浏览文章 <span aria-hidden="true">↓</span></a><a href="/notes">随手笔记 ↗</a></div>
          </div>
          <WritingCollectionFeature item={latestPosts[0]} kind="posts" />
        </header>
        <section id="writing-list" className="writing-index" aria-labelledby="writing-list-title">
        <div className="writing-index__heading"><h2 id="writing-list-title">全部文章</h2><p>{latestPosts.length} 篇公开文章 <span>· 持续更新</span></p></div>
        <Suspense
          fallback={
            <>
              <ContentArchiveActions
                sort="latest"
                sortAriaLabel="文章排序"
                browseAriaLabel="文章浏览"
                browseHref="/series"
                browseLabel="专题"
                baseHref="/posts"
              />
              <ContentArchiveMarkup groups={latestGroups} contentLabel="文章" />
            </>
          }
        >
          <SortableContentArchive
            latestGroups={latestGroups}
            popularGroups={popularGroups}
            contentLabel="文章"
            sortAriaLabel="文章排序"
            browseAriaLabel="文章浏览"
            browseHref="/series"
            browseLabel="专题"
            baseHref="/posts"
          />
        </Suspense>
        </section>
      </main>
    </SiteShell>
  );
}

function groupPostsByYear(posts: SiteContentItem[]): SortableArchiveGroup[] {
  const groups = new Map<string, SortableArchiveGroup['items']>();

  for (const post of posts) {
    const year = post.publishedAt.slice(0, 4) || '未知';
    groups.set(year, [...(groups.get(year) ?? []), toArchiveItem(post)]);
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
    statsLabel: `${item.likeCount ?? 0} 喜欢`,
    ...(cover ? { cover: { imageUrl: cover.imageUrl } } : {}),
  };
}
