import { getPublicContent } from './content-public';
import type { SiteContentItem } from './content-types';

export function selectEditorialHome(content: SiteContentItem[]) {
  const visible = getPublicContent(content).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return {
    articles: visible.filter(item => item.type === 'post' || item.type === 'note').slice(0, 1),
    projects: visible.filter(item => item.type === 'project').slice(0, 1),
  };
}

export { getArticleHeading as getHomeArticleHeading } from './article-heading';
