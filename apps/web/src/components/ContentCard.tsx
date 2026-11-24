import { EditorialImage } from './EditorialImage';
import Link from 'next/link';

import type { SiteContentItem } from '@/lib/content';
import { formatPublicContentType, getContentHref, getSeriesHref } from '@/lib/content';
import { getContentCover } from '@/lib/content-cover';

export function ContentCard({ item }: { item: SiteContentItem }) {
  const cover = getContentCover(item);

  return (
    <article className="content-card">
      {cover ? (
        <Link className="content-card__cover" href={getContentHref(item)}>
          <EditorialImage src={cover.imageUrl} alt={cover.altText} loading="lazy" decoding="async" />
        </Link>
      ) : null}
      <div className="content-card__meta">
        <span>
          {item.pinned ? <span className="content-card__pin">置顶</span> : null}
          {formatPublicContentType(item.type)}
        </span>
        <time dateTime={item.publishedAt}>{item.publishedAt}</time>
      </div>
      <h3>
        <Link href={getContentHref(item)}>{item.title}</Link>
      </h3>
      <p>{item.summary}</p>
      {item.series && item.series.length > 0 ? (
        <div className="content-card__series" aria-label="所属系列">
          {item.series.slice(0, 2).map((series) => (
            <Link key={series} href={getSeriesHref(series)}>
              {series}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="content-card__footer">
        <span>{item.likeCount ?? 0} 次喜欢</span>
      </div>
    </article>
  );
}
