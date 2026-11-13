import { getPublicContent } from './content-public';
import type { SiteContentItem } from './content-types';

export interface HomeVideoFeature {
  item: SiteContentItem;
  posterUrl: string;
  durationLabel: string;
}

export function selectEditorialHome(content: SiteContentItem[]) {
  const visible = getPublicContent(content).slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const video = visible.find(item => item.type === 'post' && item.id === 'moment-mina-meeting-video');
  const featuredVideo: HomeVideoFeature | null = video ? {
    item: video,
    posterUrl: '/images/mina-meeting-video.webp',
    durationLabel: '1 分 35 秒',
  } : null;
  return {
    articles: visible.filter(item => item.type === 'post' || item.type === 'note').slice(0, 4),
    projects: visible.filter(item => item.type === 'project'),
    featuredVideo,
  };
}
