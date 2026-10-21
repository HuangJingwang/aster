'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MarkdownHeading } from '@starry-summer/markdown';

export function ArticleReadingGuide({ headings }: { headings: MarkdownHeading[] }) {
  const [current, setCurrent] = useState(headings[0]?.slug ?? '');
  const [percent, setPercent] = useState(0);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const progress = useRef<HTMLDivElement>(null);
  const mobile = useRef<HTMLDetailsElement>(null);
  useEffect(() => { setPortalTarget(document.body); }, []);
  useEffect(() => {
    let frame = 0;
    const body = document.querySelector('.detail__body');
    const elements = headings.map((heading) => document.getElementById(heading.slug));
    function update() {
      frame = 0;
      const bounds = body?.getBoundingClientRect();
      if (bounds) {
        const fraction = Math.min(1, Math.max(0, (120 - bounds.top) / Math.max(1, bounds.height - window.innerHeight + 200)));
        setPercent(Math.round(fraction * 100));
        if (progress.current) progress.current.style.transform = `scaleX(${fraction})`;
      }
      let active = headings[0]?.slug ?? '';
      elements.forEach((element, index) => { if (element && element.getBoundingClientRect().top <= 155) active = headings[index]!.slug; });
      setCurrent(active);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
    if (body) observer?.observe(body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
    };
  }, [headings, portalTarget]);
  const toc = <nav className="detail-toc" aria-label="文章目录"><p className="eyebrow">ON THIS PAGE</p><ol>{headings.map((heading) => <li key={heading.slug} className={`detail-toc__item detail-toc__item--depth-${heading.depth}`}><a href={`#${heading.slug}`} aria-current={current === heading.slug ? 'location' : undefined} onClick={() => { if (mobile.current) mobile.current.open = false; }}>{heading.text}</a></li>)}</ol></nav>;
  return <>
    {portalTarget && createPortal(
      <div className="journal-chrome journal-reading-progress" aria-hidden="true" ref={progress} style={{ transform: 'scaleX(0)' }} />,
      portalTarget,
    )}
    <aside className="detail-sidebar" aria-label="阅读导览"><div className="journal-reading-label"><span>READING PROGRESS</span><span>{percent}%</span></div>{headings.length > 0 && toc}<a className="journal-reader-home" href="/">✳ Aster.H 的个人博客 ↗</a></aside>
    {headings.length > 0 && <details className="journal-mobile-toc" ref={mobile}><summary>文章目录 <span>{headings.length} 个章节</span></summary>{toc}</details>}
  </>;
}
