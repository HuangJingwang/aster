'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PointerEvent } from 'react';
import { getRecommendationKind } from '@/lib/recommendation-filter';
import type { RecommendedShare } from '@/lib/recommended-shares';

const recommendationKindLabels = {
  website: '网站',
  opensource: '开源项目',
  article: '转载文章',
} as const;

export function RecommendationCard({ resource, animated = false, index = 0 }: { resource: RecommendedShare; animated?: boolean; index?: number }) {
  const reduced = useReducedMotion();
  const kind = getRecommendationKind(resource);
  function spotlight(event: PointerEvent<HTMLAnchorElement>) {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }
  return <motion.a className={`resource-card${animated ? ' reader-resource-card' : ''}`} href={resource.url} target="_blank" rel="noopener noreferrer" onPointerMove={spotlight}
    layout={animated && !reduced ? 'position' : false}
    initial={animated && !reduced ? { y: 24 } : false}
    whileInView={animated && !reduced ? { y: 0 } : undefined}
    viewport={{ once: true, amount: .1 }}
    transition={{ layout: { type: 'spring', stiffness: 340, damping: 34 }, y: { duration: .5, delay: (index % 3) * .06, ease: [.2, .75, .2, 1] } }}>
    <span className="resource-card__top">
      <span className="resource-card__logo">{resource.avatarSrc ? <img src={resource.avatarSrc} alt="" width="44" height="44" loading="lazy" /> : resource.logo}</span>
      <span className="resource-card__kind">{recommendationKindLabels[kind]}</span>
      <ArrowUpRight size={18} aria-hidden="true" />
    </span>
    <strong>{resource.name}</strong>
    {resource.attribution && <span className="resource-card__attribution">{resource.attribution}</span>}
    <span className="resource-card__description">{resource.description}</span>
    <span className="resource-card__tags">{resource.tags.filter(tag => tag !== '开源项目').map(tag => <span key={tag}>{tag}</span>)}</span>
    <span className="resource-card__rating">推荐等级 {resource.stars}/5{resource.githubStars != null && <span>GitHub ★ {Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(resource.githubStars)}（缓存）</span>}</span>
    <span className="sr-only">（在新标签页打开）</span>
  </motion.a>;
}
