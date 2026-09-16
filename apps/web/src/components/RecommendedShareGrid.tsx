'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import type { RecommendedShare } from '@/lib/recommended-shares';
import { categoryOrder } from '@/lib/recommended-shares';
import { filterRecommendations, type RecommendationKind } from '@/lib/recommendation-filter';
import { RecommendationCard } from './RecommendationCard';

type Filters = { query: string; tag: string; kind: RecommendationKind };
const defaults: Filters = { query: '', tag: '全部', kind: 'all' };

export function RecommendedShareGrid({ resources }: { resources: RecommendedShare[] }) {
  const motionId = useId();
  const reduced = useReducedMotion();
  const [filters, setFilters] = useState<Filters>(defaults);
  const availableTags = useMemo(() => {
    const tags = new Set(resources.flatMap(resource => resource.tags));
    return categoryOrder.filter(tag => tag === '全部' || tags.has(tag));
  }, [resources]);
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const kind = params.get('kind');
      const tag = params.get('tag') ?? '全部';
      setFilters({ query: params.get('q') ?? '', tag: availableTags.includes(tag) ? tag : '全部', kind: kind === 'website' || kind === 'opensource' || kind === 'article' ? kind : 'all' });
    }
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [availableTags]);
  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({ q: next.query, tag: next.tag === '全部' ? '' : next.tag, kind: next.kind === 'all' ? '' : next.kind })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url);
  }
  const results = filterRecommendations(resources, filters.query, filters.tag, filters.kind);
  return <LayoutGroup id={motionId}><section className="share-page__panel reader-filter-motion" aria-label="推荐资源">
    <div className="share-page__filters">
      <label className="share-page__search"><span>搜索资源</span><input type="search" value={filters.query} placeholder="搜索名称、标签或简介" onChange={event => update({ query: event.currentTarget.value })} /></label>
      <div className="resource-kind-filter" aria-label="资源类型">{([{ value: 'all', label: '全部资源' }, { value: 'website', label: '网站' }, { value: 'opensource', label: '开源项目' }, { value: 'article', label: '转载文章' }] as const).map(item => <button key={item.value} type="button" aria-pressed={filters.kind === item.value} onClick={() => update({ kind: item.value })}>{filters.kind === item.value && <motion.span aria-hidden="true" className="reader-kind-indicator" layoutId={reduced ? undefined : 'selected-kind'} initial={false} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}{item.label}</button>)}</div>
      <div className="share-page__tag-list" aria-label="资源分类">{availableTags.map(tag => <button key={tag} type="button" aria-pressed={filters.tag === tag} onClick={() => update({ tag })}>{tag}</button>)}</div>
    </div>
    <p className="resource-results" role="status">{results.length} 项资源</p>
    <div className="resource-grid">{results.map((resource, index) => <RecommendationCard key={resource.url} resource={resource} animated index={index} />)}</div>
    {!results.length && <div className="editorial-empty"><p>没有找到相关资源，试试其他关键词。</p><button type="button" onClick={() => update(defaults)}>清除筛选</button></div>}
  </section></LayoutGroup>;
}
