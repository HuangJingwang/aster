import { getContentCover } from '@/lib/content-cover';
import { getPublicContent } from '@/lib/content-public';
import { getContentHref } from '@/lib/content-routing';
import type { SiteContentItem } from '@/lib/content-types';

export interface BlogPreviewEntry {
  cover?: { alt: string; src: string };
  excerpt: string;
  href: string;
  id: string;
  publishedAt: string;
  title: string;
  type: SiteContentItem['type'];
  tags: string[];
}

export function selectPreviewContent(content: SiteContentItem[]) {
  const entries = getPublicContent(content)
    .filter((item) => item.type !== 'page')
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .map((item): BlogPreviewEntry => {
      const cover = getContentCover(item, { useDefault: true });
      return {
        cover: cover ? { alt: cover.altText, src: cover.imageUrl } : undefined,
        excerpt: item.summary?.trim() || '一则正在整理中的公开记录。',
        href: getContentHref(item), id: item.id, publishedAt: item.publishedAt,
        title: item.title, type: item.type, tags: item.tags?.slice(0, 3) ?? [],
      };
    });

  return {
    featuredEntries: entries.filter((entry) => entry.type === 'post' || entry.type === 'note').slice(0, 3),
    galleryEntries: entries.filter((entry) => entry.cover).slice(0, 10),
    recentEntries: entries.slice(0, 5),
    publicCount: entries.length,
    lastPublishedAt: entries[0]?.publishedAt ?? '',
  };
}
