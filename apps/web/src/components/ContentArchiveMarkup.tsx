import { EditorialImage } from './EditorialImage';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { buildArchiveSortHref } from '@/lib/archive-filter';

export interface SortableArchiveItem {
  id: string;
  href: string;
  dateLabel: string;
  dateTime: string;
  title: string;
  excerpt?: string;
  pinned: boolean;
  taxonomyItems: Array<{ href: string; label: string }>;
  statsLabel: string;
  cover?: { imageUrl: string };
}

export interface SortableArchiveGroup {
  year: string;
  items: SortableArchiveItem[];
}

interface ContentArchiveActionsProps {
  query?: string;
  tag?: string;
  sort: 'latest' | 'popular';
  sortAriaLabel: string;
  browseAriaLabel: string;
  browseHref: string;
  browseLabel: string;
  baseHref: string;
}

export function ContentArchiveActions({
  query,
  tag,
  sort,
  sortAriaLabel,
  browseAriaLabel,
  browseHref,
  browseLabel,
  baseHref,
}: ContentArchiveActionsProps) {
  return (
    <div className="posts-page-actions">
      <nav className="sort-tabs" aria-label={sortAriaLabel}>
        <Link href={buildArchiveSortHref(baseHref, 'latest', query, tag)} aria-current={sort === 'latest' ? 'page' : undefined}>
          最新
        </Link>
        <Link href={buildArchiveSortHref(baseHref, 'popular', query, tag)} aria-current={sort === 'popular' ? 'page' : undefined}>
          热门
        </Link>
      </nav>
      <nav className="sort-tabs" aria-label={browseAriaLabel}>
        <Link href={browseHref}>{browseLabel}</Link>
      </nav>
    </div>
  );
}

export function ContentArchiveMarkup({ groups, contentLabel }: { groups: SortableArchiveGroup[]; contentLabel: string }) {
  return (
    <div className="posts-archive">
      {groups.map((group) => (
        <section key={group.year} className="posts-archive-group" aria-label={`${group.year} 年${contentLabel}`}>
          <header className="posts-archive-group__heading">
            <div>
              <h2>{group.year}年</h2>
              <span aria-hidden="true" />
              <p>{group.items.length} 篇{contentLabel}</p>
            </div>
          </header>
          <div className="posts-archive-group__list">
            {group.items.map((item) => (
              <Link key={item.id} className="posts-archive-item" href={item.href}>
                <time className="posts-archive-item__date" dateTime={item.dateTime}>
                  {item.dateLabel}
                </time>
                <span className="posts-archive-item__dot" aria-hidden="true" />
                <span className="posts-archive-item__title">
                  {item.title}
                  {item.pinned ? <span className="posts-archive-item__pin">置顶</span> : null}
                </span>
                {item.excerpt && <span className="posts-archive-item__excerpt">{item.excerpt}</span>}
                <span className="posts-archive-item__tags" aria-label={`${contentLabel}标签`}>
                  {item.taxonomyItems.slice(0, 3).map((taxonomyItem) => (
                    <span key={taxonomyItem.href}>{taxonomyItem.label}</span>
                  ))}
                </span>
                <span className="posts-archive-item__stats" aria-label={`${contentLabel}热度`}>
                  {item.statsLabel}
                </span>
                {item.cover ? (
                  <span className="posts-archive-item__cover-preview" aria-hidden="true">
                    <EditorialImage src={item.cover.imageUrl} alt="" loading="lazy" decoding="async" />
                  </span>
                ) : null}
                <ArrowUpRight aria-hidden="true" className="posts-archive-item__arrow" size={21} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
