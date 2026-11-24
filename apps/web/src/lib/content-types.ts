import type { ContentSourceType, ContentStatus, ContentType, ContentVisibility, ProjectMetadata } from '@starry-summer/shared';

export interface SiteContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  publishedAt: string;
  updatedAt?: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  bodyMarkdown?: string;
  sourceType?: ContentSourceType;
  sourceUrl?: string;
  coverAssetId?: string;
  coverImageUrl?: string;
  coverThumbnailUrl?: string;
  coverAltText?: string;
  slug?: string;
  featured?: boolean;
  categories?: string[];
  tags?: string[];
  series?: string[];
  viewCount?: number;
  likeCount?: number;
  allowComments?: boolean;
  pinned?: boolean;
  project?: ProjectMetadata;
}

export interface ContentArchiveGroup {
  key: string;
  label: string;
  items: SiteContentItem[];
}

export interface ContentCategoryGroup {
  key: string;
  label: string;
  items: SiteContentItem[];
}

export interface ContentSeriesGroup {
  key: string;
  label: string;
  items: SiteContentItem[];
}

export interface ContentTagGroup {
  key: string;
  label: string;
  items: SiteContentItem[];
}

export interface AdjacentContent {
  previous: SiteContentItem | null;
  next: SiteContentItem | null;
}

export interface ContentTaxonomyGroup {
  label: string;
  ariaLabel: string;
  items: string[];
}

export interface ContentTaxonomyLinkGroup {
  label: string;
  ariaLabel: string;
  items: Array<{
    label: string;
    href: string;
  }>;
}

export interface SiteStats {
  publicCount: number;
  totalViews: number;
  totalLikes: number;
  lastPublishedAt: string;
}

export interface PopularContentOptions {
  excludeIds?: string[];
  limit?: number;
}

export type ContentSort = 'latest' | 'popular';
export type PublicContentKind = ContentType | 'article';
