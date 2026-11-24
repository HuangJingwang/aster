'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Search, X } from 'lucide-react';
import { buildArchiveSortHref, filterArchive } from '@/lib/archive-filter';

import {
  ContentArchiveActions,
  ContentArchiveMarkup,
  type SortableArchiveGroup,
} from '@/components/ContentArchiveMarkup';

export type { SortableArchiveGroup };

interface SortableContentArchiveProps {
  latestGroups: SortableArchiveGroup[];
  popularGroups: SortableArchiveGroup[];
  contentLabel: string;
  sortAriaLabel: string;
  browseAriaLabel: string;
  browseHref: string;
  browseLabel: string;
  baseHref: string;
}

export function SortableContentArchive({
  latestGroups,
  popularGroups,
  contentLabel,
  sortAriaLabel,
  browseAriaLabel,
  browseHref,
  browseLabel,
  baseHref,
}: SortableContentArchiveProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = searchParams.get('sort') === 'popular' ? 'popular' : 'latest';
  const groups = sort === 'popular' ? popularGroups : latestGroups;
  const query = searchParams.get('q') ?? '';
  const tag = searchParams.get('tag') ?? '';
  const result = filterArchive(groups, { query, tag });
  const tagCounts = new Map<string, number>();
  for (const item of latestGroups.flatMap(group => group.items)) {
    for (const label of new Set(item.taxonomyItems.map(t => t.label))) tagCounts.set(label, (tagCounts.get(label) ?? 0) + 1);
  }
  const tags = [...tagCounts.keys()].sort((a, b) => tagCounts.get(b)! - tagCounts.get(a)! || a.localeCompare(b, 'zh-CN'));
  const filterHref = (nextQuery: string, nextTag: string) => buildArchiveSortHref(baseHref, sort, nextQuery, nextTag);

  return (
    <>
      <div className="archive-toolbar">
        <div className="archive-toolbar__top">
          <ContentArchiveActions
            query={query}
            tag={tag}
            sort={sort}
            sortAriaLabel={sortAriaLabel}
            browseAriaLabel={browseAriaLabel}
            browseHref={browseHref}
            browseLabel={browseLabel}
            baseHref={baseHref}
          />
          <form className="archive-search" role="search" aria-label={`搜索${contentLabel}`} action={baseHref} key={`${query}:${tag}:${sort}`} onSubmit={event => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get('q') ?? '').trim();
            router.push(filterHref(value, tag), { scroll: false });
          }}>
            <Search size={16} aria-hidden="true" />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="tag" value={tag} />
            <input type="search" name="q" aria-label={`搜索${contentLabel}`} defaultValue={query} placeholder={`搜索${contentLabel}…`} />
            <button type="submit" aria-label="提交搜索"><ArrowRight size={16} aria-hidden="true" /></button>
          </form>
        </div>
        {tags.length > 0 && <div className="archive-toolbar__topics">
          <span className="archive-topic-label">按主题阅读</span>
          <div className="archive-more-topics">
            <select aria-label="选择主题" value={tag} onChange={event => router.push(filterHref(query, event.target.value), { scroll: false })}>
              <option value="">全部主题</option>
              {tag && !tagCounts.has(tag) && <option value={tag}>{tag}</option>}
              {tags.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <ChevronDown size={13} aria-hidden="true" />
          </div>
        </div>}
        <div className="archive-toolbar__results">
          <p role="status">{query || tag ? '找到 ' : ''}{result.total} 篇{contentLabel}{query && <span> · “{query}”</span>}</p>
          {(query || tag) && <Link href={filterHref('', '')} scroll={false} aria-label="清除搜索和主题筛选"><X size={12} aria-hidden="true" />重置</Link>}
        </div>
      </div>
      {result.total ? (
        <ContinuousArchive key={`${baseHref}:${sort}:${query}:${tag}`} groups={result.groups} total={result.total} contentLabel={contentLabel} />
      ) : <p className="editorial-empty">没有找到相关{contentLabel}，试试其他关键词。</p>}
    </>
  );
}

function ContinuousArchive({ groups, total, contentLabel }: { groups: SortableArchiveGroup[]; total: number; contentLabel: string }) {
  const [limit, setLimit] = useState(12);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = limit < total;
  const loadMore = () => setLimit(current => Math.min(current + 12, total));
  let remaining = limit;
  const visibleGroups = groups.flatMap(group => {
    const items = group.items.slice(0, Math.max(0, remaining));
    remaining -= items.length;
    return items.length ? [{ ...group, items }] : [];
  });

  useEffect(() => {
    if (!hasMore || !sentinel.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        // One batch per observation; reconnect after React has appended the rows.
        observer.disconnect();
        setLimit(current => Math.min(current + 12, total));
      }
    }, { rootMargin: '240px 0px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, limit, total]);

  return (
    <>
      <ContentArchiveMarkup groups={visibleGroups} contentLabel={contentLabel} />
      <div className="archive-load-more" ref={sentinel}>
        {hasMore ? <button type="button" onClick={loadMore}>继续阅读 <ArrowRight size={14} aria-hidden="true" /></button> : null}
        <p role="status">{hasMore ? `已展示 ${Math.min(limit, total)} / ${total} 篇${contentLabel} · 向下滚动继续` : `已展示全部 ${total} 篇${contentLabel}`}</p>
      </div>
    </>
  );
}
