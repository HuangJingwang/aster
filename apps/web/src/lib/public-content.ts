import type { ContentSourceType, ContentStatus, ContentType, ProjectLinks, ProjectMetadata, ProjectStatus } from '@starry-summer/shared';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getPublicContent, searchContent, seedContent, type ContentSort, type PublicContentKind, type SiteContentItem } from './content';

export interface PublicContentApiRecord {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: ContentStatus;
  visibility?: SiteContentItem['visibility'];
  featured?: boolean;
  pinned?: boolean;
  sourceType?: ContentSourceType;
  sourceUrl?: string;
  coverAssetId?: string;
  coverImageUrl?: string;
  coverThumbnailUrl?: string;
  coverAltText?: string;
  categories?: string[];
  tags?: string[];
  series?: string[];
  bodyMarkdown?: string;
  allowComments?: boolean;
  viewCount?: number;
  likeCount?: number;
  project?: ProjectMetadata;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

export interface PublicContentFilterOptions {
  type?: PublicContentKind;
  sort?: ContentSort;
  query?: string;
}

export interface PublicContentListRequestOptions extends PublicContentFilterOptions {
  apiBaseUrl?: string;
}

export interface PublicContentRequest {
  url: string;
  init: RequestInit & { next?: { revalidate: number } };
}

export interface PublicContentLoadOptions extends PublicContentListRequestOptions {
  fetcher?: (url: string, init: RequestInit) => Promise<Response>;
  timeoutMs?: number;
}

export interface PublicContentLoadResult {
  source: 'api' | 'repository-file' | 'fallback';
  items: SiteContentItem[];
}

export interface RepositoryContentLoadOptions extends PublicContentFilterOptions {
  contentFilePath?: string;
}

const defaultRepositoryContentPath = join(process.cwd(), 'content', 'public-content.json');

interface RepositoryContentFileCache {
  contentFilePath: string;
  signature: string;
  items: SiteContentItem[];
}

let repositoryContentFileCache: RepositoryContentFileCache | null = null;

function dateOnly(value: string | null | undefined): string {
  return value?.slice(0, 10) || '';
}

const validProjectStatuses = new Set<ProjectStatus>(['active', 'paused', 'completed', 'archived']);
const projectLinkKeys: Array<keyof ProjectLinks> = ['website', 'repository', 'demo', 'article'];

export function buildPublicContentListRequest(options: PublicContentListRequestOptions = {}): PublicContentRequest | null {
  const configuredBaseUrl = options.apiBaseUrl?.trim();

  if (!configuredBaseUrl) {
    return null;
  }

  const baseUrl = configuredBaseUrl.replace(/\/$/, '');
  const params = new URLSearchParams();

  if (options.type && options.type !== 'article') {
    params.set('type', options.type);
  }

  if (options.sort && options.sort !== 'latest') {
    params.set('sort', options.sort);
  }

  const queryText = options.query?.trim();

  if (queryText) {
    params.set('q', queryText);
  }

  const query = params.size > 0 ? `?${params.toString()}` : '';

  return {
    url: `${baseUrl}/content${query}`,
    init: {
      method: 'GET',
      next: {
        revalidate: 60,
      },
    },
  };
}

export function normalizePublicContentItem(record: PublicContentApiRecord): SiteContentItem {
  const project = normalizeProjectMetadata(record.project);
  const cover = normalizeCoverMetadata(record);

  return {
    id: record.id,
    title: record.title,
    type: record.type,
    status: record.status,
    visibility: record.visibility ?? 'public',
    publishedAt: dateOnly(record.publishedAt) || dateOnly(record.updatedAt) || dateOnly(record.createdAt),
    updatedAt: dateOnly(record.updatedAt),
    summary: record.summary ?? '',
    seoTitle: record.seoTitle?.trim() || undefined,
    seoDescription: record.seoDescription?.trim() || undefined,
    slug: record.slug,
    featured: record.featured ?? false,
    pinned: record.pinned ?? false,
    sourceType: record.sourceType ?? 'original',
    sourceUrl: record.sourceUrl ?? '',
    ...cover,
    categories: record.categories ?? [],
    tags: record.tags ?? [],
    series: record.series ?? [],
    bodyMarkdown: record.bodyMarkdown ?? '',
    allowComments: record.allowComments ?? true,
    viewCount: record.viewCount ?? 0,
    likeCount: record.likeCount ?? 0,
    ...(project ? { project } : {}),
  };
}

function normalizeCoverMetadata(record: Pick<PublicContentApiRecord, 'coverAssetId' | 'coverImageUrl' | 'coverThumbnailUrl' | 'coverAltText'>): Pick<SiteContentItem, 'coverAssetId' | 'coverImageUrl' | 'coverThumbnailUrl' | 'coverAltText'> {
  const coverAssetId = record.coverAssetId?.trim();
  const coverImageUrl = record.coverImageUrl?.trim();
  const coverThumbnailUrl = record.coverThumbnailUrl?.trim();
  const coverAltText = record.coverAltText?.trim();

  return {
    ...(coverAssetId ? { coverAssetId } : {}),
    ...(coverImageUrl ? { coverImageUrl } : {}),
    ...(coverThumbnailUrl ? { coverThumbnailUrl } : {}),
    ...(coverAltText ? { coverAltText } : {}),
  };
}

function normalizeProjectMetadata(project: ProjectMetadata | undefined): ProjectMetadata | undefined {
  if (!project) {
    return undefined;
  }

  const normalized: ProjectMetadata = {};
  const links = normalizeProjectLinks(project.links);
  const stack = project.stack?.map((item) => item.trim()).filter(Boolean) ?? [];

  if (validProjectStatuses.has(project.status as ProjectStatus)) {
    normalized.status = project.status;
  }

  if (links) {
    normalized.links = links;
  }

  if (stack.length > 0) {
    normalized.stack = stack;
  }

  if (project.startedAt) {
    normalized.startedAt = project.startedAt.slice(0, 10);
  }

  if (project.endedAt) {
    normalized.endedAt = project.endedAt.slice(0, 10);
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeProjectLinks(links: ProjectLinks | undefined): ProjectLinks | undefined {
  if (!links) {
    return undefined;
  }

  const normalized: ProjectLinks = {};

  for (const key of projectLinkKeys) {
    const value = links[key]?.trim();

    if (value) {
      normalized[key] = value;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export async function loadPublicContentItems(
  fallbackItems: SiteContentItem[],
  options: PublicContentLoadOptions = {},
): Promise<PublicContentLoadResult> {
  if (!options.fetcher && !options.apiBaseUrl && typeof window === 'undefined') {
    return { source: 'fallback', items: getFallbackPublicContent(fallbackItems, options) };
  }

  const request = buildPublicContentListRequest(options);

  if (!request) {
    return { source: 'fallback', items: getFallbackPublicContent(fallbackItems, options) };
  }

  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 1_500);

  try {
    const response = await fetcher(request.url, { ...request.init, signal: controller.signal });

    if (!response.ok) {
      return { source: 'fallback', items: getFallbackPublicContent(fallbackItems, options) };
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      return { source: 'fallback', items: getFallbackPublicContent(fallbackItems, options) };
    }

    return {
      source: 'api',
      items: getPublicContent(data.map((item) => normalizePublicContentItem(item as PublicContentApiRecord)), options.type, options.sort),
    };
  } catch {
    return { source: 'fallback', items: getFallbackPublicContent(fallbackItems, options) };
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadRepositoryContentItems(options: RepositoryContentLoadOptions = {}): Promise<PublicContentLoadResult> {
  try {
    const content = readRepositoryContentFile(options.contentFilePath ?? defaultRepositoryContentPath);

    return {
      source: 'repository-file',
      items: filterPublicContent(content, options),
    };
  } catch {
    return {
      source: 'fallback',
      items: getFallbackPublicContent(seedContent, options),
    };
  }
}

export function readRepositoryContentFile(contentFilePath = defaultRepositoryContentPath): SiteContentItem[] {
  const signature = getFileSignature(contentFilePath);

  if (
    repositoryContentFileCache &&
    repositoryContentFileCache.contentFilePath === contentFilePath &&
    repositoryContentFileCache.signature === signature
  ) {
    return repositoryContentFileCache.items;
  }

  const data = JSON.parse(readFileSync(contentFilePath, 'utf8')) as unknown;

  if (!Array.isArray(data)) {
    throw new Error('Repository content file must contain an array of public content records.');
  }

  const items = data.map((item) => normalizeRepositoryContentItem(item));

  repositoryContentFileCache = {
    contentFilePath,
    signature,
    items,
  };

  return items;
}

function getFileSignature(filePath: string): string {
  const stats = statSync(filePath);

  return `${stats.mtimeMs}:${stats.size}`;
}

function getFallbackPublicContent(items: SiteContentItem[], options: PublicContentFilterOptions): SiteContentItem[] {
  return filterPublicContent(items, options);
}

function filterPublicContent(items: SiteContentItem[], options: PublicContentFilterOptions): SiteContentItem[] {
  const publicItems = getPublicContent(items, options.type, options.sort);
  const query = options.query?.trim();

  return query ? searchContent(publicItems, query) : publicItems;
}

export async function loadSiteContent(type?: PublicContentKind, sort?: ContentSort, query?: string): Promise<SiteContentItem[]> {
  return (await loadRepositoryContentItems({ type, sort, query })).items;
}

function normalizeRepositoryContentItem(record: unknown): SiteContentItem {
  const item = record as Partial<SiteContentItem>;

  if (!item.id || !item.title || !item.type || !item.status || !item.visibility || !item.publishedAt) {
    throw new Error('Repository content records require id, title, type, status, visibility, and publishedAt.');
  }

  return {
    ...item,
    id: item.id,
    title: item.title,
    type: item.type,
    status: item.status,
    visibility: item.visibility,
    publishedAt: dateOnly(item.publishedAt),
    updatedAt: dateOnly(item.updatedAt),
    summary: item.summary ?? '',
    slug: item.slug ?? item.id,
    bodyMarkdown: item.bodyMarkdown ?? '',
    categories: item.categories ?? [],
    tags: item.tags ?? [],
    series: item.series ?? [],
    allowComments: item.allowComments ?? true,
    viewCount: item.viewCount ?? 0,
    likeCount: item.likeCount ?? 0,
    featured: item.featured ?? false,
    pinned: item.pinned ?? false,
    sourceType: item.sourceType ?? 'original',
    sourceUrl: item.sourceUrl ?? '',
    project: normalizeProjectMetadata(item.project),
  };
}
