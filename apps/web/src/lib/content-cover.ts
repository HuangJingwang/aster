import type { SiteContentItem } from './content';

export interface ContentCover {
  imageUrl: string;
  altText: string;
  isDefault: boolean;
}

export const DEFAULT_POST_COVER: ContentCover = {
  imageUrl: '/images/default-post-cover.png',
  altText: 'Aster 默认文章封面',
  isDefault: true,
};

export function getContentCover(item: Pick<SiteContentItem, 'type' | 'title' | 'coverImageUrl' | 'coverAltText'>, options: { useDefault?: boolean } = {}): ContentCover | null {
  const coverImageUrl = item.coverImageUrl?.trim();

  if (coverImageUrl) {
    return {
      imageUrl: coverImageUrl,
      altText: item.coverAltText?.trim() || item.title,
      isDefault: false,
    };
  }

  // Social metadata and the separate design preview retain their default asset.
  if (options.useDefault && item.type === 'post') return { ...DEFAULT_POST_COVER, altText: `${item.title} 默认文章封面` };
  return null;
}
