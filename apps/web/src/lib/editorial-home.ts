import { getPublicContent } from './content-public';
import type { SiteContentItem } from './content-types';

export function selectEditorialHome(content: SiteContentItem[]) {
  const visible = getPublicContent(content).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return {
    articles: visible.filter(item => item.type === 'post' || item.type === 'note').slice(0, 1),
    projects: visible.filter(item => item.type === 'project').slice(0, 1),
  };
}

export function getHomeArticleHeading(item: Pick<SiteContentItem, 'title' | 'series' | 'type'>) {
  const kicker = item.series?.[0] || (item.type === 'note' ? '笔记' : '文章');
  const match = item.title.match(/^(.+?)[（(]([一二三四五六七八九十\d]+)[）)]\s*[:：]\s*(.+)$/);
  if (!match || !item.series?.includes(match[1]!.trim())) {
    return { title: item.title, kicker, issue: undefined };
  }
  const ordinal = match[2]!;
  const number = /^\d+$/.test(ordinal) ? Number(ordinal) : ordinal.length === 1 ? '一二三四五六七八九十'.indexOf(ordinal) + 1 : 0;
  return { title: match[3]!, kicker: match[1]!.trim(), issue: number ? String(number).padStart(2, '0') : ordinal };
}
