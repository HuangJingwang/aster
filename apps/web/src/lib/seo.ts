import type { Metadata } from 'next';

import { getContentHref, groupContentByCategory, groupContentBySeries, groupContentByTag, type SiteContentItem } from './content';
import { getContentCover } from './content-cover';
import type { SiteSettings } from './settings';

const defaultSiteUrl = 'http://localhost:3000';

export function normalizePublicSiteUrl(value: string | undefined): string {
  const normalized = normalizeOptionalPublicSiteUrl(value);

  return normalized ?? defaultSiteUrl;
}

export interface PublicSiteUrlOptions {
  configuredUrl?: string;
  productionHost?: string;
}

export function resolvePublicSiteUrl({ configuredUrl, productionHost }: PublicSiteUrlOptions): string {
  const normalizedConfiguredUrl = normalizeOptionalPublicSiteUrl(configuredUrl);

  if (normalizedConfiguredUrl && !isVercelDeploymentUrl(normalizedConfiguredUrl)) {
    return normalizedConfiguredUrl;
  }

  const normalizedProductionUrl = normalizeOptionalPublicSiteUrl(productionHost);

  if (normalizedProductionUrl) {
    return normalizedProductionUrl;
  }

  return normalizedConfiguredUrl ?? defaultSiteUrl;
}

export function buildRobotsText(siteUrl: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    `Sitemap: ${normalizePublicSiteUrl(siteUrl)}/sitemap.xml`,
    '',
  ].join('\n');
}

export function buildSiteMetadata(settings: SiteSettings, siteUrl: string): Metadata {
  const url = normalizePublicSiteUrl(siteUrl);

  return {
    title: settings.profile.title,
    description: settings.profile.description,
    metadataBase: new URL(url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: settings.profile.title,
      description: settings.profile.description,
      url,
      siteName: settings.profile.title,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.profile.title,
      description: settings.profile.description,
    },
  };
}

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

export function buildPageMetadata(input: PageMetadataInput, settings: SiteSettings, siteUrl: string): Metadata {
  const publicSiteUrl = normalizePublicSiteUrl(siteUrl);
  const path = normalizePagePath(input.path);
  const url = `${publicSiteUrl}${path}`;

  return {
    title: `${input.title} | ${settings.profile.title}`,
    description: input.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: settings.profile.title,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
    },
  };
}

export function buildContentMetadata(item: SiteContentItem, settings: SiteSettings, siteUrl: string): Metadata {
  const href = getContentHref(item);
  const publicSiteUrl = normalizePublicSiteUrl(siteUrl);
  const url = `${publicSiteUrl}${href}`;
  const socialTitle = item.seoTitle?.trim() || item.title;
  const metadataTitle = item.seoTitle?.trim() || `${item.title} | ${settings.profile.title}`;
  const description = item.seoDescription?.trim() || item.summary || settings.profile.description;
  const cover = getContentCover(item, { useDefault: true });
  const coverImageUrl = normalizeMetadataImageUrl(cover?.imageUrl, publicSiteUrl);

  return {
    title: metadataTitle,
    description,
    alternates: {
      canonical: href,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: settings.profile.title,
      type: 'article',
      publishedTime: item.publishedAt,
      ...(item.updatedAt ? { modifiedTime: item.updatedAt } : {}),
      tags: item.tags,
      ...(coverImageUrl
        ? {
            images: [
              {
                url: coverImageUrl,
                alt: cover?.altText || item.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      ...(coverImageUrl ? { images: [coverImageUrl] } : {}),
    },
  };
}

export function buildRssXml(settings: SiteSettings, siteUrl: string, content: SiteContentItem[]): string {
  const url = normalizePublicSiteUrl(siteUrl);
  const lastBuildDate = getLatestContentTimestamp(content);
  const items = content
    .map((item) => {
      const href = `${url}${getContentHref(item)}`;

      return [
        '<item>',
        `<title><![CDATA[${escapeCdata(item.title)}]]></title>`,
        `<link>${escapeXml(href)}</link>`,
        `<guid>${escapeXml(href)}</guid>`,
        `<pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>`,
        `<description><![CDATA[${escapeCdata(item.summary ?? '')}]]></description>`,
        '</item>',
      ].join('');
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8" ?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title><![CDATA[${escapeCdata(settings.profile.title)}]]></title>`,
    `<link>${escapeXml(url)}</link>`,
    `<description><![CDATA[${escapeCdata(settings.profile.description)}]]></description>`,
    `<atom:link href="${escapeXml(`${url}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    lastBuildDate ? `<lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>` : '',
    items,
    '</channel>',
    '</rss>',
  ].join('');
}

function getLatestContentTimestamp(content: SiteContentItem[]): string {
  return content
    .map((item) => item.updatedAt || item.publishedAt)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0] ?? '';
}

export function buildSitemapXml(siteUrl: string, content: SiteContentItem[]): string {
  const url = normalizePublicSiteUrl(siteUrl);
  const staticRoutes = ['', 'posts', 'moments', 'projects', 'series', 'categories', 'tags', 'archives', 'about', 'search'];
  const contentRouteMetadata = new Map(content.map((item) => [getContentHref(item).slice(1), item.updatedAt || item.publishedAt]));
  const contentRoutes = [...contentRouteMetadata.keys()];
  const categoryRoutes = groupContentByCategory(content).map((group) => `categories/${group.key}`);
  const seriesRoutes = groupContentBySeries(content).map((group) => `series/${group.key}`);
  const tagRoutes = groupContentByTag(content).map((group) => `tags/${group.key}`);
  const routes = [...new Set([...staticRoutes, ...contentRoutes, ...categoryRoutes, ...seriesRoutes, ...tagRoutes])];
  const urls = routes
    .map((route) => {
      const loc = route ? `${url}/${route}` : url;
      const lastmod = contentRouteMetadata.get(route);

      return `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" ?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCdata(value: string): string {
  return value.replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function normalizeMetadataImageUrl(imageUrl: string | undefined, siteUrl: string): string | undefined {
  const normalized = imageUrl?.trim();

  if (!normalized) {
    return undefined;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${normalizePublicSiteUrl(siteUrl)}/${normalized.replace(/^\/+/, '')}`;
}

function normalizePagePath(path: string): string {
  const normalized = path.trim();

  if (!normalized || normalized === '/') {
    return '/';
  }

  return `/${normalized.replace(/^\/+|\/+$/g, '')}`;
}

function normalizeOptionalPublicSiteUrl(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\/+$/, '');

  if (!normalized) {
    return undefined;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (isLocalHostname(normalized)) {
    return `http://${normalized}`;
  }

  return `https://${normalized}`;
}

function isLocalHostname(value: string): boolean {
  return /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i.test(value);
}

function isVercelDeploymentUrl(value: string): boolean {
  try {
    return new URL(value).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}
